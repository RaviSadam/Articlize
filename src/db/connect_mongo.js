"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const MONGO_URL = process.env.MONGO_URL || "**";
const connectMongo = function () {
    mongoose_1.default
        .connect(MONGO_URL)
        .then(() => console.log("connected to MongoDB"))
        .catch((err) => console.log(`Error occured while connecting to database:${err}`));
};
exports.default = connectMongo;
