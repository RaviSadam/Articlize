import mongoose,{ Schema,model } from "mongoose";
import passportLocalMongoose from "passport-local-mongoose"


import bcrypt from "bcrypt";


const UserSchema:Schema=new Schema({
    _id:{
        type:String,
        default:()=>(new mongoose.Types.ObjectId()).toString()
    },
    username:{
        type:String,
        lowercase:true,
        minLength:5,
        maxLength:20,
        require:true,
        unique:true,
        mutable:false,
        trim:true
    },
    password:{
        type:String
    },
    roles:[{
        type:String,
        default:()=>"user"
    }],
    age:{
        type:Number,
        min:1,
        max:80,
        require:false
    },
    email:{
        type:String,
        require:true,
        trim:true,
        unique:true,
        match:[
            /^[\w.-]+@[\w.-]+\.\w{2,3}$/,
            'Please provide a valid email address',
        ],
        mutable:false,
    },
    phone:{
        type:String,
        require:false,
        match:[/^(\+([1-9]{1,2}))?([1-9][0-9]{9})$/,'Invalid Modile Number']
    },
    firstName:{
        type:String,
        require:true,
        minLength:3,
        maxLength:30    
    },
    lastName:{
        type:String,
        require:false
    },
    createdDate:{
        type:Date,
        default:()=>Date.now(),
        mutable:false
    },
    updatedDate:{
        type:Date,
        default:()=>Date.now()
    },
    hobbies:[{type:String}]
});

UserSchema.plugin(passportLocalMongoose);

UserSchema.pre("save",async function(next){
    const password=this.password || new Buffer("");
    if(typeof password==="string"){
        this.password=await bcrypt.hash(password,12);
    }
    next();
});


UserSchema.methods.isValidPassword=async function(password:string){
    return await bcrypt.compare(password,this.password);
};

UserSchema.methods.hasRole=function(role:string){
    return this.roles.includes(role);
}

export default model("user",UserSchema);
