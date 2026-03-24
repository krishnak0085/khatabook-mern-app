const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({

 customerId:{
  type: mongoose.Schema.Types.ObjectId,
  ref:"Customer"
 },

 amount:Number,

 type:{
  type:String,
  enum:["credit","debit"]
 },

 method:{
  type:String,
  enum:["cash","upi","bank"]
 },

 description:String,

 date:{
  type:Date,
  default:Date.now
 }

})

module.exports = mongoose.model("Transaction",transactionSchema)