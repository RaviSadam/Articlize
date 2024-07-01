import scheduler from "node-schedule";

import { moveDataFromRedisToDb } from "../redis_cache/redis";

scheduler.scheduleJob("0 0 1 * * *",()=>{
    moveDataFromRedisToDb("#");
});
