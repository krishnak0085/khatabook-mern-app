const mongoose = require("mongoose")

const router = require("express").Router()
const Customer = require("../models/Customer")
const Transaction = require("../models/Transaction")

// ADD CUSTOMER
router.post("/", async (req,res)=>{
 try{

  const { name, phone, userId } = req.body

const customer = new Customer({
 name,
 phone,
 userId: new mongoose.Types.ObjectId(userId)
})

  await customer.save()

  res.json(customer)

 }catch(err){
  console.error(err)
  res.status(500).json({error:err.message})
 }
})


// GET CUSTOMERS WITH BALANCE
router.get("/user/:userId", async (req,res)=>{
 try{

  const userId = new mongoose.Types.ObjectId(req.params.userId)

  const customers = await Customer.find({ userId })

  const result = []

  for(const c of customers){

   const transactions = await Transaction.find({
    customerId:c._id
   })

   let balance = 0

   transactions.forEach(t=>{
    if(t.type==="credit") balance += t.amount
    else balance -= t.amount
   })

   result.push({
    ...c._doc,
    balance
   })
  }

  res.json(result)

 }catch(err){
  console.error(err)
  res.status(500).json({error:err.message})
 }
})
// GET SINGLE CUSTOMER
router.get("/:id", async (req,res)=>{
 try{
const customer = await Customer.findOne({
 _id:req.params.id,
 userId:req.query.userId
})
  if(!customer){
   return res.status(404).json({message:"Customer not found"})
  }

  res.json(customer)

 }catch(err){
  res.status(500).json({error:err.message})
 }
})

// DELETE CUSTOMER
router.delete("/:id", async (req,res)=>{
 try{

  await Customer.findByIdAndDelete(req.params.id)

  await Transaction.deleteMany({
   customerId: req.params.id
  })

  res.json({message:"Customer deleted"})

 }catch(err){
  res.status(500).json({error:err.message})
 }
})

module.exports = router
