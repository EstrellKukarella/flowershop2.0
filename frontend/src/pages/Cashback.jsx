import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import api from '../utils/api';
import LoadingSpinner from '../components/LoadingSpinner';
import { formatDate } from '../utils/formatters';
import Header from '../components/Header';

export default function Cashback() {
    const [history, setHistory] = useState([]);
    const [balance, setBalance] = useState(0);
    const [loading, setLoading] = useState(true);
    const { t } = useLanguage();

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [userRes, historyRes] = await Promise.all([
                api.get('/users/me'),
                api.get('/users/cashback/history')
            ]);
            setBalance(userRes.data.cashback_balance || 0);
            setHistory(historyRes.data);
        } catch (error) {
            console.error('Error fetching cashback data:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />

            <div className="p-4">
                {/* Balance Card */}
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl p-6 text-white shadow-lg mb-8">
                    <p className="text-green-100 text-sm mb-1">{t('cashback')}</p>
                    <h1 className="text-4xl font-bold mb-4">{balance} ₸</h1>
                    <p className="text-xs text-green-100 opacity-80">
                        Use this balance for your next purchase
                    </p>
                </div>

                <h2 className="font-bold text-lg mb-4">History</h2>

                {loading ? (
                    <LoadingSpinner />
                ) : (
                    <div className="space-y-3">
                        {history.map(item => (
                            <div key={item.id} className="bg-white rounded-xl p-4 shadow-sm flex justify-between items-center">
                                <div>
                                    <p className="font-medium">{item.description}</p>
                                    <p className="text-xs text-gray-500">{formatDate(item.created_at)}</p>
                                </div>
                                <span className={`font-bold ${item.type === 'earned' ? 'text-green-600' : 'text-red-600'}`}>
                                    {item.type === 'earned' ? '+' : '-'}{item.amount} ₸
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
