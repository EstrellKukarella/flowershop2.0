const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabase');
const { authMiddleware } = require('../middleware/auth');

// Get current user profile
router.get('/me', authMiddleware, async (req, res) => {
    const user = req.user;

    const { data: dbUser, error } = await supabase
        .from('users')
        .select('*')
        .eq('telegram_id', user.id)
        .single();

    if (error && error.code !== 'PGRST116') { // Not found error code
        return res.status(500).json({ error: error.message });
    }

    if (!dbUser) {
        // Return basic info if not in DB yet
        return res.json({
            telegram_id: user.id,
            first_name: user.first_name,
            cashback_balance: 0
        });
    }

    res.json(dbUser);
});

// Get cashback history
router.get('/cashback/history', authMiddleware, async (req, res) => {
    const user = req.user;

    const { data: dbUser } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', user.id)
        .single();

    if (!dbUser) return res.json([]);

    const { data: history, error } = await supabase
        .from('cashback_transactions')
        .select('*')
        .eq('user_id', dbUser.id)
        .order('created_at', { ascending: false });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(history);
});

module.exports = router;
