// creating special middleware for authenticating admin for web socket protocol
const jwt = require('jsonwebtoken')
const socketAdminAuth = (socket, next) => {
    const token = socket.handshake.headers.cookie.split("=")[1]

    if (!token) {
        const err = new Error("Authentication error");
        return next(err);
    }

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN);
        console.log("decoded is ",decoded)
        if (decoded.user_type === 'admin') {
            socket.admin = decoded; 
            return next();
        } else {
            throw new Error("Not an admin");
        }
    } catch (err) {
        return next(new Error("Authentication error"));
    }
};

module.exports = socketAdminAuth
