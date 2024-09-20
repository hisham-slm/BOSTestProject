const jwt = require('jsonwebtoken');

const authenicateAdmin = async function (req, res, next) {
    // console.log(req.headers)
    const token = req.cookies.admin_access_token;
    // console.log(token)
    if (!token) {
        console.log("No Token provided")
        return res.status(401).json({ message: "No token provided" })
    }
    await jwt.verify(token, process.env.ADMIN_ACCESS_TOKEN, (error, decoded) => {
        if (error) {
            console.log(error, "token verification failed")
            return res.status(403).json({ message: "Token verification failed" })
        }

        console.log('token succesfully verified')
        next()
    })
}
module.exports = authenicateAdmin;
