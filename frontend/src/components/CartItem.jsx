import { optimizeImage } from '../utils/imageOptimizer';
import { formatPrice } from '../utils/formatters';
import { useLanguage } from '../context/LanguageContext';

export default function CartItem({ item, onUpdateQuantity, onRemove }) {
    const { language } = useLanguage();

    const displayName = language === 'kk' && item.name_kk
        ? item.name_kk
        : item.name;

    const price = item.sale_price || item.price;

    return (
        <div className="flex gap-3 bg-white p-3 rounded-xl mb-3 shadow-sm">
            <img
                src={optimizeImage(item.images?.[0], { width: 200 })}
                alt={displayName}
                className="w-20 h-24 object-cover rounded-lg bg-gray-100"
            />

            <div className="flex-1 flex flex-col justify-between">
                <div>
                    <h3 className="text-sm font-medium line-clamp-2 mb-1">{displayName}</h3>
                    <p className="text-xs text-gray-500">
                        {item.size} / {item.color}
                    </p>
                </div>

                <div className="flex items-center justify-between mt-2">
                    <span className="font-bold text-sm">{formatPrice(price)}</span>

                    <div className="flex items-center gap-3 bg-gray-50 rounded-lg px-2 py-1">
                        <button
                            onClick={() => onUpdateQuantity(item.cartId, item.quantity - 1)}
                            className="text-gray-500 px-1"
                            disabled={item.quantity <= 1}
                        >
                            -
                        </button>
                        <span className="text-sm font-medium w-4 text-center">{item.quantity}</span>
                        <button
                            onClick={() => onUpdateQuantity(item.cartId, item.quantity + 1)}
                            className="text-gray-500 px-1"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            <button
                onClick={() => onRemove(item.cartId)}
                className="text-gray-400 self-start p-1"
            >
                ✕
            </button>
        </div>
    );
}
