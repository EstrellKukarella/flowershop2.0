const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabase');
const { cacheMiddleware } = require('../middleware/cache');
const { authMiddleware } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');

// Get all products (cached for 5 minutes)
router.get('/', cacheMiddleware(300), async (req, res) => {
    const { category, featured, limit } = req.query;

    let query = supabase
        .from('products')
        .select('*')
        .eq('in_stock', true);

    if (category) {
        query = query.eq('category', category);
    }

    if (featured === 'true') {
        query = query.eq('featured', true);
    }

    if (limit) {
        query = query.limit(parseInt(limit));
    }

    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(data);
});

// Get product details
router.get('/:id', cacheMiddleware(300), async (req, res) => {
    const { id } = req.params;

    const { data: product, error } = await supabase
        .from('products')
        .select(`
      *,
      variants:product_variants(*)
    `)
        .eq('id', id)
        .single();

    if (error) {
        return res.status(404).json({ error: 'Product not found' });
    }

    res.json(product);
});

// Admin: Create product
router.post('/', authMiddleware, adminMiddleware, async (req, res) => {
    const { name, price, category, images, variants } = req.body;

    // Start transaction
    const { data: product, error: productError } = await supabase
        .from('products')
        .insert({ name, price, category, images })
        .select()
        .single();

    if (productError) {
        return res.status(500).json({ error: productError.message });
    }

    if (variants && variants.length > 0) {
        const variantsData = variants.map(v => ({
            product_id: product.id,
            ...v
        }));

        const { error: variantsError } = await supabase
            .from('product_variants')
            .insert(variantsData);

        if (variantsError) {
            // Cleanup product if variants fail (simplified rollback)
            await supabase.from('products').delete().eq('id', product.id);
            return res.status(500).json({ error: variantsError.message });
        }
    }

    res.status(201).json(product);
});

module.exports = router;
