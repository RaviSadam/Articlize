"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_schedule_1 = __importDefault(require("node-schedule"));
const redis_1 = require("../redis_cache/redis");
node_schedule_1.default.scheduleJob("0 0 1 * * *", () => {
    (0, redis_1.moveDataFromRedisToDb)("#");
});
