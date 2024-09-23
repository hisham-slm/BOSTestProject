const express = require('express');
const jwt = require('jsonwebtoken');
const Product = require('../models/product');
const User = require('../models/user');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateUser')
const { emitCartUpdate } = require('../socket')

// router.use(async (req, res, next)=> {
//   console.log(io)
//   next()
// })
// Products route
router.get('/products', authenticateToken, async (req, res) => {
  try {
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
  const user = await User.findOne({ username: username })
  const product = await Product.findOne({ _id: productId })

  if (!user) {
    res.status(401).json({ message: "User not found" })
  }
  if (!productId) {
    res.status(401).json({ message: "Product Missing" })
  }

  try {
    await User.updateOne({ username: username }, { $push: { cart: { product: product._id, quantity: quantity } } })
    emitCartUpdate()
    console.log("Added to the cart ")
    res.status(200).json({ message: "Added to cart!" })
  } catch (error) {
    console.log(error)
    res.status(500).json({ message: "Something Went wrong in the backend", error: error })
  }
})

module.exports = router;