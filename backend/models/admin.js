const mongoose = require('mongoose')

const AdminSchema = new mongoose.Schema({
    admin : {
        type : String,
        require : true
    },
    admin_refresh_token : {
        type : String,
        require : true,
        default : ''
    }, 
    password : {
        type : String,
        require : true
    }
}) 

module.exports = mongoose.model('admin', AdminSchema)