import { useState, useEffect } from 'react';
import api from '../../utils/api';
import LoadingSpinner from '../../components/LoadingSpinner';
import { formatPrice, formatDate } from '../../utils/formatters';
import { useTelegram } from '../../context/TelegramContext';

export default function PaymentVerify() {
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const { WebApp } = useTelegram();

    useEffect(() => {
        fetchPendingPayments();
    }, []);

    const fetchPendingPayments = async () => {
        try {
            const { data } = await api.get('/payments/pending');
            setOrders(data);
        } catch (error) {
            console.error('Error fetching pending payments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (orderId, status) => {
        try {
            WebApp.MainButton.showProgress();
            await api.post(`/payments/${orderId}/verify`, { status });

            // Remove from list
            setOrders(orders.filter(o => o.id !== orderId));
            WebApp.HapticFeedback.notificationOccurred(status === 'paid' ? 'success' : 'error');
        } catch (error) {
            console.error('Error verifying payment:', error);
            WebApp.showPopup({
                title: 'Error',
                message: 'Failed to verify payment',
                buttons: [{ type: 'ok' }]
            });
        } finally {
            WebApp.MainButton.hideProgress();
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <h1 className="text-2xl font-bold mb-6">Pending Payments</h1>

            {loading ? (
                <LoadingSpinner />
            ) : orders.length === 0 ? (
                <div className="text-center text-gray-500 mt-10">
                    No pending payments
                </div>
            ) : (
                <div className="space-y-4">
                    {orders.map(order => (
                        <div key={order.id} className="bg-white p-4 rounded-xl shadow-sm">
                            <div className="flex justify-between items-start mb-3">
                                <div>
                                    <p className="font-bold text-lg">{order.order_number}</p>
                                    <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                                </div>
                                <span className="bg-yellow-100 text-yellow-800 px-2 py-1 rounded-lg text-xs font-medium">
                                    {order.payment_status}
                                </span>
                            </div>

                            <div className="mb-4">
                                <p className="text-2xl font-bold">{formatPrice(order.total_amount)}</p>
                                <p className="text-sm text-gray-600">Phone: {order.phone}</p>
                            </div>

                            {order.payment_screenshot && (
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 mb-1">Screenshot File ID:</p>
                                    <code className="block bg-gray-100 p-2 rounded text-xs break-all">
                                        {order.payment_screenshot}
                                    </code>
                                    {/* Note: Cannot display telegram file_id directly as image without bot API proxy */}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-3">
                                <button
                                    onClick={() => handleVerify(order.id, 'failed')}
                                    className="px-4 py-2 bg-red-50 text-red-600 rounded-lg font-medium"
                                >
                                    Reject
                                </button>
                                <button
                                    onClick={() => handleVerify(order.id, 'paid')}
                                    className="px-4 py-2 bg-green-500 text-white rounded-lg font-medium"
                                >
                                    Confirm
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
