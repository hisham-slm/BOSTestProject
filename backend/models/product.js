// creating database model for products
const mongoose = require('mongoose')

const ProductSchema = mongoose.Schema({
    title : {
        type : String,
        require : true
    }, 
    price : {
        type : Number,
       require : true
    },
    image : {
        type : String,
        require : true
    }
})


module.exports = mongoose.model('Product', ProductSchema) 