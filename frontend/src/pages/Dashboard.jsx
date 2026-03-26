import { useEffect,useState } from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function Dashboard(){

 const navigate = useNavigate()

 const [customers,setCustomers] = useState([])
 const [name,setName] = useState("")
 const [phone,setPhone] = useState("")

 const loadCustomers = async()=>{
try {
  const res = await axios.get(
   "https://khatabook-mern-app.onrender.com/api/customers",
  {
    headers: {
      Authorization: localStorage.getItem("token")
    }
  }
  )
  setCustomers(res.data)
}
  catch (error) {

  console.log(error)
 }
}

 useEffect(()=>{
  loadCustomers()
 },[])

const addCustomer = async()=>{
 try{

  await axios.post(
   "https://khatabook-mern-app.onrender.com/api/customers",
   {name,phone},
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }
  )

  setName("")
  setPhone("")

  loadCustomers()

 }catch(err){
  console.log(err)
 }
}
const deleteCustomer = async(id)=>{

 if(!window.confirm("Delete this customer?")) return

 try{
  await axios.delete(
   `https://khatabook-mern-app.onrender.com/api/customers/${id}`,
  {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`
    }
  }
  )

  loadCustomers()

 }catch(err){
  console.log(err)
 }

}
 return(

 <div className="min-h-screen bg-gray-100 p-4">

 <h1 className="text-xl font-bold text-blue-600 mb-4">
 Khatabook
 </h1>

 <div className="bg-white p-4 rounded shadow mb-4">

<input
 placeholder="Customer name"
 className="border p-2 w-full mb-2"
 value={name}
 onChange={e=>setName(e.target.value)}
/>
<input
 placeholder="Phone"
 className="border p-2 w-full mb-2"
 value={phone}
 onChange={e=>setPhone(e.target.value)}
/>
 <button
 onClick={addCustomer}
 className="bg-blue-600 text-white w-full p-2 rounded">
 Add Customer
 </button>

 </div>
{customers.map(c=>{

 const balance = Number(c.balance || 0)

 return(

 <div
 key={c._id}
 className={`p-4 rounded shadow mb-3 flex justify-between items-center
 ${balance >= 0 ? "bg-green-100":"bg-red-100"}`}
 >

 <div
 onClick={()=>navigate(`/customer/${c._id}`)}
 className="cursor-pointer">

 <p className="font-bold">{c.name}</p>
 <p className="text-sm text-gray-600">{c.phone}</p>

 </div>

 <div className="flex items-center gap-3">

 <p className={`font-bold
 ${balance >= 0 ? "text-green-700":"text-red-700"}`}>

 ₹{balance}

 </p>

 <button
 onClick={()=>deleteCustomer(c._id)}
 className="bg-black text-white px-2 py-1 text-xs rounded">

 Delete

 </button>

 </div>

 </div>

 )

})}
{
    customers.length===0 && (

    <p className="text-center text-gray-500 mt-10">
    No customers yet. Add your first customer!
    </p>

    )
}
{
    customers.length>0 && (

    <p className="text-center text-gray-500 mt-10">
    Tap on a customer to view details and add transactions.
    </p>

    )
}

 </div>

 )
}
