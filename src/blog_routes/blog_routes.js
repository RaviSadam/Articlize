"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const blog_schema_1 = __importStar(require("../db/blog_schema"));
const mongodb_1 = require("mongodb");
//      -pick
//     -posts
//     -discard?blogId
//     -review
const router = (0, express_1.Router)();
router.get("/write", (req, res, next) => {
    res.render("write");
});
router.post("/review", (req, res, next) => {
    const { content, blogId } = req.body;
    const name = req.user.username;
    blog_schema_1.default.updateOne({ _id: (new mongodb_1.ObjectId(blogId)) }, { body: content, user: name, status: blog_schema_1.BlogStatus.REVIEW });
});
