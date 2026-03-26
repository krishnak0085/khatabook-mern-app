import { useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function Register(){

 const navigate = useNavigate()

 const [name,setName] = useState("")
 const [email,setEmail] = useState("")
 const [password,setPassword] = useState("")

 const register = async(e)=>{

  e.preventDefault()

  await axios.post(
   "https://khatabook-mern-app.onrender.com/api/auth/register",
   {name,email,password},
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }
  )

  navigate("/")
 }

 return(

 <div className="min-h-screen flex items-center justify-center bg-gray-100">

 <form onSubmit={register} className="bg-white p-8 shadow rounded w-80">

 <h2 className="text-2xl font-bold text-blue-600 mb-4">
 Register
 </h2>

 <input
 placeholder="Name"
 className="border p-2 w-full mb-3"
 onChange={(e)=>setName(e.target.value)}
 />

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
 Create Account
 </button>

 </form>

 </div>

 )

}
