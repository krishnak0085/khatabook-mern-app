import { useEffect,useState ,useMemo} from "react"
import axios from "axios"
import { useNavigate } from "react-router-dom"

export default function Dashboard(){

 const navigate = useNavigate()

 const [customers,setCustomers] = useState([])
 const [name,setName] = useState("")
 const [phone,setPhone] = useState("")
 const [search,setSearch] = useState("")
 const userId = localStorage.getItem("userId")
 const [debouncedSearch, setDebouncedSearch] = useState(search)

useEffect(()=>{
 const timer = setTimeout(()=>{
  setDebouncedSearch(search)
 },300)

 return ()=>clearTimeout(timer)
},[search])
const loadCustomers = async()=>{
 try {
  const res = await axios.get(
   `https://khatabook-mern-app.onrender.com/api/customers/user/${userId}`
  )

  // reverse once (latest first)
  setCustomers(res.data.reverse())

 } catch (error) {
  console.log(error)
 }
}

useEffect(()=>{

 if(!userId){
  navigate("/")
  return
 }

 loadCustomers()

},[userId,navigate])

const addCustomer = async()=>{
 if(!name){
  alert("Enter customer name")
  return
 }

 try{
  const res = await axios.post(
   "https://khatabook-mern-app.onrender.com/api/customers",
   {name,phone,userId}
  )

  setCustomers(prev => [res.data, ...prev])

  setName("")
  setPhone("")

 }catch(err){
  console.log(err)
 }
}
const deleteCustomer = async(id)=>{

 if(!window.confirm("Delete this customer?")) return

 try{
  await axios.delete(
   `https://khatabook-mern-app.onrender.com/api/customers/${id}`,
   { data:{ userId } }
  )

  setCustomers(prev =>
   prev.filter(c => c._id !== id)
  )

 }catch(err){
  console.log(err)
 }

}
 const filteredCustomers = useMemo(() => {
 return customers.filter(c =>
  c.name?.toLowerCase().includes(debouncedSearch.toLowerCase()) ||
  c.phone?.includes(debouncedSearch)
 )
}, [customers,debouncedSearch])
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
<input
 placeholder="🔍 Search customer..."
 className="border p-2 w-full mb-4"
 value={search}
 onChange={(e)=>setSearch(e.target.value)}
/>
 </div>
{filteredCustomers.map(c=>{

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
    filteredCustomers.length===0 && (

    <p className="text-center text-gray-500 mt-10">
    No customers yet. Add your first customer!
    </p>

    )
}
{filteredCustomers.length>0 && (

    <p className="text-center text-gray-500 mt-10">
    Tap on a customer to view details and add transactions.
    </p>

    )
}

 </div>

 )
}
