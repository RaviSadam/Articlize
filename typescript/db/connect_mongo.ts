import mongoose from "mongoose";

const MONGO_URL:string=process.env.MONGO_URL||"**";
const connectMongo=function():void{
    mongoose
        .connect(MONGO_URL)
        .then(()=>console.log("connected to MongoDB"))
        .catch((err)=>console.log(`Error occured while connecting to database:${err}`));
}

export default connectMongo;
