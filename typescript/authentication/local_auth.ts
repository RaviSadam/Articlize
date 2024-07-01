import passport from "passport";
import passportLocal from "passport-local";
import User from "../db/user_schema";

import { Request,Response,NextFunction } from "express";

const LocalStrategy=passportLocal.Strategy;
const customFields={
    usernameField:"username",
    passwordField:"password"
}

const verifyCallBack=async (username:string,password:string,done: (err:null|any,user:false)=>void)=>{
    try{
        const user=await User.findOne({username:username},{_id:1,username:1,password:1});
        if(!user){
            return done(null,false);
        }
        if(!user.isValidPassword(password)){
            return done(null,false);
        }
        done(null,user);
    }
    catch(err){
        done(err,false);
    }
}

export default function(){
    passport.use(new LocalStrategy(customFields,verifyCallBack));
    passport.serializeUser(User.serializeUser());
    passport.deserializeUser(User.deserializeUser());
    console.log("Passport local authentication eastablished")
}

export function isAuthenticated(req:Request,res:Response,next:NextFunction){
    if(!req.isAuthenticated()){
        if(req.originalUrl.startsWith("/api")){
            return res.status(401).json({body:"unauthrozied request"});
        }
        return res.redirect(`/user/login?next=${req.originalUrl}`);
    }
    next();
}