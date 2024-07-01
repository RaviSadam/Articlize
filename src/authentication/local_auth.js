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
exports.default = default_1;
exports.isAuthenticated = isAuthenticated;
const passport_1 = __importDefault(require("passport"));
const passport_local_1 = __importDefault(require("passport-local"));
const user_schema_1 = __importDefault(require("../db/user_schema"));
const LocalStrategy = passport_local_1.default.Strategy;
const customFields = {
    usernameField: "username",
    passwordField: "password"
};
const verifyCallBack = (username, password, done) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const user = yield user_schema_1.default.findOne({ username: username }, { _id: 1, username: 1, password: 1 });
        if (!user) {
            return done(null, false);
        }
        if (!user.isValidPassword(password)) {
            return done(null, false);
        }
        done(null, user);
    }
    catch (err) {
        done(err, false);
    }
});
function default_1() {
    passport_1.default.use(new LocalStrategy(customFields, verifyCallBack));
    passport_1.default.serializeUser(user_schema_1.default.serializeUser());
    passport_1.default.deserializeUser(user_schema_1.default.deserializeUser());
    console.log("Passport local authentication eastablished");
}
function isAuthenticated(req, res, next) {
    if (!req.isAuthenticated()) {
        if (req.originalUrl.startsWith("/api")) {
            return res.status(401).json({ body: "unauthrozied request" });
        }
        return res.redirect(`/user/login?next=${req.originalUrl}`);
    }
    next();
}
