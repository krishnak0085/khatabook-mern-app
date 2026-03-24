const router = require("express").Router()
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")

const User = require("../models/User")

// REGISTER
router.post("/register", async (req,res)=>{

 const {name,email,password} = req.body

 const hashed = await bcrypt.hash(password,10)

 const user = new User({
  name,
  email,
  password:hashed
 })

 await user.save()

 res.json({msg:"Account created"})
})

// LOGIN
router.post("/login", async (req,res)=>{

 const {email,password} = req.body

 const user = await User.findOne({email})

 if(!user)
  return res.status(400).json({msg:"User not found"})

 const valid = await bcrypt.compare(password,user.password)

 if(!valid)
  return res.status(400).json({msg:"Wrong password"})

 const token = jwt.sign(
  {id:user._id},
  "secretkey"
 )

 res.json({token})

})

module.exports = router