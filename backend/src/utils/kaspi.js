// Real Kaspi payment integration - manual verification flow

function getKaspiPaymentInfo() {
    return {
        phone: process.env.KASPI_PHONE,
        qrCodeUrl: process.env.KASPI_QR_URL || '/kaspi-qr.png',
        instructions: {
            ru: `
📱 Как оплатить через Kaspi:

1. Откройте приложение Kaspi
2. Отсканируйте QR-код или переведите на номер: ${process.env.KASPI_PHONE}
3. В комментарии к переводу укажите номер заказа
4. После оплаты нажмите "Я оплатил" в боте
5. Отправьте скриншот чека

После проверки оплаты вам будет начислен кэшбэк!
      `,
            kk: `
📱 Kaspi арқылы төлеу:

1. Kaspi қосымшасын ашыңыз
2. QR кодты сканерлеңіз немесе нөмірге аударыңыз: ${process.env.KASPI_PHONE}
3. Түсініктемеде тапсырыс нөмірін көрсетіңіз
4. Төлегеннен кейін ботта "Мен төледім" басыңыз
5. Чек скриншотын жіберіңіз

Төлем тексерілгеннен кейін кэшбэк есептеледі!
      `
        }
    };
}

function generateOrderPaymentData(order) {
    const kaspiInfo = getKaspiPaymentInfo();

    return {
        orderNumber: order.order_number,
        amount: order.total_amount,
        cashbackAmount: order.cashback_earned,
        kaspiPhone: kaspiInfo.phone,
        qrCodeUrl: kaspiInfo.qrCodeUrl,
        instructions: kaspiInfo.instructions
    };
}

module.exports = {
    getKaspiPaymentInfo,
    generateOrderPaymentData
};
