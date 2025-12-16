import { Link } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from './LanguageSwitcher';
import CashbackBadge from './CashbackBadge';

export default function Header() {
    const { items } = useCart();
    const { t } = useLanguage();

    const cartCount = items.reduce((sum, item) => sum + item.quantity, 0);

    return (
        <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-gray-100">
            <div className="max-w-md mx-auto px-4 h-14 flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Link to="/" className="font-bold text-lg">
                        Fashion Store
                    </Link>
                    <LanguageSwitcher />
                </div>

                <div className="flex items-center gap-3">
                    <CashbackBadge />

                    <Link to="/cart" className="relative p-2">
                        <span className="text-xl">🛒</span>
                        {cartCount > 0 && (
                            <span className="absolute top-0 right-0 bg-red-500 text-white 
                             text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                                {cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>
        </header>
    );
}
