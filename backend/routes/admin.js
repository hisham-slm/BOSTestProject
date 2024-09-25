//intializing the routes
const express = require('express');
const router = express.Router();
router.use(express.json())

//importing wanted libraries
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt')

//importing wanted models 
const Admin = require('../models/admin');
const User = require('../models/user')

//importing authentication middlwares
const authenicateAdmin = require('../middlewares/authenticateAdmin');

//routes
router.get('/', async (req, res) => {
    res.status(200).json({ message: 'you are at now admin side' })
})

router.post('/gen_password', authenicateAdmin, async (req, res) => {
    //generating password for the creating admin with the given password by hashing and salting 
    const password = req.body.password;
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt);

    res.status(200).json({ password: hashedPassword })
})

router.post('/login', async (req, res) => {
    const adminName = req.body.admin_name;
    const password = req.body.password;

    // finding the admin with given parameters
    const admin = await Admin.findOne({ admin: adminName })
    if (!admin) {
        res.status(401).json({ message: "You are not Admin" });
    } else {
        try {
            //comparing and taking required actions for the future admin authentication
            const passwordComparison = await bcrypt.compare(password, admin.password)

            if (!passwordComparison) {
                res.status(401).json({ message: "Wrong Password" })
            } else {
                //creating cookies for the admin 
                const admin_access_token = jwt.sign({ admin_name: admin.admin, user_type: 'admin' }, process.env.ADMIN_ACCESS_TOKEN, { expiresIn: '10m' })
                const admin_refresh_token = jwt.sign({ admin_name: admin.admin, user_type: 'admin' }, process.env.ADMIN_REFRESH_TOKEN)

                //updating admin refresh token 
                await Admin.updateOne({ admin_name: admin.admin }, { $set: { admin_refresh_token: admin_refresh_token } })

                // sending cookie for the admin 
                res.cookie(
                    'admin_access_token', admin_access_token, {
                    httpOnly: false,
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
        
        //collecting and structuring the data 
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

//exporting router to connect with the application
module.exports = router