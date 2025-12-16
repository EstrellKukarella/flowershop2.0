const express = require('express');
const router = express.Router();
const { supabase } = require('../utils/supabase');
const { authMiddleware } = require('../middleware/auth');
const { adminMiddleware } = require('../middleware/admin');
const { addCashback } = require('../utils/cashback');
const { bot } = require('../utils/telegram');

// Admin: Get pending payments
router.get('/pending', authMiddleware, adminMiddleware, async (req, res) => {
    const { data: orders, error } = await supabase
        .from('orders')
        .select('*')
        .in('payment_status', ['screenshot_awaited', 'verification'])
        .order('updated_at', { ascending: false });

    if (error) {
        return res.status(500).json({ error: error.message });
    }

    res.json(orders);
});

// Admin: Verify payment
router.post('/:id/verify', authMiddleware, adminMiddleware, async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'paid' or 'failed'

    const { data: order, error } = await supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();

    if (error || !order) {
        return res.status(404).json({ error: 'Order not found' });
    }

    if (status === 'paid') {
        await supabase
            .from('orders')
            .update({
                payment_status: 'paid',
                status: 'confirmed',
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        // Add cashback
        await addCashback(supabase, order.user_id, id, order.total_amount);

        // Notify user
        await bot.sendMessage(order.telegram_id,
            `🎉 Оплата подтверждена!\n\n` +
            `✅ Заказ №${order.order_number} принят в работу\n` +
            `💰 Начислено кэшбэка: ${order.cashback_earned} ₸`
        );

    } else {
        await supabase
            .from('orders')
            .update({
                payment_status: 'failed',
                status: 'cancelled',
                updated_at: new Date().toISOString()
            })
            .eq('id', id);

        // Notify user
        await bot.sendMessage(order.telegram_id,
            `❌ Оплата не подтверждена.\n\n` +
            `Заказ №${order.order_number} отменен.`
        );
    }

    res.json({ success: true });
});

module.exports = router;
