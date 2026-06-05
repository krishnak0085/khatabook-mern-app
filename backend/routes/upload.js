const router = require("express").Router()
const multer = require("multer")
const cloudinary = require("../config/cloudinary")

const upload = multer({
 storage: multer.memoryStorage()
})

router.post(
 "/",
 upload.single("file"),
 async (req,res)=>{

  try{

   const result = await new Promise((resolve,reject)=>{

    cloudinary.uploader.upload_stream(
      {
        folder:"khatabook",
        resource_type:"auto"
      },
      (error,result)=>{

        if(error) return reject(error)

        resolve(result)
      }
    ).end(req.file.buffer)

   })

   res.json({
     url: result.secure_url,
     type: req.file.mimetype
   })

  }catch(err){

   res.status(500).json({
    error: err.message
   })

  }

 }
)

module.exports = router
