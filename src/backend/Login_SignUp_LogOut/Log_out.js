exports.LogOut = (req, res) => {
    const cookies = req.cookies;
    const sessionId = req.headers['x-session-id']; // FE gửi sessionId lên

    if (!sessionId) {
        return res.status(400).json({ success: false, message: 'Missing sessionId' });
    }

    // Tìm và xóa cookie chứa sessionId của user
    const userCookieKey = Object.keys(cookies).find(key => key.startsWith('user_') && cookies[key].includes(sessionId));
    const authTokenKey = `authToken_${sessionId}`;

    if (userCookieKey) res.clearCookie(userCookieKey, { path: '/' });
    if (cookies[authTokenKey]) res.clearCookie(authTokenKey, { path: '/' });
    // Object.keys(cookies).forEach(cookieName => {
    //     res.clearCookie(cookieName, { path: '/' });
    // });

    res.json({ success: true, message: 'Logged out successfully' });
};