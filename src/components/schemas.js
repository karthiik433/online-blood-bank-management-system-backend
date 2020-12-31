
const mongoose = require("mongoose");
const {Schema} = require("mongoose");

const userSchema = new mongoose.Schema({
    userName : String,
    password : String
});

const donorSchema = new mongoose.Schema({
    fullName: String,
    gender:String,
    dateOfBirth:String,
    bloodGroup:String,
    mobile:Number,
    alternateMobile:Number,
    email:String,
    state:String,
    district:String,
    address:String,

});

const bloodBankSchema = new mongoose.Schema({
    bloodBankName:String,
    district:String,
    Address:String,
    contactNumber:Number,
});

exports.userSchema=userSchema;
exports.donorSchema=donorSchema;
exports.bloodBankSchema=bloodBankSchema;
