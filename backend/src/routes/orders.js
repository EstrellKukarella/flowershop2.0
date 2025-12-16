const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabase');
const { authMiddleware } = require('../middleware/auth');
const { generateOrderPaymentData } = require('../utils/kaspi');
const { bot } = require('../utils/telegram');
const { getKaspiPaymentInfo } = require('../utils/kaspi');

// Create order
router.post('/', authMiddleware, async (req, res) => {
    const { items, delivery_address, phone, notes } = req.body;
    const user = req.user;

    // Calculate total
    let totalAmount = 0;
    const orderItems = [];

    // Verify items and stock (simplified)
    for (const item of items) {
        const { data: variant } = await supabase
            .from('product_variants')
            .select('*, product:products(name, price, sale_price)')
            .eq('product_id', item.product_id)
            .eq('size', item.size)
            .eq('color', item.color)
            .single();

        if (!variant || variant.stock_quantity < item.quantity) {
            return res.status(400).json({ error: `Item out of stock: ${item.product_name}` });
        }

        const price = variant.product.sale_price || variant.product.price;
        totalAmount += price * item.quantity;

        orderItems.push({
            product_id: item.product_id,
            product_name: variant.product.name,
            size: item.size,
            color: item.color,
            quantity: item.quantity,
            price: price
        });
    }

    // Get or create user
    let { data: dbUser } = await supabase
        .from('users')
        .select('id')
        .eq('telegram_id', user.id)
        .single();

    if (!dbUser) {
        const { data: newUser } = await supabase
            .from('users')
            .insert({
                telegram_id: user.id,
                username: user.username,
                first_name: user.first_name,
                last_name: user.last_name
            })
            .select()
            .single();
        dbUser = newUser;
    }

    // Create order
    const { data: order, error: orderError } = await supabase
        .from('orders')
        .insert({
            user_id: dbUser.id,
            telegram_id: user.id,
            total_amount: totalAmount,
            cashback_earned: Math.round(totalAmount * 0.03),
            delivery_address,
            phone,
            notes
        })
        .select()
        .single();

    if (orderError) {
        return res.status(500).json({ error: orderError.message });
    }

    // Create order items
    const itemsToInsert = orderItems.map(item => ({
        order_id: order.id,
        ...item
    }));

    await supabase.from('order_items').insert(itemsToInsert);

    // Decrease stock
    for (const item of orderItems) {
        await supabase.rpc('decrease_stock', {
            p_product_id: item.product_id,
            p_size: item.size,
            p_color: item.color,
            p_quantity: item.quantity
        });
    }

    // Send Telegram notification with "I paid" button
    try {
        const kaspiInfo = getKaspiPaymentInfo();
        await bot.sendMessage(order.telegram_id,
            '✅ Заказ №' + order.order_number + ' оформлен!\n\n' +
            '💰 Сумма к оплате: ' + order.total_amount + ' ₸\n' +
            '🎁 Вы получите кэшбэк: ' + order.cashback_earned + ' ₸\n\n' +
            '📱 Для оплаты переведите сумму на Kaspi:\n' +
            'Номер: ' + kaspiInfo.phone + '\n' +
            'Комментарий: Заказ ' + order.order_number + '\n\n' +
            'После оплаты нажмите кнопку ниже и отправьте скриншот чека.',
            {
                reply_markup: {
                    inline_keyboard: [[{ text: '✅ Я оплатил', callback_data: 'paid_' + order.id }]]
                }
            }
        );
    } catch (err) {
        console.error('Failed to send Telegram notification:', err);
        // Don't fail the request if notification fails
    }

    res.status(201).json({
        order,
        paymentData: generateOrderPaymentData(order)
    });
});

// Get user orders
router.get('/', authMiddleware, async (req, res) => {
    const user = req.user;

    const { data: orders, error } = await supabase
        .from('orders')
        .select(`
      *,
      items:order_items(*)
    `)
        .eq('telegram_id', user.id)
        .order('created_at', { ascending: false });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(orders);
});

// Get single order
router.get('/:id', authMiddleware, async (req, res) => {
    const { id } = req.params;
    const user = req.user;

    const { data: order, error } = await supabase
        .from('orders')
        .select(`
      *,
      items:order_items(*)
    `)
        .eq('id', id)
        .single();

    if (error || (order.telegram_id !== user.id && !process.env.ADMIN_TELEGRAM_IDS.includes(String(user.id)))) {
        return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
        order,
        paymentData: generateOrderPaymentData(order)
    });
});

module.exports = router;
