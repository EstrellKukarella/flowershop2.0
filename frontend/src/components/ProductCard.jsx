import { memo } from 'react';
import { optimizeImage } from '../utils/imageOptimizer';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice } from '../utils/formatters';

const ProductCard = memo(({ product, onClick }) => {
    const { language } = useLanguage();

    const displayName = language === 'kk' && product.name_kk
        ? product.name_kk
        : product.name;

    const currentPrice = product.sale_price || product.price;
    const hasDiscount = !!product.sale_price;

    // Optimize first image
    const thumbnailUrl = optimizeImage(product.images?.[0], {
        width: 400,
        quality: 80
    });

    return (
        <div
            onClick={onClick}
            className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md 
                 transition-all duration-300 active:scale-[0.98] cursor-pointer"
        >
            {/* Image with lazy loading */}
            <div className="relative aspect-[3/4] bg-gray-100">
                <img
                    src={thumbnailUrl}
                    alt={displayName}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover"
                />

                {/* Sale badge */}
                {hasDiscount && (
                    <div className="absolute top-2 right-2 bg-red-500 text-white 
                         px-2 py-1 rounded-lg text-xs font-semibold">
                        SALE
                    </div>
                )}
            </div>

            {/* Content */}
            <div className="p-3">
                {/* Brand */}
                {product.brand && (
                    <p className="text-xs text-gray-500 uppercase tracking-wide mb-1">
                        {product.brand}
                    </p>
                )}

                {/* Name */}
                <h3 className="font-semibold text-sm text-gray-900 line-clamp-2 mb-2 min-h-[2.5em]">
                    {displayName}
                </h3>

                {/* Price */}
                <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-base text-black">
                        {formatPrice(currentPrice)}
                    </span>

                    {hasDiscount && (
                        <span className="text-xs text-gray-400 line-through">
                            {formatPrice(product.price)}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;
