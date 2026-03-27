require("dotenv").config()
const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")

const authRoutes = require("./routes/auth")
const customerRoutes = require("./routes/customers")
const transactionRoutes = require("./routes/transactions")

const app = express()

app.use(cors())

app.use(express.json())
app.get("/", (req,res)=>{
 res.send("Backend running")
})
// Health route for cronjob
app.get("/api/health",(req,res)=>{
 res.send("Server alive")
})


mongoose.connect(process.env.MONGO_URI)
.then(()=>console.log("MongoDB connected"))
.catch(err=>console.log(err))
app.use("/api/auth", authRoutes)
console.log("Loading customer routes...")
app.use("/api/customers", customerRoutes)
console.log("Loading customer routes...")
app.use("/api/transactions", transactionRoutes)

app.listen(5000,()=>{
 console.log("Server running on port 5000")
})
