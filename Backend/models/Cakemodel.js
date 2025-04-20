import mongoose from "mongoose";


const CakeSchema =new mongoose.Schema({
    name:{type:String,required:true},
    description:{type:String,required:true},
    price:{type:Number,required:true},
    image:{type:String,required:true},
    category:{type:String,required:true},

})

const CakeModel= mongoose.model.Cakes || mongoose.model('Cakes',CakeSchema);

export default CakeModel;

0