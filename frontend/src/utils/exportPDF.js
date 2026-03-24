import jsPDF from "jspdf"

export const exportPDF = (ledger)=>{

 const doc = new jsPDF()

 doc.text("Customer Ledger",20,20)

 let y = 40

 ledger.forEach((t)=>{

 doc.text(
 `${new Date(t.date).toLocaleString()} | ${t.type} | ₹${t.amount} | ${t.method} | Balance ₹${t.balance}`,
 20,
 y
 )

 y += 10

 })

 doc.save("ledger.pdf")

}