const router = require("express").Router()
const Customer = require("../models/Customer")
const Transaction = require("../models/Transaction")
const auth = require("../middleware/auth")

//AUTH CUSTOMER
router.post("/", auth, async (req,res)=>{
 try{

  const { name, phone } = req.body

  const customer = new Customer({
   name,
   phone,
   userId:req.userId
  })

  await customer.save()

  res.json(customer)

 }catch(err){
  res.status(500).json({error:err.message})
 }
})
// GET CUSTOMERS WITH BALANCE
router.get("/", auth, async (req,res)=>{
 try{

  const customers = await Customer.aggregate([

   {
    $match:{ userId:req.userId }
   },

   {
    $lookup:{
     from:"transactions",
     localField:"_id",
     foreignField:"customerId",
     as:"transactions"
    }
   },

   {
    $addFields:{
     balance:{
      $sum:{
       $map:{
        input:"$transactions",
        as:"t",
        in:{
         $cond:[
          {$eq:["$$t.type","credit"]},
          "$$t.amount",
          {$multiply:["$$t.amount",-1]}
         ]
        }
       }
      }
     }
    }
   }

  ])

  res.json(customers)

 }catch(err){
  res.status(500).json({error:err.message})
 }
})
//GET SINGLE CUSTOMER
router.get("/:id", auth, async (req,res)=>{
 try{

  const customer = await Customer.findOne({
   _id:req.params.id,
   userId:req.userId
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
router.delete("/:id",auth, async (req,res)=>{
 try{

  await Customer.DeleteOne({
   _id:req.params.id,
   userId:req.userId})

  await Transaction.deleteMany({
   customerId: req.params.id,
   userId:req.userId
  })

  res.json({message:"Customer deleted"})

 }catch(err){
  res.status(500).json({error:err.message})
 }
})

module.exports = router
