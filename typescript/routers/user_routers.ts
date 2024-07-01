import express, {NextFunction, Response,Request } from "express";
import passport from "passport";
import User from "../db/user_schema";

const {Router}=express;

const router=Router();

router.get("/register",(req:Request,res:Response)=>{
    res.render("registration");
});

router.post("/register",async (req:Request,res:Response,next:NextFunction)=>{
    const user=new User(req.body);
    try{
        await user.save();
    }
    catch(err){
        return next(err);
    }
    res.set("data","User registration successful");
    res.redirect("/user/login");
});

router.get("/login",(req:Request,res:Response)=>{
    const data=req.headers.data;
    res.render(`login`,{data:data});
});

router.post("/login",(req:Request,res:Response,next:NextFunction)=>{
    passport.authenticate('local',{failureRedirect:"/authFail"},(err:Error,user:Express.User)=>{
        if(err)
            return next(err);
        if(!user){
            return res.status(401).json({body:"Unauthorized request"});
        }
        req.logIn(user,async (err)=>{
            if(err)
                return next(err);
            return next(null);
        });
    })(req,res,next);
},(req,res)=>{
    if(typeof(req.query.next)==='string'){
        res.redirect(req.query.next);
    }
    else{
        res.redirect("/home");
    }
});
router.put("/update/:username",async (req:Request,res:Response)=>{
    const username=req.params.username.trim();
    if(!username || username.length<1)
        return res.status(400).json({body:"username requried"});
    const user=await User.findOneAndUpdate({username:username},req.body);
    await user.save();
    return res.send("OK");
});

router.delete("/delete",async (req:Request,res:Response,next:NextFunction)=>{
    if(!req.isAuthenticated()){
        return res.redirect("/user/login/?next=/user/delete");
    }
    const name=(req.user as { username: string }).username;
    if(!name){
        res.status(400).json({response:"username requried"});
        next();
        return;
    }
    
    try{
        const user=await User.findOneAndDelete({username:name});
        if(user)
            res.status(200).json({response:"user deleted"});
        else
            res.status(404).json({response:`no user fonund with give username ${name}`});
    }
    catch(err){
        res.status(500).json({response:"unknown error occured"});
    }
    res.end();
});

router.all("/logout",(req:Request,res:Response,next:NextFunction)=>{
    req.logOut((err)=>{
        if(err)
            next(err);
        res.redirect("login");
    });
});
export default router;