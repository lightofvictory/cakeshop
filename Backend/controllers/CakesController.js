import CakeModel from "../models/Cakemodel.js";
import fs from "fs";


// add cake items

// const addCakeItems=async(req,res)=>{
//     let image_Filename = req.file ? `${req.file.filename}` : null;
//     if (!image_Filename) {
//         return res.json({ success: false, message: "File upload failed or no file provided" });
//     }
//       const cake=new CakeModel({
//         name:req.body.name,
//         description:req.body.description,
//         price:req.body.price,
        
//        category:req.body.category,
//        image:image_Filename
//     })
//        try{
//         await cake.save();
//         console.log(cake);
//         res.json({success:true,message:"cake item added successfully"})
//        }catch(err){
//         console.log(err.message);
//         res.json({success:false,message:err.message})
//        }
// }

const addCakeItems = async (req, res) => {
    try {
      console.log("REQ FILE:", req.file); // 👈 See what’s coming in
      console.log("REQ BODY:", req.body);
  
      if (!req.file) {
        return res.status(400).json({ success: false, message: "No image file uploaded." });
      }
  
      const cake = new CakeModel({
        name: req.body.name,
        description: req.body.description,
        price: req.body.price,
        category: req.body.category,
        image: req.file.filename
      });
  
      await cake.save();
      res.status(201).json({ success: true, message: "Cake item added successfully", cake });
    } catch (err) {
      console.error("Error adding cake:", err);
      res.status(500).json({ success: false, message: "Internal Server Error", error: err.message });
    }
  };
  

const cakelist=async(req,res)=>{
try{
    const cakes=await CakeModel.find();
    res.json({success:true,data:cakes});

}
catch(err){
    res.json({success:false,message:err.message})
}
}

const removecake= async (req,res) => {
    try{
       const cake=await CakeModel.findById(req.body.id);
       fs.unlink(`${url}/images/${cake.image}`,()=>{})

       await CakeModel.findByIdAndDelete(req.body.id);
       res.json({success:true,message:"successfully deleted"})
    }
    catch(err){
        console.log(err.message);
        res.json({success:false,message:err.message})
    }
}

export  {addCakeItems ,cakelist,removecake}


