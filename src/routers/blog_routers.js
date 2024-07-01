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
const blog_schema_1 = __importStar(require("../db/blog_schema"));
const redis_1 = require("../redis_cache/redis");
const compress_1 = __importDefault(require("../compress_decompress/compress"));
const decompress_1 = __importDefault(require("../compress_decompress/decompress"));
const router = (0, express_1.Router)();
router.get("/pending-review", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let skip = 0, pageNumber = 1;
    if (typeof (req.query.pageNumber) === 'string') {
        pageNumber = req.query.pageNumber ? Number.parseInt(req.query.pageNumber) : 1;
        skip = (pageNumber - 1) * 10;
    }
    const name = getCurrentUser(req);
    let query = { status: blog_schema_1.BlogStatus.REVIEW, user: { $ne: name } };
    if (req.query.type) {
        query["tag"] = req.query.type;
    }
    const blogs = yield blog_schema_1.default.find(query, { title: 1, _id: 1 }).skip(skip).limit(10);
    const totalPages = yield blog_schema_1.default.countDocuments({ query });
    res.render("review", { articles: blogs, currentPage: pageNumber, totalPages: Math.ceil(totalPages / 10) });
}));
router.get("/review-success", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { blogId } = req.query;
    if (blogId === undefined) {
        try {
            throw Error("Blog Id requried");
        }
        catch (err) {
            return next(err);
        }
    }
    (0, redis_1.delHasObj)(blogId.toString());
    yield blog_schema_1.default.updateOne({ _id: blogId }, { status: blog_schema_1.BlogStatus.COMPLETED });
    return res.redirect("/blog/posts");
}));
//request for review
router.put("/review", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { content, blogId } = req.body;
    content = yield (0, compress_1.default)(content);
    yield (0, redis_1.delHasObj)(blogId.toString() + "#");
    const name = getCurrentUser(req);
    yield blog_schema_1.default.updateOne({ _id: blogId, status: blog_schema_1.BlogStatus.WRITING }, { body: content.toString(), user: name, status: blog_schema_1.BlogStatus.REVIEW, lastUpdate: Date.now() });
    res.redirect("/blog/posts");
}));
//discarding picked artcle
router.get("/discard", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let id = req.query.blogId;
    if (!id)
        return res.redirect("/posts");
    id = id.toString();
    const tags = yield blog_schema_1.default.findOneAndUpdate({ _id: id }, { $unset: { body: "", user: "" }, status: blog_schema_1.BlogStatus.PICK, lastUpdate: Date.now() }, { tag: 1 });
    yield (0, redis_1.delHashAndAddCount)(id + "#", "tags", ["global", tags.tag]);
    res.redirect("/blog/posts");
}));
//articles of user
router.get("/posts", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let skip = 0, pageNumber = 1;
    if (typeof (req.query.pageNumber) === 'string') {
        pageNumber = req.query.pageNumber ? Number.parseInt(req.query.pageNumber) : 1;
        skip = (pageNumber - 1) * 10;
    }
    const name = getCurrentUser(req);
    const blogs = yield blog_schema_1.default.find({ user: name }, { _id: 1, title: 1, status: 1, tag: 1 }).skip(skip).limit(10);
    const totalPages = yield blog_schema_1.default.countDocuments({ user: name });
    res.render("articles-list", { articles: blogs, currentPage: pageNumber, totalPages: Math.ceil(totalPages / 10) });
}));
//status is pick. waiting for writing
router.get("/pending-write", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let skip = 0;
    let currentPage = 1, currentTag, totalPages = 1;
    currentTag = "";
    if (typeof (req.query.pageNumber) === 'string') {
        const pageNumber = req.query.pageNumber ? Number.parseInt(req.query.pageNumber) : 1;
        currentPage = pageNumber;
        skip = (pageNumber - 1) * 10;
    }
    let query = { status: blog_schema_1.BlogStatus.PICK };
    const countes = yield (0, redis_1.getAllCount)("tags");
    if (req.query.tag && req.query.tag) {
        query["tag"] = req.query.tag.toString();
        currentTag = query["tag"];
        totalPages = countes[currentTag] ? Number.parseInt(countes[currentTag]) : 1;
    }
    else {
        totalPages = countes["global"] ? Number.parseInt(countes["global"]) : 1;
    }
    const data = yield blog_schema_1.default.find(query, { _id: 1, title: 1, explanation: 1, tag: 1 }).skip(skip).limit(10);
    res.render("pick", { articles: data, categories: countes, currentPage: currentPage, currentTag: currentTag, totalPages: Math.ceil(totalPages / 10) });
}));
//pick and redirect to writeing editor
router.get("/pick", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { blogId } = req.query;
    const name = getCurrentUser(req);
    const tags = yield blog_schema_1.default.findOneAndUpdate({ _id: blogId }, { status: blog_schema_1.BlogStatus.WRITING, user: name }, { tag: 1 });
    yield (0, redis_1.subToCounter)("tags", ["global", tags.tag]);
    res.redirect(`/blog/write/?blogId=${blogId}`);
}));
router.get("/write", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const { blogId, title } = req.query;
    if (!blogId) {
        return res.redirect("/blog/posts");
    }
    let data = null;
    if (title === undefined || title === null) {
        if (typeof (blogId) === 'string') {
            data = yield (0, redis_1.getHashValue)(blogId);
        }
        if (data === null || Object.keys(data).length === 0) {
            data = yield blog_schema_1.default.findOne({ _id: blogId, status: blog_schema_1.BlogStatus.WRITING }, { body: 1, title: 1 });
            if (data && data.body)
                data.body = yield (0, decompress_1.default)(data.body);
        }
        if (!data) {
            return res.redirect("/blog/posts");
        }
        return res.render("write", { blogTitle: data.title, blogId: blogId, body: data.body, readOnly: false });
    }
    return res.render("write", { blogTitle: title, blogId: blogId, body: "", readOnly: false });
}));
router.get("/add-title", (req, res) => {
    res.render("add-title", { success: false, error: false });
});
router.post("/add-title", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { title, explanation, tag } = req.body;
    try {
        const blog = new blog_schema_1.default({ title: title, explanation: explanation, tag: tag });
        yield blog.save();
        yield (0, redis_1.addToCounter)("tags", [tag, "global"]);
        return res.render("add-title", { success: true, error: false });
    }
    catch (err) {
        return res.render("add-title", { error: true, success: true });
    }
}));
function getCurrentUser(req) {
    return req.user.username;
}
exports.default = router;
