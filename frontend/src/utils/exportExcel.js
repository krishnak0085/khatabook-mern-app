import * as XLSX from "xlsx"

export const exportExcel = (ledger)=>{

 const data = ledger.map(t=>({
 Date: new Date(t.date).toLocaleString(),
 Type: t.type,
 Amount: t.amount,
 Method: t.method,
 Description: t.description,
 Balance: t.balance
 }))

 const worksheet = XLSX.utils.json_to_sheet(data)

 const workbook = XLSX.utils.book_new()

 XLSX.utils.book_append_sheet(workbook,worksheet,"Ledger")

 XLSX.writeFile(workbook,"ledger.xlsx")

}