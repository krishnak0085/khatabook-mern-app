import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"
import * as XLSX from "xlsx"
import { saveAs } from "file-saver"

export default function CustomerDetails(){

// =========================
// ROUTER PARAM
// =========================

const { id } = useParams()

// =========================
// STATES
// =========================

const [customer,setCustomer] = useState(null)
const [transactions,setTransactions] = useState([])

const [loading,setLoading] = useState(false)
const [error,setError] = useState("")

// ADD TRANSACTION
const [amount,setAmount] = useState("")
const [type,setType] = useState("credit")
const [description,setDescription] = useState("")

// SEARCH
const [search,setSearch] = useState("")

// DATE FILTER
const [fromDate,setFromDate] = useState("")
const [toDate,setToDate] = useState("")

// PAGINATION
const [page,setPage] = useState(1)
const perPage = 6

// =========================
// LOAD DATA
// =========================

useEffect(()=>{
 loadCustomer()
 loadTransactions()
},[])

const loadCustomer = async()=>{

 try{

 const res = await axios.get(
  `http://localhost:5000/api/customers/${id}`
 )

 setCustomer(res.data)

 }catch(err){
 setError("Customer load failed")
 }

}

const loadTransactions = async()=>{

 try{

 setLoading(true)

 const res = await axios.get(
  `http://localhost:5000/api/transactions/${id}`
 )

 const sorted = res.data.sort(
  (a,b)=> new Date(a.date) - new Date(b.date)
 )

 setTransactions(sorted)

 }catch(err){
 setError("Transactions load failed")
 }

 setLoading(false)

}

// =========================
// ADD TRANSACTION
// =========================

const addTransaction = async()=>{

 if(!amount){
  alert("Enter amount")
  return
 }

 try{

 await axios.post(
  "http://localhost:5000/api/transactions",
  {
   customerId:id,
   amount:Number(amount),
   type,
   description,
   method:"cash"
  }
 )

 setAmount("")
 setDescription("")
 setType("credit")

 loadTransactions()

 }catch(err){
 alert("Transaction failed")
 }

}

// =========================
// DELETE
// =========================

const deleteTransaction = async(tid)=>{

 if(!window.confirm("Delete this transaction?")) return

 try{

 await axios.delete(
  `http://localhost:5000/api/transactions/${tid}`
 )

 loadTransactions()

 }catch(err){
 alert("Delete failed")
 }

}

// =========================
// BALANCE CALCULATION
// =========================

const totalCredit = transactions
.filter(t=>t.type==="credit")
.reduce((sum,t)=>sum+t.amount,0)

const totalDebit = transactions
.filter(t=>t.type==="debit")
.reduce((sum,t)=>sum+t.amount,0)

const balance = totalCredit - totalDebit

// =========================
// RUNNING BALANCE LEDGER
// =========================

const getLedger = ()=>{

 let running = 0

 return transactions.map(t=>{

  if(t.type==="credit"){
   running += t.amount
  }else{
   running -= t.amount
  }

  return {...t,balance:running}

 })

}

const ledger = getLedger()

// =========================
// SEARCH FILTER
// =========================

const searched = ledger.filter(t=>
 t.description?.toLowerCase().includes(
  search.toLowerCase()
 )
)

// =========================
// DATE FILTER
// =========================

const dateFiltered = searched.filter(t=>{

 if(!fromDate && !toDate) return true

 const d = new Date(t.date)

 if(fromDate && d < new Date(fromDate)) return false
 if(toDate && d > new Date(toDate)) return false

 return true

})

// =========================
// PAGINATION
// =========================

const start = (page-1) * perPage
const end = start + perPage

const paginated = dateFiltered.slice(start,end)

const totalPages = Math.ceil(dateFiltered.length / perPage)

// =========================
// CLEAR FILTERS
// =========================

const clearFilters = ()=>{

 setSearch("")
 setFromDate("")
 setToDate("")
 setPage(1)

}

// =========================
// EXPORT EXCEL
// =========================

const exportExcel = ()=>{

 const sheet = XLSX.utils.json_to_sheet(transactions)

 const book = XLSX.utils.book_new()

 XLSX.utils.book_append_sheet(
  book,
  sheet,
  "Ledger"
 )

 const buffer = XLSX.write(
  book,
  {bookType:"xlsx",type:"array"}
 )

 const data = new Blob(
  [buffer],
  {type:"application/octet-stream"}
 )

 saveAs(
  data,
  `${customer?.name}-ledger.xlsx`
 )

}

// =========================
// PDF GENERATION
// =========================
const generatePDF = (limit) => {

 if(!transactions.length || !customer) return

 let allData = [...transactions]
 let data = [...transactions]

 if(limit !== "all"){
  data = data.slice(-Number(limit))
 }

 data.sort((a,b)=> new Date(a.date) - new Date(b.date))

 // OPENING BALANCE
 let openingBalance = 0
 const firstDate = data[0]?.date

 allData.forEach(t=>{
  if(new Date(t.date) < new Date(firstDate)){
   if(t.type==="credit"){
    openingBalance += t.amount
   }else{
    openingBalance -= t.amount
   }
  }
 })

 // TOTALS
 const totalCredit = data
 .filter(t=>t.type==="credit")
 .reduce((s,t)=>s+t.amount,0)

 const totalDebit = data
 .filter(t=>t.type==="debit")
 .reduce((s,t)=>s+t.amount,0)

 const netBalance = openingBalance + totalCredit - totalDebit

 const doc = new jsPDF()

 // HEADER
 doc.setFontSize(18)
 doc.setTextColor(0,0,0)

 doc.text(`${customer.name} Ledger Statement`,60,15)

 let message=""
 let color=[0,0,0]

 if(netBalance>0){
  message=`${customer.name} will give you ₹${netBalance}`
  color=[0,150,0]
 }
 else if(netBalance<0){
  message=`You will give ${customer.name} ₹${Math.abs(netBalance)}`
  color=[200,0,0]
 }
 else{
  message="Balance Settled"
 }

 doc.setFontSize(12)
 doc.setTextColor(...color)
 doc.text(message,14,25)

 doc.setTextColor(0,0,0)

 // SUMMARY
 doc.setFontSize(10)

 doc.text(`Entries: ${data.length}`,14,35)
 
 // TABLE
 let runningBalance = openingBalance
 const rows = []

 rows.push([
  new Date(data[0]?.date).toLocaleDateString(),
  "Opening Balance",
  "",
  "",
  runningBalance
 ])

 data.forEach(t=>{

  let debit=""
  let credit=""

  if(t.type==="debit"){
   debit=t.amount
   runningBalance -= t.amount
  }else{
   credit=t.amount
   runningBalance += t.amount
  }

  rows.push([
   new Date(t.date).toLocaleDateString(),
   t.description || "-",
   debit,
   credit,
   runningBalance
  ])

 })

 autoTable(doc,{
  startY:70,
  head:[["Date","Description","Debit (-)","Credit (+)","Balance"]],
  body:rows,

  didParseCell:function(data){

   if(data.column.index===2 && data.cell.raw){
    data.cell.styles.textColor=[200,0,0]
   }

   if(data.column.index===3 && data.cell.raw){
    data.cell.styles.textColor=[0,150,0]
   }

  }

 })

 // PAGE NUMBER
 const pageCount = doc.internal.getNumberOfPages()

 for(let i=1;i<=pageCount;i++){

  doc.setPage(i)

  doc.setFontSize(9)

  doc.text(
   `Page ${i} of ${pageCount}`,
   180,
   doc.internal.pageSize.height-10
  )

 }

 // SAVE PDF
 doc.save(`${customer.name}-statement.pdf`)

 // WHATSAPP SHARE
 const msg = `Ledger statement of ${customer.name}. Entries: ${data.length}`

 window.open(
  `https://wa.me/?text=${encodeURIComponent(msg)}`,
  "_blank"
 )
}
// =========================
// WHATSAPP SHARE
// =========================

const shareWhatsApp = () => {

 if(!customer) return

 const doc = generatePDF()

 const pdfBlob = doc.output("blob")

 const file = new File(
  [pdfBlob],
  `${customer.name}-statement.pdf`,
  { type: "application/pdf" }
 )

 const url = URL.createObjectURL(file)

 const msg =
 `Ledger statement for ${customer.name}.
 Please download the PDF from the link below:

 ${url}`

 window.open(
  `https://wa.me/?text=${encodeURIComponent(msg)}`,
  "_blank"
 )

}
// =========================
// UI
// =========================

return(

<div className="p-6 max-w-4xl mx-auto">

{/* CUSTOMER HEADER */}

<h1 className="text-2xl font-bold mb-2">

{customer?.name || "Customer Ledger"}

</h1>

{customer && (
<p className="text-gray-500 mb-4">

Customer ID: {customer._id}

</p>
)}

{/* BALANCE CARD */}

<div className="grid grid-cols-3 gap-4 mb-6">

<div className="bg-green-100 p-4 rounded">
<p>Total Credit</p>
<h2 className="font-bold">
₹{totalCredit}
</h2>
</div>

<div className="bg-red-100 p-4 rounded">
<p>Total Debit</p>
<h2 className="font-bold">
₹{totalDebit}
</h2>
</div>

<div className="bg-gray-200 p-4 rounded">
<p>Balance</p>
<h2 className="font-bold">
₹{Math.abs(balance)}
</h2>
</div>

</div>

{/* ADD TRANSACTION */}

<div className="border p-4 rounded mb-6">

<h2 className="font-bold mb-2">
Add Transaction
</h2>

<input
placeholder="Amount"
className="border p-2 w-full mb-2"
value={amount}
onChange={e=>setAmount(e.target.value)}
/>

<input
placeholder="Description"
className="border p-2 w-full mb-2"
value={description}
onChange={e=>setDescription(e.target.value)}
/>

<select
className="border p-2 w-full mb-2"
value={type}
onChange={(e)=>setType(e.target.value)}
>
<option value="credit">Credit</option>
<option value="debit">Debit</option>
</select>
<button
onClick={addTransaction}
className="bg-blue-600 text-white p-2 w-full rounded"
>

Add Transaction

</button>
<select
className="border p-2 mb-4"
onChange={(e)=>{
 const value = e.target.value
 if(value) generatePDF(value)
}}
>

<option value="">Download Statement</option>
<option value="2">Last 2 Entries</option>
<option value="5">Last 5 Entries</option>
<option value="10">Last 10 Entries</option>
<option value="all">All Entries</option>

</select>


</div>

{/* TOOLS */}

<div className="flex flex-wrap gap-2 mb-4">




<button
onClick={shareWhatsApp}
className="bg-green-700 text-white px-4 py-2 rounded"
>
Share WhatsApp
</button>

</div>

{/* SEARCH */}

<input
placeholder="Search description..."
className="border p-2 w-full mb-3"
value={search}
onChange={e=>setSearch(e.target.value)}
/>

{/* DATE FILTER */}

<div className="flex gap-2 mb-3">

<input
type="date"
className="border p-2"
onChange={e=>setFromDate(e.target.value)}
/>

<input
type="date"
className="border p-2"
onChange={e=>setToDate(e.target.value)}
/>

<button
onClick={clearFilters}
className="bg-gray-400 px-3 py-2 rounded"
>

Clear

</button>

</div>

{/* TRANSACTIONS */}

<h2 className="font-bold mb-3">
Transactions
</h2>

{loading && <p>Loading...</p>}

{paginated.map(t=>(

<div
key={t._id}
className="border p-3 mb-2 flex justify-between items-center"
>

<div>

<p>{t.description || "No description"}</p>

<p className="text-sm text-gray-500">

{new Date(t.date).toLocaleDateString()}

</p>

<p className={
t.type==="credit"
? "text-green-600"
: "text-red-600"
}>

₹{t.amount}

</p>

<p className="text-sm font-semibold">

Balance: ₹{t.balance}

</p>

</div>

<button
onClick={()=>deleteTransaction(t._id)}
className="bg-black text-white px-3 py-1 rounded text-xs"
>

Delete

</button>

</div>

))}

{/* PAGINATION */}

<div className="flex gap-2 mt-4">

<button
disabled={page===1}
onClick={()=>setPage(page-1)}
className="px-3 py-1 border rounded"
>

Prev

</button>

<span>

Page {page} / {totalPages}

</span>

<button
disabled={page===totalPages}
onClick={()=>setPage(page+1)}
className="px-3 py-1 border rounded"
>

Next

</button>

</div>

</div>

)

}