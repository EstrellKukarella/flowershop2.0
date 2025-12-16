// Optimize Supabase Storage images
export function optimizeImage(url, options = {}) {
    if (!url) return '';

    const {
        width = 400,
        quality = 80
    } = options;

    // If Supabase image
    if (url.includes('supabase.co/storage/v1/object/public')) {
        const match = url.match(/\/storage\/v1\/object\/public\/([^/]+)\/(.+)/);
        if (match) {
            const [, bucket, path] = match;
            const baseUrl = url.split('/storage/v1/object/public')[0];
            return baseUrl + '/storage/v1/render/image/public/' + bucket + '/' + path + '?width=' + width + '&quality=' + quality;
        }
    }

    // Return as is for external images or if regex didn't match
    return url;
}

// Preload critical images
export function preloadImage(src) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = src;
    });
}

// Generate responsive image URLs
export function getResponsiveImages(url) {
    return {
        mobile: optimizeImage(url, { width: 400, quality: 80 }),
        tablet: optimizeImage(url, { width: 800, quality: 85 }),
        desktop: optimizeImage(url, { width: 1200, quality: 90 })
    };
}
