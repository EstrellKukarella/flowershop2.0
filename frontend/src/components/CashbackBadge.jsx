import { Link } from 'react-router-dom';
import { useTelegram } from '../context/TelegramContext';
import { useLanguage } from '../context/LanguageContext';
import { useState, useEffect } from 'react';
import api from '../utils/api';

export default function CashbackBadge() {
    const { user } = useTelegram();
    const { t } = useLanguage();
    const [balance, setBalance] = useState(0);

    useEffect(() => {
        if (user) {
            fetchBalance();
        }
    }, [user]);

    const fetchBalance = async () => {
        try {
            const { data } = await api.get('/users/me');
            setBalance(data.cashback_balance || 0);
        } catch (error) {
            console.error('Error fetching cashback:', error);
        }
    };

    if (!user) return null;

    return (
        <Link to="/cashback" className="flex items-center gap-1 bg-green-50 text-green-700 
                                  px-2 py-1 rounded-lg text-xs font-medium border border-green-100">
            <span>🎁</span>
            <span>{balance} ₸</span>
        </Link>
    );
}
