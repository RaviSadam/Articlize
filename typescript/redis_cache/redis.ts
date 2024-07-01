import { RedisClientType} from "@redis/client";
import {createClient} from "redis";
import Blog from "../db/blog_schema";
import Compress from "../compress_decompress/compress";



const password:string=process.env.REDIS_PASSWORD||"Ravi@9390";
const host:string=process.env.REDIS_HOST || "redis-10287.c309.us-east-2-1.ec2.redns.redis-cloud.com";
const username:string=process.env.REDIS_USERNAME || "default";
let client: RedisClientType;


export default async function():Promise<void>{
    client=createClient({
        password:password,
        username:username,
        socket:{
            port:10287,
            host:host
        }
    });

    client.on("connect",()=>console.log("connected to redis"))
    client.on("error",(err)=>console.log("error occured while connecting to redis",err))
    await client.connect();
}

export const setKey=async function(key:string,value:string,ttl:number){
    const time=ttl||5*60;
    return await client.setEx(key,time,value);
}

export const getValue=async function (key:any){
    return await client.get(key);
}
export const setHashKey=async function(key:string,value:string,field:string,ttl:number){
    await client.multi().hSet(key,field,value).expire(key,ttl).exec();
    return;
}
export const getHashValue=async function(key:string){
    return await client.hGetAll(key);
}
export const setHashObj=async function (key:string,fields:string[],values:string[],ttl:number){
    const multi=client.multi();
    for(let i=0;i<fields.length;i++){
        multi.hSet(key,fields[i],values[i]);
    }
    multi.expire(key,ttl);
    await multi.exec();   
}
export const delHasObj=async function name(key:string) {
    await client.DEL(key);
}

export const addToCounter=async function name(key:string,fields:string[]) {
    const multi=client.multi();
    for(let field of fields){
        multi.hIncrBy(key,field,1);
    }
    await multi.exec();
}
export const subToCounter=async function (key:string,fields:string[]) {
    const multi=client.multi();
    for(let field of fields){
        multi.hIncrBy(key,field,-1);
    }
    await multi.exec();
}
export const getAllCount=async function name(key:string){
    return await client.hGetAll(key);
}
export const getCount=async function (key:string,field:string) {
    return await client.hGet(key,field);
}

export const delHashAndAddCount=async function(hashKey:string,CKey:string,fields:string[]){
    const multi=client.multi();
    multi.del(hashKey);
    for(let field of fields){
        multi.hIncrBy(CKey,field,1);
    }
    await multi.exec();
}
export const addCountToHashField=async function(key:string,field:string){
    await client.hIncrBy(key,field,1);
}

export const checkHash=async function(key:string){
    const data=await client.hLen(key);
    return data!=0;
}


export const moveDataFromRedisToDb=async function(suffix:string){
    const data=await client.SCAN(0,{TYPE:'HASH',MATCH:"*"+suffix});
    for(let key of data.keys){
        const blog=await client.hGetAll(key);
        blog.body=await Compress(blog.body);
        Blog.updateOne({_id:key.slice(0,key.length-1)},{body:blog.body})
        delHasObj(key);
    }
}