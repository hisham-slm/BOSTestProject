// creating server for websocket protocol
const { Server } = require('socket.io');
const User = require('./models/user')
const socketAdminAuth = require('./middlewares/socketAdminAuth')
let io;

// creating funtion for initializing the websocket server (which is called in server.js)
const initSocket = (server) => {
    // creating server with specifying the cors access
    io = new Server(server, {
        cors: {
            origin: 'http://localhost/4321',
            methods: ['GET', 'POST'],
            credentials: true

        }
    })
    // authenticating admin for websocket protocol
    io.use(socketAdminAuth)

    io.on('connection', (socket) => {
        console.log("Admin connected")

        // sending the data
        socket.on('request-cart-data', async () => {
            console.log('data requested by socket id', socket.id)
            try {
                const users = await User.find({})
                    .select('username email cart')
                    .populate('cart.product');

                const userWithCarts = users.map(user => ({
                    username: user.username,
                    email: user.email,
                    cartItems: user.cart.map(item => ({
                        productId: item.product._id,
                        productName: item.product.title,
                        price: item.product.price,
                        quantity: item.quantity
                    }))
                }));

                // sending the updated data while cart-data is triggerred
                socket.emit('cart-data', { cartItems: userWithCarts });
            } catch (error) {
                console.error(error);
                socket.emit('error', { message: "Failed to load cart data" });
            }
        });

        socket.on('disconnect', () => {
            console.log('User disconnected');
        });
    })
}

const emitCartUpdate = () => {
    io.emit('cart-update')
}

// exporting functions for using it in the required files
module.exports = { initSocket, emitCartUpdate }