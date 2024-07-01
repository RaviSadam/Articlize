"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const redis_1 = require("../redis_cache/redis");
const blog_schema_1 = __importDefault(require("../db/blog_schema"));
const router = (0, express_1.Router)();
//api
router.post("/save", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { content, blogId, blogTitle } = req.body;
    yield (0, redis_1.setHashObj)(blogId.toString() + "#", ["body", "title"], [content.toString(), blogTitle.toString()], 24 * 60 * 60);
    res.status(200).json({ body: "Saved" });
}));
router.get("/likes/:id", function like(req, res, next) {
    return __awaiter(this, void 0, void 0, function* () {
        let { id } = req.params;
        if (id === undefined) {
            return res.status(400).json({ body: "Blog Id requried" });
        }
        id = id.toString();
        const name = req.user.username;
        yield blog_schema_1.default.updateOne({ _id: id }, { $inc: { likes: 1 }, $push: { likedUsers: name } });
        const val = yield (0, redis_1.checkHash)(id);
        if (val) {
            (0, redis_1.addToCounter)(id, ["likes"]);
        }
        return res.status(200);
    });
});
router.get("/isLiked", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { blogId } = req.query;
    if (blogId === undefined) {
        return res.status(400).json({ body: "Blog Id requried" });
    }
    blogId = blogId.toString();
    return res.status(200);
}));
exports.default = router;
