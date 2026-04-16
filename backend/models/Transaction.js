const mongoose = require("mongoose")

const transactionSchema = new mongoose.Schema({

 userId:{
  type: mongoose.Schema.Types.ObjectId,
  ref:"User",
  required:true
 },

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
