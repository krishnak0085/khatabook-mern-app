import { useState } from "react"
import axios from "axios"
import { useNavigate, Link } from "react-router-dom"

export default function Login(){

 const navigate = useNavigate()

 const [email,setEmail] = useState("")
 const [password,setPassword] = useState("")

 const login = async(e)=>{

  e.preventDefault()

  const res = await axios.post(
   "https://khatabook-mern-app.onrender.com/api/auth/login",
   {email,password}
  )

  localStorage.setItem("token",res.data.token)

  navigate("/dashboard")
 }

 return(

 <div className="min-h-screen flex items-center justify-center bg-gray-100">

 <form onSubmit={login} className="bg-white p-8 shadow rounded w-80">

 <h2 className="text-2xl font-bold text-blue-600 mb-4">
 Login
 </h2>

 <input
 placeholder="Email"
 className="border p-2 w-full mb-3"
 onChange={(e)=>setEmail(e.target.value)}
 />

 <input
 type="password"
 placeholder="Password"
 className="border p-2 w-full mb-3"
 onChange={(e)=>setPassword(e.target.value)}
 />

 <button className="bg-blue-600 text-white w-full p-2 rounded">
 Login
 </button>

 <p className="mt-3 text-sm">

 No account?
 <Link to="/register" className="text-blue-600 ml-1">
 Register
 </Link>

 </p>

 </form>

 </div>

 )

}
