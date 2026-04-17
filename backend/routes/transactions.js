const router = require("express").Router()
const mongoose = require("mongoose")

const Transaction = require("../models/Transaction")

// ADD TRANSACTION
router.post("/", async (req,res)=>{
 try{

  const { customerId, amount, type, method, description, userId } = req.body

  const transaction = new Transaction({
   customerId: new mongoose.Types.ObjectId(customerId),
   amount,
   type,
   method,
   description,
   userId: new mongoose.Types.ObjectId(userId)
  })

  await transaction.save()

  res.json(transaction)

 }catch(err){
  console.error(err)
  res.status(500).json({ error: err.message })
 }
})

// GET TRANSACTIONS OF CUSTOMER
router.get("/:customerId/:userId", async (req,res)=>{
 try{

  const transactions = await Transaction.find({
   customerId: new mongoose.Types.ObjectId(req.params.customerId),
   userId: new mongoose.Types.ObjectId(req.params.userId)
  })

  res.json(transactions)

 }catch(err){
  res.status(500).json({error:err.message})
 }

})
//delecte transaction
router.delete("/:id", async (req,res)=>{
 try{

  await Transaction.findByIdAndDelete(req.params.id)

  res.json({msg:"Transaction deleted"})

 }catch(err){
  res.status(500).json({error:err.message})
 }

})
module.exports = router
