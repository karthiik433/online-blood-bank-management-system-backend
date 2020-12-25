const mongoose = require("mongoose");

const {ArrayData} = require("./data");
const {data2} = require("./data2");
const {bloodBankSchema,donorSchema,userSchema} = require("./schemas");
//console.log(ArrayData);


const karthik = mongoose.createConnection("mongodb://localhost:27017/Practice-for-project",{ useNewUrlParser: true, useUnifiedTopology: true });




const userModel = karthik.model("user",userSchema);
const donorModel = karthik.model("donor",donorSchema);
const bloodBankModel = karthik.model("bloodBank",bloodBankSchema);

// ArrayData.forEach(async (item)=>{
//       const newBank =new bloodBankModel(item);
//       await newBank.save();
// });

// data2.forEach(async (item)=>{
//       const newBank =new bloodBankModel(item);
//       await newBank.save();
// });

exports.donorModel=donorModel;
exports.bloodBankModel = bloodBankModel;
exports.userModel=userModel;