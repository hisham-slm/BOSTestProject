require('dotenv').config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser = require('cookie-parser');
const app = express();
const Customer = require('./routes/customer');
const Admin = require('./routes/admin');
const socketAdminAuth = require('./middlewares/socketAdminAuth')

const http = require('http')
const server = http.createServer(app)
const { initSocket } = require('./socket')

initSocket(server)

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors({
    origin: 'http://localhost:4321',
    methods: 'GET, POST, PUT, DELETE',
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));


// Database connection
mongoose.connect("mongodb://localhost/bosTest")
.then(() => console.log('Connected to the database'))
.catch((error) => console.error('Database connection error:', error));

app.use('/customer',Customer)
app.use('/admin', Admin)
const User = require('./models/user');


// Routes


app.get('/', (req, res) => {
    res.send('You are at the home page');
});

app.post('/signup', async (req, res) => {
    const { username, email, password } = req.body;
    console.log('Signup attempt:', username, email);

    try {
        const existingUser = await User.findOne({ $or: [{ username }, { email }] });
        if (existingUser) {
            return res.status(400).json({ message: "Username or email already in use!" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({ username, email, password: hashedPassword });
        await newUser.save();

        res.status(201).json({ message: "New user added successfully" });
    } catch (error) {
        console.error('Signup error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt:', username);

    try {
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "Incorrect password" });
        }

        const accessToken = jwt.sign({ username: user.username, user_type : "customer" }, process.env.ACCESS_TOKEN, { expiresIn: '10m' });
        const refreshToken = jwt.sign({ username: user.username , user_type : "customer"}, process.env.REFRESH_TOKEN);

        await User.updateOne({ username }, { $set: { refreshToken } });

        res.cookie('access_token', accessToken, {
            httpOnly: true,
            sameSite: 'None',
            secure : true,
        });

        console.log('Login successful. Cookie set:', res.getHeader('Set-Cookie'));
        res.status(200).json({ message: 'Successfully logged in' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: "Internal server error" });
    }
});

server.listen(3000, () => {
    console.log('Server is listening on port 3000');
});

module.exports = { app } 