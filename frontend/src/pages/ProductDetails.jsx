import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { useTelegram } from '../context/TelegramContext';
import api from '../utils/api';
import { optimizeImage } from '../utils/imageOptimizer';
import { formatPrice } from '../utils/formatters';
import LoadingSpinner from '../components/LoadingSpinner';

export default function ProductDetails() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { addItem } = useCart();
    const { t, language } = useLanguage();
    const { WebApp } = useTelegram();

    const [product, setProduct] = useState(null);
    const [loading, setLoading] = useState(true);
    const [selectedSize, setSelectedSize] = useState(null);
    const [selectedColor, setSelectedColor] = useState(null);
    const [currentImageIndex, setCurrentImageIndex] = useState(0);

    useEffect(() => {
        fetchProduct();
    }, [id]);

    useEffect(() => {
        if (product) {
            // Show MainButton when selection is complete
            if (selectedSize && selectedColor) {
                WebApp.MainButton.setText(t('addToCart'));
                WebApp.MainButton.show();
                WebApp.MainButton.onClick(handleAddToCart);
            } else {
                WebApp.MainButton.hide();
            }
        }
        return () => {
            WebApp.MainButton.offClick(handleAddToCart);
            WebApp.MainButton.hide();
        };
    }, [selectedSize, selectedColor, product]);

    const fetchProduct = async () => {
        try {
            const { data } = await api.get(`/products/${id}`);
            setProduct(data);
        } catch (error) {
            console.error('Error fetching product:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddToCart = () => {
        if (!selectedSize || !selectedColor) return;

        addItem(product, selectedSize, selectedColor);
        WebApp.HapticFeedback.notificationOccurred('success');
        navigate('/cart');
    };

    if (loading) return <LoadingSpinner fullScreen />;
    if (!product) return <div className="p-4 text-center">{t('error')}</div>;

    const displayName = language === 'kk' && product.name_kk ? product.name_kk : product.name;
    const description = language === 'kk' && product.description_kk ? product.description_kk : product.description;
    const price = product.sale_price || product.price;

    // Extract unique sizes and colors from variants
    const sizes = [...new Set(product.variants?.map(v => v.size))];
    const colors = [...new Set(product.variants?.map(v => v.color))];

    return (
        <div className="min-h-screen bg-white pb-24">
            {/* Image Gallery */}
            <div className="relative aspect-[3/4] bg-gray-100">
                <img
                    src={optimizeImage(product.images?.[currentImageIndex], { width: 800 })}
                    alt={displayName}
                    className="w-full h-full object-cover"
                />

                {/* Back Button */}
                <button
                    onClick={() => navigate(-1)}
                    className="absolute top-4 left-4 bg-white/80 backdrop-blur p-2 rounded-full shadow-sm"
                >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                </button>

                {/* Image Dots */}
                {product.images?.length > 1 && (
                    <div className="absolute bottom-4 left-0 right-0 flex justify-center gap-2">
                        {product.images.map((_, idx) => (
                            <button
                                key={idx}
                                onClick={() => setCurrentImageIndex(idx)}
                                className={`w-2 h-2 rounded-full transition-all 
                  ${currentImageIndex === idx ? 'bg-black w-4' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                )}
            </div>

            <div className="p-5">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-2xl font-bold mb-2">{displayName}</h1>
                    <div className="flex items-baseline gap-3">
                        <span className="text-2xl font-bold">{formatPrice(price)}</span>
                        {product.sale_price && (
                            <span className="text-gray-400 line-through text-lg">
                                {formatPrice(product.price)}
                            </span>
                        )}
                    </div>
                </div>

                {/* Selectors */}
                <div className="space-y-6 mb-8">
                    {/* Sizes */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('size')}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {sizes.map(size => (
                                <button
                                    key={size}
                                    onClick={() => setSelectedSize(size)}
                                    className={`min-w-[3rem] px-3 py-2 rounded-lg border text-sm font-medium transition-all
                    ${selectedSize === size
                                            ? 'border-black bg-black text-white'
                                            : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    {size}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Colors */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            {t('color')}
                        </label>
                        <div className="flex flex-wrap gap-2">
                            {colors.map(color => (
                                <button
                                    key={color}
                                    onClick={() => setSelectedColor(color)}
                                    className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all
                    ${selectedColor === color
                                            ? 'border-black bg-black text-white'
                                            : 'border-gray-200 hover:border-gray-300'}`}
                                >
                                    {color}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Description */}
                <div>
                    <h3 className="font-medium mb-2">{t('description')}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed">
                        {description}
                    </p>
                </div>
            </div>
        </div>
    );
}
