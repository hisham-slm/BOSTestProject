// creating special middleware for authenticating admin for web socket protocol
const jwt = require('jsonwebtoken')
const { grabToken } = require('../utils/socketAdminCookieCollector')

const socketAdminAuth = (socket, next) => {
    const token = grabToken(socket, "admin_access_token")
    console.log(token)

    if (!token) {
        const err = new Error("Authentication error");
        return next(err);
    }

    try {
        const decoded = jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN);
        console.log("decoded is ", decoded)
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
