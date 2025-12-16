import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useTelegram } from '../context/TelegramContext';
import CartItem from '../components/CartItem';
import { formatPrice } from '../utils/formatters';

export default function Cart() {
    const { items, updateQuantity, removeItem, total } = useCart();
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { WebApp } = useTelegram();

    useEffect(() => {
        if (items.length > 0) {
            WebApp.MainButton.setText(`${t('checkout')} • ${formatPrice(total())}`);
            WebApp.MainButton.show();
            WebApp.MainButton.onClick(() => navigate('/checkout'));
        } else {
            WebApp.MainButton.hide();
        }

        return () => {
            WebApp.MainButton.offClick();
            WebApp.MainButton.hide();
        };
    }, [items, total, t]);

    if (items.length === 0) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-gray-50">
                <div className="text-6xl mb-4">🛒</div>
                <h2 className="text-xl font-bold mb-2">{t('emptyCart')}</h2>
                <button
                    onClick={() => navigate('/')}
                    className="text-blue-500 font-medium"
                >
                    {t('back')}
                </button>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-4 pb-24">
            <h1 className="text-2xl font-bold mb-6">{t('cart')}</h1>

            <div className="space-y-4">
                {items.map(item => (
                    <CartItem
                        key={item.cartId}
                        item={item}
                        onUpdateQuantity={updateQuantity}
                        onRemove={removeItem}
                    />
                ))}
            </div>

            <div className="mt-8 p-4 bg-white rounded-xl shadow-sm">
                <div className="flex justify-between items-center text-lg font-bold">
                    <span>{t('total')}</span>
                    <span>{formatPrice(total())}</span>
                </div>
            </div>
        </div>
    );
}
