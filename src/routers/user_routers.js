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
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const user_schema_1 = __importDefault(require("../db/user_schema"));
const { Router } = express_1.default;
const router = Router();
router.get("/register", (req, res) => {
    res.render("registration");
});
router.post("/register", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const user = new user_schema_1.default(req.body);
    try {
        yield user.save();
    }
    catch (err) {
        return next(err);
    }
    res.set("data", "User registration successful");
    res.redirect("/user/login");
}));
router.get("/login", (req, res) => {
    const data = req.headers.data;
    res.render(`login`, { data: data });
});
router.post("/login", (req, res, next) => {
    passport_1.default.authenticate('local', { failureRedirect: "/authFail" }, (err, user) => {
        if (err)
            return next(err);
        if (!user) {
            return res.status(401).json({ body: "Unauthorized request" });
        }
        req.logIn(user, (err) => __awaiter(void 0, void 0, void 0, function* () {
            if (err)
                return next(err);
            return next(null);
        }));
    })(req, res, next);
}, (req, res) => {
    if (typeof (req.query.next) === 'string') {
        res.redirect(req.query.next);
    }
    else {
        res.redirect("/home");
    }
});
router.put("/update/:username", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const username = req.params.username.trim();
    if (!username || username.length < 1)
        return res.status(400).json({ body: "username requried" });
    const user = yield user_schema_1.default.findOneAndUpdate({ username: username }, req.body);
    yield user.save();
    return res.send("OK");
}));
router.delete("/delete", (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    if (!req.isAuthenticated()) {
        return res.redirect("/user/login/?next=/user/delete");
    }
    const name = req.user.username;
    if (!name) {
        res.status(400).json({ response: "username requried" });
        next();
        return;
    }
    try {
        const user = yield user_schema_1.default.findOneAndDelete({ username: name });
        if (user)
            res.status(200).json({ response: "user deleted" });
        else
            res.status(404).json({ response: `no user fonund with give username ${name}` });
    }
    catch (err) {
        res.status(500).json({ response: "unknown error occured" });
    }
    res.end();
}));
router.all("/logout", (req, res, next) => {
    req.logOut((err) => {
        if (err)
            next(err);
        res.redirect("login");
    });
});
exports.default = router;
