const express = require('express');
const router = express.Router();
const { bot } = require('../utils/telegram');
const { supabase } = require('../utils/supabase');
const { addCashback } = require('../utils/cashback');

router.post('/', async (req, res) => {
    try {
        const { message, callback_query } = req.body;

        // Handle /start command
        if (message?.text === '/start') {
            await bot.sendMessage(message.chat.id,
                '👋 Добро пожаловать в Fashion Store!\n\n' +
                'Нажмите кнопку ниже, чтобы открыть магазин:',
                {
                    reply_markup: {
                        inline_keyboard: [[
                            {
                                text: '🛍️ Открыть магазин',
                                web_app: { url: process.env.FRONTEND_URL }
                            }
                        ]]
                    }
                }
            );
        }

        // Handle "I paid" button
        if (callback_query?.data?.startsWith('paid_')) {
            const orderId = callback_query.data.replace('paid_', '');

            await bot.answerCallbackQuery(callback_query.id);

            await supabase
                .from('orders')
                .update({
                    payment_status: 'screenshot_awaited',
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId);

            await bot.sendMessage(callback_query.message.chat.id,
                '📸 Отлично! Теперь отправьте скриншот чека из Kaspi.\n\n' +
                'Скриншот должен содержать:\n' +
                '✅ Сумму перевода\n' +
                '✅ Дату и время\n' +
                '✅ Номер заказа в комментарии'
            );

            return res.sendStatus(200);
        }

        // Handle screenshot upload
        if (message?.photo && message.photo.length > 0) {
            const userId = message.from.id;
            const photo = message.photo[message.photo.length - 1]; // Largest photo

            // Find pending order for this user
            const { data: orders } = await supabase
                .from('orders')
                .select('*')
                .eq('telegram_id', userId)
                .eq('payment_status', 'screenshot_awaited')
                .order('created_at', { ascending: false })
                .limit(1);

            if (orders && orders.length > 0) {
                const order = orders[0];

                // Save screenshot file_id
                await supabase
                    .from('orders')
                    .update({
                        payment_screenshot: photo.file_id,
                        payment_status: 'verification',
                        updated_at: new Date().toISOString()
                    })
                    .eq('id', order.id);

                await bot.sendMessage(userId,
                    '✅ Чек получен!\n\n' +
                    '⏳ Мы проверим оплату и подтвердим ваш заказ в течение нескольких минут.\n\n' +
                    `После подтверждения вам будет начислено ${order.cashback_earned} ₸ кэшбэка!`
                );

                // Notify admin
                await notifyAdminNewPayment(order, photo.file_id);
            }
        }

        // Handle admin payment confirmation via inline buttons
        if (callback_query?.data?.startsWith('confirm_payment_')) {
            const orderId = callback_query.data.replace('confirm_payment_', '');
            const adminId = callback_query.from.id;

            // Check if user is admin
            const adminIds = process.env.ADMIN_TELEGRAM_IDS.split(',').map(id => parseInt(id));
            if (!adminIds.includes(adminId)) {
                await bot.answerCallbackQuery(callback_query.id, {
                    text: '❌ У вас нет прав администратора',
                    show_alert: true
                });
                return res.sendStatus(200);
            }

            // Update order
            const { data: order } = await supabase
                .from('orders')
                .update({
                    payment_status: 'paid',
                    status: 'confirmed',
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId)
                .select()
                .single();

            if (order) {
                // Add cashback
                await addCashback(supabase, order.user_id, orderId, order.total_amount);

                // Notify customer
                await bot.sendMessage(order.telegram_id,
                    `🎉 Оплата подтверждена!\n\n` +
                    `✅ Заказ №${order.order_number} принят в работу\n` +
                    `💰 Начислено кэшбэка: ${order.cashback_earned} ₸\n\n` +
                    `Спасибо за покупку! Мы скоро с вами свяжемся для уточнения деталей доставки.`
                );

                await bot.answerCallbackQuery(callback_query.id, {
                    text: '✅ Оплата подтверждена',
                    show_alert: true
                });

                // Update admin message
                await bot.editMessageCaption(
                    '✅ ОПЛАТА ПОДТВЕРЖДЕНА\n\n' + callback_query.message.caption,
                    {
                        chat_id: callback_query.message.chat.id,
                        message_id: callback_query.message.message_id
                    }
                );
            }
        }

        // Handle admin payment rejection
        if (callback_query?.data?.startsWith('reject_payment_')) {
            const orderId = callback_query.data.replace('reject_payment_', '');
            const adminId = callback_query.from.id;

            const adminIds = process.env.ADMIN_TELEGRAM_IDS.split(',').map(id => parseInt(id));
            if (!adminIds.includes(adminId)) {
                await bot.answerCallbackQuery(callback_query.id, {
                    text: '❌ У вас нет прав администратора',
                    show_alert: true
                });
                return res.sendStatus(200);
            }

            const { data: order } = await supabase
                .from('orders')
                .update({
                    payment_status: 'failed',
                    status: 'cancelled',
                    updated_at: new Date().toISOString()
                })
                .eq('id', orderId)
                .select()
                .single();

            if (order) {
                await bot.sendMessage(order.telegram_id,
                    `❌ К сожалению, оплата не подтверждена.\n\n` +
                    `Заказ №${order.order_number}\n\n` +
                    `Пожалуйста, проверьте данные платежа и попробуйте снова, ` +
                    `или свяжитесь с нами для уточнения деталей.`
                );

                await bot.answerCallbackQuery(callback_query.id, {
                    text: '❌ Оплата отклонена',
                    show_alert: true
                });

                // Update admin message
                await bot.editMessageCaption(
                    '❌ ОПЛАТА ОТКЛОНЕНА\n\n' + callback_query.message.caption,
                    {
                        chat_id: callback_query.message.chat.id,
                        message_id: callback_query.message.message_id
                    }
                );
            }
        }

        res.sendStatus(200);
    } catch (error) {
        console.error('Webhook error:', error);
        res.sendStatus(500);
    }
});

async function notifyAdminNewPayment(order, photoFileId) {
    const adminIds = process.env.ADMIN_TELEGRAM_IDS.split(',');

    for (const adminId of adminIds) {
        await bot.sendPhoto(adminId, photoFileId, {
            caption:
                `🔔 НОВАЯ ОПЛАТА НА ПРОВЕРКУ\n\n` +
                `Заказ: ${order.order_number}\n` +
                `Сумма: ${order.total_amount} ₸\n` +
                `Клиент: ${order.phone}\n` +
                `Адрес: ${order.delivery_address}\n\n` +
                `Проверьте скриншот чека выше ⬆️`,
            reply_markup: {
                inline_keyboard: [[
                    {
                        text: '✅ Подтвердить',
                        callback_data: `confirm_payment_${order.id}`
                    },
                    {
                        text: '❌ Отклонить',
                        callback_data: `reject_payment_${order.id}`
                    }
                ]]
            }
        });
    }
}

module.exports = router;
