const express = require('express');
const router = express.Router();

//importing required data models
const Product = require('../models/product');
const User = require('../models/user');

// importing required authentication functions
const authenticateToken = require('../middlewares/authenticateUser')

// importing the function for triggerring the database updates
const { emitCartUpdate } = require('../socket')

// route
router.get('/products', authenticateToken, async (req, res) => {
  try {
    //collecting all products from database and sending
    const products = await Product.find()
    res.status(200).json({ products: products })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "something went wrong in the backend", error: error })
  }
})

router.post('/add_to_cart', authenticateToken, async (req, res) => {
  const productId = req.body.product_id
  const username = req.username
  const quantity = req.body.quantity

  // finding the the user and the product to add the data into cart part of user
  const user = await User.findOne({ username: username })
  const product = await Product.findOne({ _id: productId })

  // doing edge cases
  if (!user) {
    res.status(401).json({ message: "User not found" })
  }
  if (!productId) {
    res.status(401).json({ message: "Product Missing" })
  }

  try {
    // updating the user database by adding to the cart 
    await User.updateOne({ username: username }, { $push: { cart: { product: product._id, quantity: quantity } } })

    //triggering the database update to send data to the admin using websocket protocol
    emitCartUpdate()

    res.status(200).json({ message: "Added to cart!" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Something Went wrong in the backend", error: error })
  }
})

// exporting the router to use it in the server.js
module.exports = router;