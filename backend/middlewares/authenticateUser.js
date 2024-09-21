const jwt = require('jsonwebtoken');

async function authenticateToken(req, res, next) {
    const token = req.cookies.access_token;

    if (!token) {
        console.log('No token found');
        return res.status(401).json({ message: "Unauthorized: No token provided" });
    }

    jwt.verify(token, process.env.ACCESS_TOKEN, (error, decoded) => {
        if (error) {
            console.log('Token verification failed:', error.message);
            return res.status(403).json({ message: "Forbidden: Invalid token" });
        }
        console.log('Token verified successfully for user:', decoded.username);
        req.username = decoded.username;
        next();
    });
}

module.exports = authenticateToken;