const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const bcrypt = require('bcrypt')
const Admin = require('../models/admin');
const authenicateAdmin = require('../middlewares/authenticateAdmin');
const socketAdminAuth = require('../middlewares/socketAdminAuth')
const User = require('../models/user')
router.use(express.json())

router.get('/', async (req, res) => {
    res.status(200).json({ message: 'you are at now admin side' })
})

router.post('/gen_password', authenicateAdmin, async (req, res) => {
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);

    res.status(200).json({ password: hashedPassword })
})

router.post('/login', async (req, res) => {
    const adminName = req.body.admin_name;
    const password = req.body.password;

    const admin = await Admin.findOne({ admin: adminName })
    if (!admin) {
        res.status(401).json({ message: "You are not Admin" });
    } else {
        try {
            const passwordComparison = await bcrypt.compare(password, admin.password)
            console.log(passwordComparison)
            if (!passwordComparison) {
                res.status(401).json({ message: "Wrong Password" })
            } else {
                const admin_access_token = jwt.sign({ admin_name: admin.admin, user_type: 'admin' }, process.env.ADMIN_ACCESS_TOKEN, { expiresIn: '10m' })
                const admin_refresh_token = jwt.sign({ admin_name: admin.admin, user_type: 'admin' }, process.env.ADMIN_REFRESH_TOKEN)
                await Admin.updateOne({ admin_name: admin.admin }, { $set: { admin_refresh_token: admin_refresh_token } })

                res.cookie(
                    'admin_access_token', admin_access_token, {
                    httpOnly: true,
                    sameSite: "None",
                    secure: true
                }
                )
                res.status(200).json({ message: 'Admin login was successfull' })
            }
        } catch (error) {
            res.status(500).json({ message: "Something went wrong in the backend" })
        }
    }
})

router.get('/cart_items', authenicateAdmin, async (req, res) => {
    try {
        const users = await User.find({}).select('username email cart').populate('cart.product')
        const userWithCarts = users.map(user => ({
            username: user.username,
            email: user.email,
            cartItems: user.cart.map((item) => ({
                productId: item.product._id,
                productName: item.product.title,
                price: item.product.price,
                quantity: item.quantity
            }))
        }))

        res.status(200).json({ cartItems: userWithCarts })
    } catch (error) {
        console.log(error)
        res.status(500).json({ message: "Something went wrong in the backed" })
    }
})

module.exports = router