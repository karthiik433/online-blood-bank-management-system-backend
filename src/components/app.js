const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const port = 9999;
app.use(express.urlencoded());
const bcrypt = require("bcrypt");
const session = require("express-session");

const session_secret = "karthi";

 const cors = require("cors");
 app.use(cors({
 
    credentials :true,
    origin:"http://localhost:8080"

 }));

// add a property called session to the req
 app.use(session({
     secret : session_secret,
    //  cookie:{
    //      maxAge:1*60*60*60*1000
    //  }
 }))

const {Schema} = require("mongoose");
const { stringify } = require("querystring");
//const { isNullOrUndefined } = require("util");
//const { resolveSoa } = require("dns");

app.use(express.json());

const {bloodBankModel,donorModel,userModel} = require("./createDataBase");
const { resolveSoa } = require("dns");





// const user = new donorModel({
//     fullName:"karthik",
//     gender:"male",
//     dateOfBirth:15/09/1997,
//     bloodGroup:"B+",
//     aadharNumber:123456789,
//     mobile:8790835204,
//     email:"karthik12345kumar@gmail.com",
//     state:"Andhra Pradesh",
//     district:"Anantapur",
//     address:"23-170,sai nagar,dharmavaram",
//     userId : 433,
// });

// const bloodBank = new bloodBankModel({
//     "bloodBankName":"Deepu blood bank",
//     "city":"Anantapur",
//     "Address":"2nd Cross Rd,Central Exchange colony,Ashok Nagar,Anantapur,Anantapur,Andhra Pradesh 515001",
//     "contactNumber":null,
// })
 
// const fun = async ()=>{
//     await bloodBank.save();
// }
// fun();
const isNullOrUndefined = (val)=> val === null || val === undefined || val==="";

const SALT = 5 ;


app.post("/signup",async (req,res)=>{
    const {userName,password} = req.body;
    console.log(req.body,"signUp");
    const existingUser = await userModel.findOne({userName});
    if(isNullOrUndefined(existingUser)){
        //allow signup
        const hashedPwd = bcrypt.hashSync(password,SALT);
        const newUser =  new userModel({userName,password:hashedPwd});
        await newUser.save();
        req.session.userId = newUser._id;
        res.status(201).send({Success:"Signed Up Successfully"});
    }else{
        res.status(400).send({error:`UserName ${userName} already exists.Please choose another.`});
    }
});


app.post("/login",async (req,res)=>{
    const {userName,password} = req.body;
    console.log(req.body,"login");
    const existingUser = await userModel.findOne({userName});
    //console.log(existingUser);
    if(isNullOrUndefined(existingUser)){
        res.status(401).send({error:"User doesn't exist."});
    }else{
        const hashedPwd = existingUser.password;
        if(bcrypt.compareSync(password,hashedPwd)){
            req.session.userId = existingUser._id;
            let donor = await donorModel.findOne({fullName:userName});
            if(isNullOrUndefined(donor)){
                res.status(200).send({success:"Logged in successfully",donor:false});
            }else{
                res.status(200).send({success:"Logged in successfully",donor:true});
            }
            //console.log("logged");
            
        }
        else{
            res.status(401).send({error:"Password incorect."});
        }
    }
});

const AuthMiddleware = async(req,res,next)=>{
    // const userName = req.headers["x-username"];
    // const password = req.headers["x-password"];
                         //userName                       password
    if(isNullOrUndefined(req.session)|| isNullOrUndefined(req.session.userId)){
        res.status(401).send({error : "Not Logged in"});
    }else{

         next();
       

        // const existingUser = await userModel.findOne({
        //     userName,
        // });
        // if(isNullOrUndefined(existingUser)){
        //     res.status(401).send({error:"User doesn't exist" });

        // }else{
        //     const hashedPwd = existingUser.password;
        //     if(bcrypt.compareSync(password,hashedPwd)){
        //         req.user = existingUser;
        //         next();
        //     }else{
        //        res.status(401).send({err:"Password incorrect"});
        //     }
        // }
    }
};

app.post("/bloodBanksByDistrict",async (req,res)=>{
    const districtName = req.body.district;
    console.log(districtName);
    const doc = await bloodBankModel.aggregate([
        {
            $match:{
                district:districtName,
            }
        },
        {
            $project:{
                _id:0,
                BloodBankName:"$bloodBankName",
                District:"$district",
                Address:"$Address",
                ContactNumber:"$contactNumber"
            }
        }
    ]);
    res.send(doc);
});

