import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate, formatPrice } from '../utils/formatters';
import Header from '../components/Header';

export default function Orders() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        fetchOrders();
    }, []);

    const fetchOrders = async () => {
        try {
            const { data } = await api.get('/orders');
            setOrders(data);
        } catch (error) {
            console.error('Error fetching orders:', error);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'paid': return 'bg-green-100 text-green-800';
            case 'verification': return 'bg-yellow-100 text-yellow-800';
            case 'screenshot_awaited': return 'bg-orange-100 text-orange-800';
            case 'cancelled': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />

            <div className="p-4">
                <h1 className="text-2xl font-bold mb-6">{t('orders')}</h1>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="space-y-4">
                        {orders.map(order => (
                            <div key={order.id} className="bg-white rounded-xl p-4 shadow-sm">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <p className="font-bold text-lg">{order.order_number}</p>
                                        <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                                    </div>
                                    <span className={`px-2 py-1 rounded-lg text-xs font-medium ${getStatusColor(order.payment_status)}`}>
                                        {t(order.payment_status)}
                                    </span>
                                </div>

                                <div className="border-t border-gray-100 pt-3 mt-3">
                                    <div className="flex justify-between items-center">
                                        <span className="text-gray-600">{t('total')}:</span>
                                        <span className="font-bold text-lg">{formatPrice(order.total_amount)}</span>
                                    </div>
                                    {order.cashback_earned > 0 && (
                                        <div className="flex justify-between items-center mt-1 text-sm text-green-600">
                                            <span>{t('cashback')}:</span>
                                            <span>+{order.cashback_earned} ₸</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
