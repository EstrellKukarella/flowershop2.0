import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useTelegram } from '../context/TelegramContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';

export default function Checkout() {
    const { items, total, clearCart } = useCart();
    const { t } = useLanguage();
    const { WebApp, user } = useTelegram();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        phone: '',
        address: '',
        notes: ''
    });

    useEffect(() => {
        WebApp.MainButton.setText(t('confirmOrder'));
        WebApp.MainButton.show();
        WebApp.MainButton.onClick(handleSubmit);

        return () => {
            WebApp.MainButton.offClick(handleSubmit);
            WebApp.MainButton.hide();
        };
    }, [formData]);

    const handleSubmit = async () => {
        if (!formData.phone || !formData.address) {
            WebApp.showPopup({
                title: t('error'),
                message: 'Please fill in required fields',
                buttons: [{ type: 'ok' }]
            });
            return;
        }

        setLoading(true);
        WebApp.MainButton.showProgress();

        try {
            const orderItems = items.map(item => ({
                product_id: item.id,
                product_name: item.name,
                size: item.size,
                color: item.color,
                quantity: item.quantity
            }));

            const { data } = await api.post('/orders', {
                items: orderItems,
                delivery_address: formData.address,
                phone: formData.phone,
                notes: formData.notes
            });

            clearCart();
            WebApp.HapticFeedback.notificationOccurred('success');
            navigate(`/payment/${data.order.id}`);
        } catch (error) {
            console.error('Checkout error:', error);
            WebApp.showPopup({
                title: t('error'),
                message: 'Failed to create order',
                buttons: [{ type: 'ok' }]
            });
        } finally {
            setLoading(false);
            WebApp.MainButton.hideProgress();
        }
    };

    if (loading) return <LoadingSpinner fullScreen />;

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-24">
            <h1 className="text-2xl font-bold mb-6">{t('checkout')}</h1>

            <div className="space-y-4">
                {/* Phone */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('phone')} *
                    </label>
                    <input
                        type="tel"
                        value={formData.phone}
                        onChange={e => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full p-3 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-black"
                        placeholder="+7 (7xx) xxx-xx-xx"
                    />
                </div>

                {/* Address */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('deliveryAddress')} *
                    </label>
                    <textarea
                        value={formData.address}
                        onChange={e => setFormData({ ...formData, address: e.target.value })}
                        className="w-full p-3 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-black min-h-[100px]"
                        placeholder="City, Street, House, Apt..."
                    />
                </div>

                {/* Notes */}
                <div className="bg-white p-4 rounded-xl shadow-sm">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        {t('notes')}
                    </label>
                    <textarea
                        value={formData.notes}
                        onChange={e => setFormData({ ...formData, notes: e.target.value })}
                        className="w-full p-3 bg-gray-50 rounded-lg outline-none focus:ring-2 focus:ring-black"
                    />
                </div>
            </div>
        </div>
    );
}
