const router = require("express").Router()
const Transaction = require("../models/Transaction")

// ADD TRANSACTION
router.post("/", async (req,res)=>{

 const {customerId,amount,type,method,description} = req.body

 const transaction = new Transaction({
  customerId,
  amount,
  type,
  method,
  description
 })

 await transaction.save()

 res.json(transaction)

})


// GET TRANSACTIONS OF CUSTOMER
router.get("/:customerId", async (req,res)=>{
 
 const transactions = await Transaction.find({
  customerId:req.params.customerId
 })

 res.json(transactions)

})
//delecte transaction
router.delete("/:id", async (req,res)=>{

 await Transaction.findByIdAndDelete(req.params.id)

 res.json({msg:"Transaction deleted"})

})
module.exports = router