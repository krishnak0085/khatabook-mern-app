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
mongoose.connect("mongodb+srv://krishnagupta85com_db_user:PGpSdy23Xicxg5TE@cluster0.k10xs65.mongodb.net/khatabook")
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