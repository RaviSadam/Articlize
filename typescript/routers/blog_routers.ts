import {Router,Request,Response,NextFunction} from "express";
import Blog,{BlogStatus} from "../db/blog_schema";
import {getHashValue,delHasObj,addToCounter,subToCounter, getAllCount,delHashAndAddCount} from "../redis_cache/redis";

import Compress from "../compress_decompress/compress";
import Decompress from "../compress_decompress/decompress";


const router=Router();

router.get("/pending-review",async (req:Request,res:Response,next:NextFunction)=>{
    let skip=0,pageNumber=1;

    if(typeof(req.query.pageNumber)==='string'){
        pageNumber=req.query.pageNumber?Number.parseInt(req.query.pageNumber):1;
        skip=(pageNumber-1)*10;
    }
    const name=getCurrentUser(req);
    let query:Blogs={status:BlogStatus.REVIEW,user:{$ne:name}};
    if(req.query.type){
        query["tag"]=req.query.type;
    }
    const blogs=await Blog.find(query,{title:1,_id:1}).skip(skip).limit(10);
    const totalPages=await Blog.countDocuments({query});
    res.render("review",{articles:blogs,currentPage:pageNumber,totalPages:Math.ceil(totalPages/10)});
});

router.get("/review-success",async (req:Request,res:Response,next:NextFunction) => {
    const {blogId}=req.query;
    if(blogId===undefined){
        try{
            throw Error("Blog Id requried");
        }
        catch(err){
            return next(err);
        }
    }
    delHasObj(blogId.toString());
    await Blog.updateOne({_id:blogId},{status:BlogStatus.COMPLETED});
    return res.redirect("/blog/posts");
});

//request for review
router.put("/review",async (req:Request,res:Response,next:NextFunction)=>{
    let {content,blogId}=req.body;

    content=await Compress(content);
    await delHasObj(blogId.toString()+"#");
    const name=getCurrentUser(req);
    await Blog.updateOne({_id:blogId,status:BlogStatus.WRITING},{body:content.toString(),user:name,status:BlogStatus.REVIEW,lastUpdate:Date.now()});
    res.redirect("/blog/posts");
});

//discarding picked artcle
router.get("/discard",async (req:Request,res:Response,next:NextFunction)=>{
    let id=req.query.blogId;
    if(!id)
        return res.redirect("/posts");
    id=id.toString();
    const tags=await Blog.findOneAndUpdate({_id:id},{$unset:{body:"",user:""},status:BlogStatus.PICK,lastUpdate:Date.now()},{tag:1});
    await delHashAndAddCount(id+"#","tags",["global",tags.tag]);
    res.redirect("/blog/posts");
});

//articles of user
router.get("/posts",async (req:Request,res:Response,next:NextFunction)=>{
    let skip=0,pageNumber=1;
    if(typeof(req.query.pageNumber)==='string'){
        pageNumber=req.query.pageNumber?Number.parseInt(req.query.pageNumber):1;
        skip=(pageNumber-1)*10;
    }
    const name=getCurrentUser(req);
    const blogs=await Blog.find({user:name},{_id:1,title:1,status:1,tag:1}).skip(skip).limit(10);
    const totalPages=await Blog.countDocuments({user:name});
    res.render("articles-list",{articles:blogs,currentPage:pageNumber,totalPages:Math.ceil(totalPages/10)});
});


interface Blogs {
    status: BlogStatus;
    [key: string]: any; // This allows indexing with any string
}

//status is pick. waiting for writing
router.get("/pending-write",async (req:Request,res:Response,next:NextFunction)=>{
    let skip=0;
    let currentPage=1,currentTag,totalPages=1;
    currentTag="";
    if(typeof(req.query.pageNumber)==='string'){
        const pageNumber:number=req.query.pageNumber?Number.parseInt(req.query.pageNumber):1;
        currentPage=pageNumber;
        skip=(pageNumber-1)*10;
    }
    let query:Blogs={status:BlogStatus.PICK};

    const countes=await getAllCount("tags");
    
    if(req.query.tag && req.query.tag){
        query["tag"]=req.query.tag.toString();
        currentTag=query["tag"];
        totalPages=countes[currentTag]?Number.parseInt(countes[currentTag]):1;
    }
    else{
        totalPages=countes["global"]?Number.parseInt(countes["global"]):1;
    }
    const data=await Blog.find(query,{_id:1,title:1,explanation:1,tag:1}).skip(skip).limit(10);
    res.render("pick",{articles:data,categories:countes,currentPage:currentPage,currentTag:currentTag,totalPages:Math.ceil(totalPages/10)});
});

//pick and redirect to writeing editor
router.get("/pick",async (req:Request,res:Response,next:NextFunction)=>{
    const {blogId}=req.query;
    const name=getCurrentUser(req);
    const tags=await Blog.findOneAndUpdate({_id:blogId},{status:BlogStatus.WRITING,user:name},{tag:1});
    await subToCounter("tags",["global",tags.tag]);
    res.redirect(`/blog/write/?blogId=${blogId}`);
});

router.get("/write",async (req:Request,res:Response,next:NextFunction)=>{
    const {blogId,title}=req.query;
    if(!blogId){
        return res.redirect("/blog/posts");
    }
    let data=null;
    if(title===undefined || title===null){
        if(typeof(blogId)==='string'){
            data=await getHashValue(blogId);
        }
        if(data===null || Object.keys(data).length===0){
            data=await Blog.findOne({_id:blogId,status:BlogStatus.WRITING},{body:1,title:1});
            if(data && data.body)
                data.body=await Decompress(data.body);
        }
        if(!data){
            return res.redirect("/blog/posts");
        }
        
        return res.render("write",{blogTitle:data.title,blogId:blogId,body:data.body,readOnly:false});
    }
    return res.render("write",{blogTitle:title,blogId:blogId,body:"",readOnly:false});
});


router.get("/add-title",(req,res)=>{
    res.render("add-title",{success:false,error:false});
});

router.post("/add-title",async (req,res)=>{
    const {title,explanation,tag}=req.body;
    try{
        const blog=new Blog({title:title,explanation:explanation,tag:tag});
        await blog.save();
        await addToCounter("tags",[tag,"global"]);
        return res.render("add-title",{success:true,error:false});
    }
    catch(err){
        return res.render("add-title",{error:true,success:true});
    }
});


function getCurrentUser(req:Request){
    return (req.user as { username: string }).username;
}


export default router;