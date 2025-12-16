const crypto = require('crypto');

function validateTelegramWebAppData(telegramInitData) {
    if (!telegramInitData) return false;

    const urlParams = new URLSearchParams(telegramInitData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');

    const dataCheckString = Array.from(urlParams.entries())
        .sort((a, b) => a[0].localeCompare(b[0]))
        .map(([key, value]) => `${key}=${value}`)
        .join('\n');

    const secretKey = crypto.createHmac('sha256', 'WebAppData')
        .update(process.env.BOT_TOKEN)
        .digest();

    const calculatedHash = crypto.createHmac('sha256', secretKey)
        .update(dataCheckString)
        .digest('hex');

    return calculatedHash === hash;
}

function authMiddleware(req, res, next) {
    const initData = req.headers['x-telegram-init-data'];

    if (!initData) {
        return res.status(401).json({ error: 'No authorization data' });
    }

    if (process.env.NODE_ENV === 'development') {
        // Bypass validation in dev if needed, or mock it
        // return next();
    }

    if (!validateTelegramWebAppData(initData)) {
        return res.status(403).json({ error: 'Invalid authorization data' });
    }

    // Parse user data
    const urlParams = new URLSearchParams(initData);
    const user = JSON.parse(urlParams.get('user'));
    req.user = user;

    next();
}

module.exports = { authMiddleware };
