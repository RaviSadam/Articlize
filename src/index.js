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
const dotenv_1 = __importDefault(require("dotenv"));
const express_1 = __importDefault(require("express"));
const connect_mongo_1 = __importDefault(require("./db/connect_mongo"));
const redis_1 = __importStar(require("./redis_cache/redis"));
const body_parser_1 = __importDefault(require("body-parser"));
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const connect_mongo_2 = __importDefault(require("connect-mongo"));
const local_auth_1 = __importDefault(require("./authentication/local_auth"));
const path_1 = __importDefault(require("path"));
const user_routers_1 = __importDefault(require("./routers/user_routers"));
const blog_routers_1 = __importDefault(require("./routers/blog_routers"));
const local_auth_2 = require("./authentication/local_auth");
const api_routers_1 = __importDefault(require("./routers/api_routers"));
const decompress_1 = __importDefault(require("./compress_decompress/decompress"));
const blog_schema_1 = __importStar(require("./db/blog_schema"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(body_parser_1.default.json());
const SESSION_SECRET_KEY = process.env.SESSION_SECRET_KEY || "seacretKey123";
const MONGO_URL = process.env.MONGO_URL || "mongodb+srv://ravi:t1RPP6hSll1uSfqc@ravi.zdukcmr.mongodb.net/Blogger";
app.use((0, express_session_1.default)({
    secret: SESSION_SECRET_KEY,
    resave: false,
    saveUninitialized: false,
    store: connect_mongo_2.default.create({
        mongoUrl: MONGO_URL,
        ttl: 14 * 24 * 60 * 60,
        autoRemove: "native",
        crypto: {
            secret: SESSION_SECRET_KEY
        }
    })
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
app.set("view engine", "ejs");
app.set("views", path_1.default.join(__dirname, 'views'));
app.use(express_1.default.static(path_1.default.join(__dirname, "static_files")));
const PORT = process.env.PORT;
app.listen(PORT, () => __awaiter(void 0, void 0, void 0, function* () {
    connectionInitialization();
    console.log("Server strated");
}));
//initilizing the Db,Redis and passport
function connectionInitialization() {
    return __awaiter(this, void 0, void 0, function* () {
        yield (0, connect_mongo_1.default)();
        yield (0, redis_1.default)();
        (0, local_auth_1.default)();
    });
}
app.get("/", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    res.redirect("/home");
}));
app.get("/home", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const data = yield blog_schema_1.default.find({ status: blog_schema_1.BlogStatus.COMPLETED }, { _id: 1, user: 1, title: 1, likes: 1 }).limit(10);
    res.render("home", { isLoggedIn: req.isAuthenticated(), articles: data });
}));
app.get("/read", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    let { blogId, review } = req.query;
    const id = blogId === null || blogId === void 0 ? void 0 : blogId.toString();
    let blog;
    const username = getCurrentUser(req);
    if (typeof (id) === 'string')
        blog = yield (0, redis_1.getHashValue)(id);
    if (!blog || !blog.title) {
        blog = (yield blog_schema_1.default.aggregate([{ $match: { _id: id, $or: [{ status: '2' }, { status: '3' }] } }, { $project: { body: 1, title: 1, likes: 1, user: 1, liked: { $in: [username, '$likedUsers'] } } }]))[0];
        if (blog && blog.body) {
            blog.body = yield (0, decompress_1.default)(blog.body);
            if (typeof (id) === 'string')
                (0, redis_1.setHashObj)(id, ["body", "title", "likes", "user"], [blog.body, blog.title, String(blog.likes).trim(), blog.user], 10 * 60);
        }
    }
    if (blog === null || blog === undefined || blog.body === undefined || blog.body === null) {
        try {
            throw Error("Invalid id given or Writing of Articles is not completed");
        }
        catch (err) {
            return next(err);
        }
    }
    res.render("read", { isLoggedIn: req.isAuthenticated(), blogTitle: blog.title, blogId: id, likes: blog.likes, liked: blog.liked || false, body: blog.body, user: blog.user, review: review });
}));
app.use("/user", user_routers_1.default);
app.use("/blog", local_auth_2.isAuthenticated);
app.use("/blog", blog_routers_1.default);
app.use("/api", local_auth_2.isAuthenticated);
app.use("/api", api_routers_1.default);
app.use((err, req, res, next) => {
    res.render("error", { errorCode: err.status || 500, errorMessage: err.message || "Internal server error", requestPath: req.originalUrl, requestMethod: req.method, isLoggedIn: req.isAuthenticated() });
});
app.use((req, res, next) => {
    res.render("error", { errorCode: 404, errorMessage: "Page Not found", requestPath: req.originalUrl, requestMethod: req.method, isLoggedIn: req.isAuthenticated() });
});
function getCurrentUser(req) {
    if (req.user === undefined || req.user === null)
        return "";
    return req.user.username;
}
