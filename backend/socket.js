const { Server } = require('socket.io');
const User = require('./models/user')
const socketAdminAuth = require('./middlewares/socketAdminAuth')
let io;

const initSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: 'http://localhost/4321',
            methods: ['GET', 'POST'],
            credentials: true

        }
    })
    io.use(socketAdminAuth)

    io.on('connection', (socket) => {
        console.log("Admin connected")

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

const getIO = () => {
    if (!io) {
        throw new Error('Socket.io not initialized')
    }
    return io;
}

const emitCartUpdate = () => {
    io.emit('cart-update')
}

module.exports = { initSocket, emitCartUpdate }