// app.get("/donorDetailsByDistrict",AuthMiddleware,async (req,res)=>{
//     //const District = req.body;
//     //console.log(District);
//     const userDetails = await donorModel.find();
//     res.send(userDetails);
// });

app.post("/donorDetailsByDistrict",AuthMiddleware,async (req,res)=>{
    const districtName = req.body.district;
    const bloodGrp = req.body.bloodGroup;
    console.log(districtName);
    const userDetails = await donorModel.aggregate([
        {
            $match: {
                district:districtName,
                bloodGroup:bloodGrp
            }
        },
     {
        $project:{
            _id:0,
            DonorName:"$fullName",
            Gender:"$gender",
            BloodGroup:"$bloodGroup",
            MobileNumber:"$mobile",
            AlternateMobile:"$alternateMobile",
            Email:"$email",
            District:"$district",
            Address:"$address",

        },
    }
])
    res.send(userDetails);
});

app.post("/donorRegistration",AuthMiddleware,async (req,res)=>{
    const donor = req.body;
    console.log(donor);
    let existingUser = await donorModel.find({fullName:donor.fullName});
   // console.log(existingUser);
    //console.log(existingUser.length);
    if(existingUser.length !== 0){
        res.status(404).send({message:"Donor name already exists"});
    }else{
        const newDonor = new donorModel(donor);
        await newDonor.save();
        res.status(201).send({message:"Thank You for registering as donor"});
    }
    // todo.creationTime = new Date();
    // todo.done = false;
    // todo.userId = req.user._id;
    
});

app.put("/updateDonorDetails",AuthMiddleware,async (req,res)=>{
    const details = req.body;
    console.log(req.body);
    console.log(details.fullName);//,password:details.password
    if(isNullOrUndefined(details.fullName)){
        res.status(404).send({message:"Please fill the details"});
    }else{
        //console.log(11);
        const existingDonor = await donorModel.findOne({fullName:details.fullName});//,password:details.password
        //console.log(existingDonor);
        //console.log(existingDonor === null);
        if(isNullOrUndefined(existingDonor)){
            res.status(404).send({message:"Donor doesn't exist with given details"});
        }else{
            console.log(details);
            // if(!isNullOrUndefined(details.newName)){
            //      existingDonor.fullName = details.newName.trim();
            // }
            // if(!isNullOrUndefined(details.newpassword)){
            //     existingDonor.password = details.newpassword.trim();
            // }
            if(!isNullOrUndefined(details.mobile) && details.mobile !==0){
                existingDonor.mobile = details.mobile;
             }
             if(!isNullOrUndefined(details.email)){
                 existingDonor.email = details.email.trim();
             }
             if(!isNullOrUndefined(details.district)){
                 existingDonor.district = details.district.trim();
             }
             if(!isNullOrUndefined(details.address)){
                 existingDonor.address = details.address.trim();
             }
             if(!isNullOrUndefined(details.alternateMobile) && details.alternateMobile !==0){
                existingDonor.alternateMobile = details.alternateMobile;
            }
             await existingDonor.save();
             res.send(existingDonor);
        }
    }

});

app.delete("/deleteDonor", AuthMiddleware , async (req,res)=>{
    const details = req.body;
    console.log(details);
        const existingDonor = await donorModel.findOne(details);
        console.log(existingDonor);
        if(isNullOrUndefined(existingDonor)){
            res.status(404).send({message:"Cannot find donor with given details"})
        }else{
            try{
                await donorModel.deleteOne(details);
                res.status(200).send({message:"Deleted Succesfully, Thank You"});
            }catch(e){
                res.sendStatus(404);
            }
        }
});

app.get("/logout",(req,res)=>{

    if(!isNullOrUndefined(req.session)){
        //destroy the session
        req.session.destroy(()=>{
            res.sendStatus(200);
        })

    }else{
        res.sendStatus(200);
    }
})

app.get("/userInfo",AuthMiddleware,async (req,res)=>{
    const user = await userModel.findById(req.session.userId);
    const donor =  await donorModel.findOne({fullName:user.userName});
    if(isNullOrUndefined(donor)){
        res.send({userName:user.userName,donor:false});
    }else{
        res.send({userName:user.userName,donor:true});
    }
    
})

app.listen(port,()=>console.log("connection established"));