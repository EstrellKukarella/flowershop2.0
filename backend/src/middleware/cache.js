const cache = new Map();

function cacheMiddleware(duration) {
    return (req, res, next) => {
        if (req.method !== 'GET') {
            return next();
        }

        const key = req.originalUrl || req.url;
        const cachedResponse = cache.get(key);

        if (cachedResponse) {
            const { body, timestamp } = cachedResponse;
            if (Date.now() - timestamp < duration * 1000) {
                return res.json(body);
            }
            cache.delete(key);
        }

        res.sendResponse = res.json;
        res.json = (body) => {
            cache.set(key, { body, timestamp: Date.now() });
            res.sendResponse(body);
        };

        next();
    };
}

module.exports = { cacheMiddleware };
