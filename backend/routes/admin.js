const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const cookie_parser = require('cookie-parser');
const bcrypt = require('bcrypt')
const Admin = require('../models/admin');
const mongoose = require('mongoose')
const authenicateAdmin = require('../middlewares/authenticateAdmin');

mongoose.connect("mongodb://localhost/bosTest")
    .then(() => console.log('Connected to the database'))
    .catch((error) => console.error('Database connection error:', error));


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
    const adminName = req.body.adminName;
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

module.exports = router