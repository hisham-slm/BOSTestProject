const express = require('express');
const jwt = require('jsonwebtoken');
const Product = require('../models/product');
const User = require('../models/user');
const router = express.Router();
const authenticateToken = require('../middlewares/authenticateUser')

// router.use( async (req, res, next) => {
//   console.log(req.headers)
//   next()
// } )

// Products route
router.get('/products',authenticateToken,  async (req, res) => {
  let products = [
    {
      title : 'soap',
      price : 3000
    },
    {
      title : 'blah',
      price : 3000
    },
    {
      title : 'pridus',
      price : 343
    }
  ]
  products = await Product.find()

  res.status(200).json({products : products})
})
// Authentication middleware

module.exports = router;