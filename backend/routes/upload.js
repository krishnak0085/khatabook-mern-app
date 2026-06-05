const router = require("express").Router()
const multer = require("multer")
const { CloudinaryStorage } = require("multer-storage-cloudinary")
const cloudinary = require("../config/cloudinary")

const storage = new CloudinaryStorage({
 cloudinary,
 params:{
  folder:"khatabook",
  resource_type:"auto"
 }
})

const upload = multer({ storage })

router.post(
 "/",
 upload.single("file"),
 async(req,res)=>{

  try{

   res.json({
    url:req.file.path,
    type:req.file.mimetype
   })

  }catch(err){

   res.status(500).json({
    error:err.message
   })

  }

 }
)

module.exports = router
