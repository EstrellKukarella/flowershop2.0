export default function SkeletonCard() {
    return (
        <div className="bg-white rounded-2xl overflow-hidden animate-pulse">
            {/* Image skeleton */}
            <div className="aspect-[3/4] bg-gray-200"></div>

            {/* Content skeleton */}
            <div className="p-4 space-y-3">
                {/* Brand */}
                <div className="h-3 bg-gray-200 rounded w-1/4"></div>

                {/* Name */}
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>

                {/* Price */}
                <div className="h-6 bg-gray-200 rounded w-1/3 mt-2"></div>
            </div>
        </div>
    );
}
