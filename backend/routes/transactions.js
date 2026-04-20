const router = require("express").Router()
const mongoose = require("mongoose")
const Transaction = require("../models/Transaction")

// ============================
// ADD TRANSACTION
// ============================

router.post("/", async (req,res)=>{
 try{

  const { customerId, amount, type, method, description, userId , date } = req.body

  // VALIDATION
  if(!customerId || !userId || !amount){
   return res.status(400).json({msg:"Missing required fields"})
  }

  const transaction = new Transaction({
   customerId: new mongoose.Types.ObjectId(customerId),
   amount,
   type,
   method,
   description,
   userId: new mongoose.Types.ObjectId(userId),
   date: date ? new Date(date) : Date.now()
  })

  await transaction.save()

  res.json(transaction)

 }catch(err){
  console.error("Transaction add error:",err)
  res.status(500).json({ error: err.message })
 }
})


// ============================
// GET TRANSACTIONS OF CUSTOMER
// ============================

router.get("/:customerId/:userId", async (req,res)=>{
 try{

  const { customerId, userId } = req.params

  if(!customerId || !userId){
   return res.status(400).json({msg:"Missing params"})
  }

  const transactions = await Transaction.find({
   customerId: new mongoose.Types.ObjectId(customerId),
   userId: new mongoose.Types.ObjectId(userId)
  }).sort({date:-1})

  res.json(transactions)

 }catch(err){
  console.error("Transaction fetch error:",err)
  res.status(500).json({error:err.message})
 }

})


// ============================
// DELETE TRANSACTION
// ============================

router.delete("/:id", async (req,res)=>{
 try{

  const { userId } = req.body

  const transaction = await Transaction.findOneAndDelete({
   _id:req.params.id,
   userId:new mongoose.Types.ObjectId(userId)
  })

  if(!transaction){
   return res.status(404).json({msg:"Transaction not found"})
  }

  res.json({msg:"Transaction deleted"})

 }catch(err){
  console.error("Transaction delete error:",err)
  res.status(500).json({error:err.message})
 }

})

module.exports = router
