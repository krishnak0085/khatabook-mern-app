const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({

 userId:{
  type: mongoose.Schema.Types.ObjectId,
  ref:"User",
  required:true
 },

 customerId:{
  type: mongoose.Schema.Types.ObjectId,
  ref:"Customer",
  required:true
 },

 amount:{
  type:Number,
  required:true
 },

 type:{
  type:String,
  enum:["credit","debit"],
  required:true
 },

 method:{
  type:String,
  enum:["cash","upi","bank"],
  default:"cash"
 },

 description:{
  type:String,
  default:""
 },

 date:{
  type:Date,
  default:Date.now
 }

})

module.exports = mongoose.model("Transaction",transactionSchema)
