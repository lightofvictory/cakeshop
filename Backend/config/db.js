import mongoose from "mongoose";

export const connectDB=async()=>{
    await mongoose.connect('mongodb+srv://Mrpastry:Mrpastry2025@cluster0.zlu01.mongodb.net/cake_shop').then(()=>console.log("connected to database'"));
}