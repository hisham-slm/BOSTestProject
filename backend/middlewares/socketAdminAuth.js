// creating special middleware for authenticating admin for web socket protocol
const jwt = require('jsonwebtoken')
const socketAdminAuth = (socket, next) => {
    const grabToken = (name) => {
        console.log(`Searching for token: ${name}`);

        if (!socket.handshake.headers.cookie) {
            console.log('No cookies found in headers');
            return null;
        }

        // Get all cookies and split them by ';' to get individual cookies
        const cookies = socket.handshake.headers.cookie.split(';');

        // Iterate over each cookie
        for (let cookie of cookies) {
            // Check if the cookie contains '=' and properly split it
            const [cookieName, ...cookieValueParts] = cookie.split('=').map(part => part.trim());

            if (cookieName === name) {
                const cookieValue = cookieValueParts.join('='); // Handle case when '=' appears inside cookie value
                console.log(`Found token: ${name} = ${cookieValue}`);
                return cookieValue;
            }
        }

        console.log(`Token not found: ${name}`);
        return null;
    }

    const token = grabToken("admin_access_token")
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
