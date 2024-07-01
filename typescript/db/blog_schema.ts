import {Schema,model,Types} from "mongoose";

export enum BlogStatus{
    PICK,WRITING,REVIEW,COMPLETED
}


const BlogSchema:Schema=new Schema({
    _id:{
        type:String,
        default:()=>(new Types.ObjectId()).toString()
    },
    user:{
        type:String,
        ref:"User"
    },
    body:{
        type:String,
    },
    tag:{type:String},
    likes:{
        type:Number,
        default:0
    },
    status:{
        type:String,
        enum:BlogStatus,
        default:BlogStatus.PICK
    },
    title:{
        type:String,
        require:true
    },
    lastUpdate:{
        type:Date,
        default:()=>Date.now(),
    },
    explanation:{
        type:String
    },
    likedUsers:{
        type:[String],
        default:()=>[]
    }
});

export default model("Blog",BlogSchema);