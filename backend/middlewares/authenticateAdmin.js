// creating middleware for collecting and the authenticating admin with admin cookies
const jwt = require('jsonwebtoken');

const authenicateAdmin = async function (req, res, next) {
    const token = req.cookies.admin_access_token;
    if (!token) {
        console.log("No Token provided")
        return res.status(401).json({ message: "No token provided" })
    }

    // verifying the cookie with the 256bit secret string
    await jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN, (error, decoded) => {
        if (error) {
            console.log(error, "token verification failed")
            return res.status(403).json({ message: "Token verification failed" })
        }

        console.log('token succesfully verified')
        req.username = decoded.username
        next()
    })
}
module.exports = authenicateAdmin;