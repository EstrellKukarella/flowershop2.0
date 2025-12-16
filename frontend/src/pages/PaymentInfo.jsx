import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function PaymentInfo() {
    const { orderId } = useParams();
    const [order, setOrder] = useState(null);
    const [paymentData, setPaymentData] = useState(null);
    const { WebApp } = useTelegram();
    const { language, t } = useLanguage();

    useEffect(() => {
        fetchOrderAndPaymentInfo();

        // Setup "I Paid" button
        WebApp.MainButton.setText('✅ Я оплатил');
        WebApp.MainButton.show();
        WebApp.MainButton.onClick(handlePaidClick);

        return () => {
            WebApp.MainButton.offClick(handlePaidClick);
            WebApp.MainButton.hide();
        };
    }, [orderId]);

    const fetchOrderAndPaymentInfo = async () => {
        try {
            const { data } = await api.get(`/orders/${orderId}`);
            setOrder(data.order);
            setPaymentData(data.paymentData);
        } catch (error) {
            console.error('Fetch error:', error);
        }
    };

    const handlePaidClick = () => {
        // In a real app, we might notify backend here, but for now we instruct user
        WebApp.showPopup({
            title: 'Подтверждение',
            message: 'Пожалуйста, отправьте скриншот чека в этот чат для подтверждения оплаты.',
            buttons: [{ type: 'ok' }]
        }, () => {
            WebApp.close();
        });
    };

    const handleCopyPhone = () => {
        navigator.clipboard.writeText(paymentData.kaspiPhone);
        WebApp.showPopup({
            title: t('copied'),
            message: t('phoneNumberCopied'),
            buttons: [{ type: 'ok' }]
        });
    };

    if (!order || !paymentData) return <LoadingSpinner fullScreen />;

    const instructions = paymentData.instructions[language] || paymentData.instructions.ru;

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-24">
            <div className="max-w-md mx-auto">
                {/* Success header */}
                <div className="bg-white rounded-2xl p-6 mb-4 text-center shadow-sm">
                    <div className="text-5xl mb-3">✅</div>
                    <h1 className="text-2xl font-bold mb-2 text-gray-900">
                        {t('orderPlaced')}
                    </h1>
                    <p className="text-gray-600">
                        {t('orderNumber')}: {order.order_number}
                    </p>
                </div>

                {/* Payment info */}
                <div className="bg-white rounded-2xl p-6 mb-4 shadow-sm">
                    <h2 className="text-lg font-bold mb-4 text-gray-900">
                        💳 {t('paymentInformation')}
                    </h2>

                    {/* Amount */}
                    <div className="mb-4 p-4 bg-gray-50 rounded-xl">
                        <p className="text-sm text-gray-600 mb-1">
                            {t('totalAmount')}:
                        </p>
                        <p className="text-3xl font-bold text-black">
                            {order.total_amount.toLocaleString()} ₸
                        </p>
                    </div>

                    {/* Kaspi QR */}
                    <div className="mb-4 text-center">
                        <img
                            src={paymentData.qrCodeUrl}
                            alt="Kaspi QR"
                            className="w-64 h-64 mx-auto rounded-xl shadow-lg"
                        />
                    </div>

                    {/* Kaspi phone */}
                    <div className="mb-4">
                        <p className="text-sm text-gray-600 mb-2">
                            {t('kaspiPhone')}:
                        </p>
                        <div className="flex items-center gap-2">
                            <input
                                type="text"
                                value={paymentData.kaspiPhone}
                                readOnly
                                className="flex-1 p-3 bg-gray-50 rounded-xl text-gray-900 font-mono"
                            />
                            <button
                                onClick={handleCopyPhone}
                                className="px-4 py-3 bg-blue-500 text-white rounded-xl font-semibold active:scale-95 transition"
                            >
                                📋
                            </button>
                        </div>
                    </div>

                    {/* Cashback info */}
                    <div className="p-4 bg-green-50 rounded-xl border border-green-200">
                        <p className="text-sm text-green-800">
                            🎁 {t('youWillEarn')} <span className="font-bold">{paymentData.cashbackAmount} ₸</span> {t('cashback')}
                        </p>
                    </div>
                </div>

                {/* Instructions */}
                <div className="bg-white rounded-2xl p-6 shadow-sm">
                    <h3 className="font-bold mb-3 text-gray-900">
                        📱 {t('howToPay')}
                    </h3>
                    <pre className="whitespace-pre-wrap text-sm text-gray-600 font-sans">
                        {instructions}
                    </pre>
                </div>
            </div>
        </div>
    );
}
