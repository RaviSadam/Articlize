import dotenv from "dotenv";
import express, { NextFunction,Request,Response } from "express";
import connectMongo from "./db/connect_mongo";
import connect_redis, { getHashValue, setHashObj } from "./redis_cache/redis";
import bodyParser from "body-parser";
import passport from "passport";
import session from "express-session";
import MongoStore from "connect-mongo";
import local_auth from "./authentication/local_auth";
import path from "path";
import user_routers from "./routers/user_routers";
import blog_routers from "./routers/blog_routers";
import { isAuthenticated } from "./authentication/local_auth";
import api_routers from "./routers/api_routers";
import Decompress from "./compress_decompress/decompress";
import Blog, { BlogStatus } from "./db/blog_schema";

dotenv.config();
const app=express();


app.use(express.json());
app.use(bodyParser.urlencoded({extended:true}));
app.use(bodyParser.json());

const SESSION_SECRET_KEY:string=process.env.SESSION_SECRET_KEY||"seacretKey123";
const MONGO_URL:string=process.env.MONGO_URL || "mongodb+srv://ravi:t1RPP6hSll1uSfqc@ravi.zdukcmr.mongodb.net/Blogger";

app.use(session({
    secret:SESSION_SECRET_KEY,
    resave:false,
    saveUninitialized:false,
    store:MongoStore.create({
        mongoUrl:MONGO_URL,
        ttl:14*24*60*60,
        autoRemove:"native",
        crypto:{
            secret:SESSION_SECRET_KEY
        }
    })
}));

app.use(passport.initialize());
app.use(passport.session());

app.set("view engine","ejs");
app.set("views",path.join(__dirname,'views'));
app.use(express.static(path.join(__dirname,"static_files")));


const PORT=process.env.PORT;

app.listen(PORT,async ()=>{
    connectionInitialization();
    console.log("Server strated");
});



//initilizing the Db,Redis and passport
async function connectionInitialization(){
    await connectMongo();
    await connect_redis()
    local_auth();
}

app.get("/",async (req,res) => {
    res.redirect("/home");
});

app.get("/home",async (req,res)=>{
    const data=await Blog.find({status:BlogStatus.COMPLETED},{_id:1,user:1,title:1,likes:1}).limit(10);
    res.render("home",{isLoggedIn:req.isAuthenticated(),articles:data});
});


app.get("/read",async (req:Request,res:Response,next:NextFunction)=>{
    let {blogId,review}=req.query;
    const id=blogId?.toString();
    let blog;
    const username=getCurrentUser(req);
    if(typeof(id)==='string')
        blog=await getHashValue(id);
    if(!blog || !blog.title){
        
        blog=(await Blog.aggregate([{$match:{_id:id,$or:[{status:'2'},{status:'3'}]}},{$project:{body:1,title:1,likes:1,user:1,liked:{$in:[username,'$likedUsers']}}}]))[0];
        if(blog && blog.body){
            blog.body=await Decompress(blog.body);
            if(typeof(id)==='string')
                setHashObj(id,["body","title","likes","user"],[blog.body,blog.title,String(blog.likes).trim(),blog.user],10*60);
        }
    }
    if(blog===null || blog===undefined || blog.body===undefined || blog.body===null){
        try{
            throw Error("Invalid id given or Writing of Articles is not completed");
        }
        catch(err){
            return next(err);
        }
    }
    res.render("read",{isLoggedIn:req.isAuthenticated(),blogTitle:blog.title,blogId:id,likes:blog.likes,liked:blog.liked||false,body:blog.body,user:blog.user,review:review});
});



app.use("/user",user_routers);
app.use("/blog",isAuthenticated);
app.use("/blog",blog_routers);
app.use("/api",isAuthenticated);
app.use("/api",api_routers);
app.use((err:any,req:Request,res:Response,next:NextFunction)=>{
    res.render("error",{errorCode:err.status||500,errorMessage:err.message||"Internal server error",requestPath:req.originalUrl,requestMethod:req.method,isLoggedIn:req.isAuthenticated()})
});
app.use((req, res, next) => {
    res.render("error",{errorCode:404,errorMessage:"Page Not found",requestPath:req.originalUrl,requestMethod:req.method,isLoggedIn:req.isAuthenticated()});
});

function getCurrentUser(req:Request){
    if(req.user===undefined || req.user===null)
        return "";
    return (req.user as { username: string }).username;
}

