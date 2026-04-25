import { useParams } from "react-router-dom"
import { useEffect, useState } from "react"
import axios from "axios"
//import jsPDF from "jspdf"
//import autoTable from "jspdf-autotable"
//import * as XLSX from "xlsx"
//import { saveAs } from "file-saver"

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
const [date,setDate] = useState(
 new Date().toISOString().split("T")[0]
)// ADD TRANSACTION
const [amount,setAmount] = useState("")
const [type,setType] = useState("credit")
const [description,setDescription] = useState("")
const userId = localStorage.getItem("userId")
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
},[page])

const loadCustomer = async()=>{

 try{

 const res = await axios.get(
  `https://khatabook-mern-app.onrender.com/api/customers/${id}?userId=${userId}`)

 setCustomer(res.data)

 }catch(err){
 setError("Customer load failed")
 }

}

const loadTransactions = async()=>{

 try{

 setLoading(true)

 const res = await axios.get(
 `https://khatabook-mern-app.onrender.com/api/transactions/${id}/${userId}?page=${page}&limit=10`
)

 const sorted = res.data.sort(
  (a,b)=> new Date(b.date) - new Date(a.date)
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
 if(!date){
  alert("Select date")
  return
 }
 try{

await axios.post(
 "https://khatabook-mern-app.onrender.com/api/transactions",
 {
  customerId:id,
  amount:Number(amount),
  type,
  description,
  method:"cash",
  userId,
  date: date
 }
)

 setAmount("")
 setDescription("")
 setType("credit")
 setDate("")
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
 `https://khatabook-mern-app.onrender.com/api/transactions/${tid}`,
 {
  data:{ userId }
 }
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

 const d = new Date(t.date).toISOString().split("T")[0]

 if(fromDate && d < fromDate) return false
 if(toDate && d > toDate) return false

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

// const exportExcel = ()=>{

//  const sheet = XLSX.utils.json_to_sheet(transactions)

//  const book = XLSX.utils.book_new()

//  XLSX.utils.book_append_sheet(
//   book,
//   sheet,
//   "Ledger"
//  )

//  const buffer = XLSX.write(
//   book,
//   {bookType:"xlsx",type:"array"}
//  )

//  const data = new Blob(
//   [buffer],
//   {type:"application/octet-stream"}
//  )

//  saveAs(
//   data,
//   `${customer?.name}-ledger.xlsx`
//  )

// }

// =========================
// PDF GENERATION
// =========================
const generatePDF =async (limit) => {
 const { default: jsPDF } = await import("jspdf")
 const autoTable = (await import("jspdf-autotable")).default

 if(!transactions.length || !customer) return

 let allData = [...transactions]
 let data = [...transactions]

// sort latest first
data.sort((a,b)=> new Date(b.date) - new Date(a.date))

// take last N entries
if(limit !== "all"){
 data = data.slice(0, Number(limit))
}

// now show them oldest → newest in PDF
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
doc.setFontSize(22)
doc.setFont(undefined,"bold")
doc.text(`${customer.name} Ledger Statement`,105,18,{align:"center"})
 
 // let message=""
 // let color=[0,0,0]
 // if(netBalance>0){
 //  message=`${customer.name} will give you Rs. ${netBalance}`
 //  color=[0,150,0]
 // }
 // else if(netBalance<0){
 //  message=`You will give ${customer.name} Rs. ${Math.abs(netBalance)}`
 //  color=[200,0,0]
 // }
 // else{
 //  message="Balance Settled"
 // }

//doc.setFontSize(14)
//doc.setFont(undefined,"bold")
//doc.setTextColor(...color)
//doc.text(message,105,30,{align:"center"})

 //doc.setTextColor(0,0,0)

 // SUMMARY
// BALANCE MESSAGE
// BALANCE MESSAGE
doc.setFontSize(16)
doc.setFont(undefined,"bold")

let balanceText = ""

// COLOR LOGIC
if(netBalance > 0){
 balanceText = `${customer.name} will give you Rs. ${netBalance}`
 doc.setTextColor(0,150,0)   // green
}
else if(netBalance < 0){
 balanceText = `You will give ${customer.name} Rs. ${Math.abs(netBalance)}`
 doc.setTextColor(200,0,0)   // red
}
else{
 balanceText = "Balance Settled"
 doc.setTextColor(0,150,0)   // green
}

doc.text(
 balanceText,
 105,
 35,
 {align:"center"}
)

// reset color for rest of PDF
doc.setTextColor(0,0,0)

// SUMMARY SECTION
// SUMMARY BOXES
doc.setFontSize(12)

doc.setFillColor(255,240,240)
doc.rect(20,45,55,18,"F")
doc.text(`Total Debit (-)`,23,52)
doc.text(`Rs. ${totalDebit}`,23,60)

doc.setFillColor(235,255,235)
doc.rect(80,45,55,18,"F")
doc.text(`Total Credit (+)`,83,52)
doc.text(`Rs. ${totalCredit}`,83,60)

doc.setFillColor(240,240,255)
doc.rect(140,45,55,18,"F")
doc.text(`Net Balance`,143,52)
doc.text(`Rs. ${Math.abs(netBalance)}`,143,60)
//y += 8
// TABLE
 let runningBalance = openingBalance
 const rows = []

 rows.push([
data[0]?.date?.split("T")[0].split("-").reverse().join("/"),
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
  t.date.split("T")[0].split("-").reverse().join("/"),
   t.description || "-",
   debit,
   credit,
   runningBalance
  ])

 })

autoTable(doc,{
 startY:75,

 head:[["Date","Description","Debit (-)","Credit (+)","Balance"]],

 body:rows,

 theme:"grid",

 headStyles:{
  fillColor:[30,41,59],
  textColor:[255,255,255],
  fontSize:13,
  halign:"center"
 },

 styles:{
  fontSize:13,
  cellPadding:5,
  lineWidth:0.3,
  lineColor:[200,200,200]
 },

 columnStyles:{
  1:{halign:"left"}
 },

 didParseCell:function(data){
  // debit rows light red reflection
  if(data.column.index === 2 && data.cell.raw){
   data.cell.styles.textColor=[200,0,0]
   data.cell.styles.fillColor=[255,235,235]
  }

  // credit rows light green reflection
  if(data.column.index === 3 && data.cell.raw){
   data.cell.styles.textColor=[0,150,0]
   data.cell.styles.fillColor=[235,255,235]
  }

 }
//url: `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}`
})
 // PAGE NUMBER
const pageCount = doc.internal.getNumberOfPages()

for(let i=1;i<=pageCount;i++){

 doc.setPage(i)

 const pageHeight = doc.internal.pageSize.height

 // LEFT SIDE ADVERTISEMENT
// ADVERTISEMENT (bottom-left)
doc.setFontSize(9)

// first line
doc.setTextColor(0,0,0)
doc.text(
 "Need a Website / App for your business?",
 10,
 pageHeight - 12
)

// second line (WhatsApp style)
doc.setTextColor(0,150,0)
doc.setFont(undefined,"bold")

const waText = "Click here to Chat on WhatsApp: +91 8053338585"

doc.text(
 waText,
 10,
 pageHeight - 7
)

// clickable link
doc.link(
 10,
 pageHeight - 12,
 95,
 8,
 {url: `https://wa.me/${import.meta.env.VITE_WHATSAPP_NUMBER}` }
)

// reset color
doc.setTextColor(0,0,0)
doc.setFont(undefined,"normal")
 // RIGHT SIDE PAGE NUMBER
 doc.setTextColor(0,0,0)

 doc.text(
  `Page ${i} of ${pageCount}`,
  180,
  pageHeight - 10
 )

}

 // SAVE PDF
 doc.save(`${customer.name}-statement.pdf`)
 return doc
 // WHATSAPP SHARE
 // const msg = `Ledger statement of ${customer.name}. Entries: ${data.length}`

 // window.open(
 //  `https://wa.me/?text=${encodeURIComponent(msg)}`,
 //  "_blank"
 // )
}
// =========================
// WHATSAPP SHARE
// =========================

const shareWhatsApp = async () => {

 if(!customer) return

 const doc = await generatePDF()

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
 type="date"
 className="border p-2 w-full mb-2"
 value={date}
 onChange={(e)=>setDate(e.target.value)}
/>
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

{t.date.split("T")[0].split("-").reverse().join("/")}
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
