const mongoose = require("mongoose")

const customerSchema = new mongoose.Schema({

 userId:{
  type: mongoose.Schema.Types.ObjectId,
  ref:"User",
  required:true
 },

 name:String,
 phone:String

})
customerSchema.index({ userId:1 })
module.exports = mongoose.model("Customer", customerSchema)
