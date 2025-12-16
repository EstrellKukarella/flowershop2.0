function adminMiddleware(req, res, next) {
    const adminIds = process.env.ADMIN_TELEGRAM_IDS.split(',').map(id => parseInt(id));
    const userId = req.user?.id;

    if (!userId || !adminIds.includes(userId)) {
        return res.status(403).json({ error: 'Admin access required' });
    }

    next();
}

module.exports = { adminMiddleware };
