import { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import Header from '../components/Header';
import api from '../utils/api';
import { useNavigate } from 'react-router-dom';
import { preloadImage, optimizeImage } from '../utils/imageOptimizer';

export default function Home() {
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [category, setCategory] = useState('all');
    const { t } = useLanguage();
    const navigate = useNavigate();

    useEffect(() => {
        fetchProducts();
    }, [category]);

    const fetchProducts = async () => {
        setLoading(true);
        try {
            const params = category !== 'all' ? { category } : {};
            const { data } = await api.get('/products', { params });
            setProducts(data);

            // Preload first few images
            data.slice(0, 4).forEach(product => {
                if (product.images?.[0]) {
                    preloadImage(optimizeImage(product.images[0], { width: 400 }));
                }
            });
        } catch (error) {
            console.error('Error fetching products:', error);
        } finally {
            setLoading(false);
        }
    };

    const categories = [
        { id: 'all', label: 'All' },
        { id: 'Мужская одежда', label: 'Men' },
        { id: 'Женская одежда', label: 'Women' },
        { id: 'Обувь', label: 'Shoes' },
        { id: 'Аксессуары', label: 'Accessories' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <Header />

            {/* Categories */}
            <div className="sticky top-14 z-40 bg-white/95 backdrop-blur border-b border-gray-100 
                    overflow-x-auto no-scrollbar py-3 px-4 flex gap-2">
                {categories.map(cat => (
                    <button
                        key={cat.id}
                        onClick={() => setCategory(cat.id)}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors
              ${category === cat.id
                                ? 'bg-black text-white'
                                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Product Grid */}
            <main className="p-4">
                {loading ? (
                    <div className="grid grid-cols-2 gap-4">
                        {[...Array(6)].map((_, i) => (
                            <SkeletonCard key={i} />
                        ))}
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {products.map(product => (
                            <ProductCard
                                key={product.id}
                                product={product}
                                onClick={() => navigate(`/product/${product.id}`)}
                            />
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
