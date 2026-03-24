const mongoose = require("mongoose")

const customerSchema = new mongoose.Schema({

 userId:String,
 name:String,
 phone:String

})

module.exports = mongoose.model("Customer",customerSchema)