
import {Router,Request,Response,NextFunction} from "express";
import { addToCounter, checkHash, setHashObj } from "../redis_cache/redis";
import Blog from "../db/blog_schema";

const router=Router();

//api
router.post("/save",async (req:Request,res:Response,next:NextFunction)=>{
    let {content,blogId,blogTitle}=req.body;
    await setHashObj(blogId.toString()+"#",["body","title"],[content.toString(),blogTitle.toString()],24*60*60);
    res.status(200).json({body:"Saved"});
});

router.get("/likes/:id",async function like(req:Request,res:Response,next:NextFunction) {
    let {id}=req.params;
    if(id===undefined){
        return res.status(400).json({body:"Blog Id requried"});
    }
    id=id.toString();
    const name=(req.user as { username: string }).username;
    await Blog.updateOne({_id:id},{$inc:{likes:1},$push:{likedUsers:name}});
    const val=await checkHash(id);
    if(val){
        addToCounter(id,["likes"]);
    }
    return res.status(200);
});

router.get("/isLiked",async (req,res,next) => {
    let {blogId}=req.query;
    if(blogId===undefined){
        return res.status(400).json({body:"Blog Id requried"});
    }
    blogId=blogId.toString();
    return res.status(200);
});

export default router;