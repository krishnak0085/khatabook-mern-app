const router = require("express").Router()
const Customer = require("../models/Customer")
const Transaction = require("../models/Transaction")

// ADD CUSTOMER
router.post("/", async (req,res)=>{
 try{

  const { name, phone } = req.body

  const customer = new Customer({
   name,
   phone
  })

  await customer.save()

  res.json(customer)

 }catch(err){
  res.status(500).json({error:err.message})
 }
})


// GET CUSTOMERS WITH BALANCE
router.get("/", async (req,res)=>{
 try{

  const customers = await Customer.aggregate([
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
// GET SINGLE CUSTOMER
router.get("/:id", async (req,res)=>{
 try{

  const customer = await Customer.findById(req.params.id)

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