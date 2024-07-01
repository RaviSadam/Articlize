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
const mongoose_1 = __importStar(require("mongoose"));
const passport_local_mongoose_1 = __importDefault(require("passport-local-mongoose"));
const bcrypt_1 = __importDefault(require("bcrypt"));
const UserSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        default: () => (new mongoose_1.default.Types.ObjectId()).toString()
    },
    username: {
        type: String,
        lowercase: true,
        minLength: 5,
        maxLength: 20,
        require: true,
        unique: true,
        mutable: false,
        trim: true
    },
    password: {
        type: String
    },
    roles: [{
            type: String,
            default: () => "user"
        }],
    age: {
        type: Number,
        min: 1,
        max: 80,
        require: false
    },
    email: {
        type: String,
        require: true,
        trim: true,
        unique: true,
        match: [
            /^[\w.-]+@[\w.-]+\.\w{2,3}$/,
            'Please provide a valid email address',
        ],
        mutable: false,
    },
    phone: {
        type: String,
        require: false,
        match: [/^(\+([1-9]{1,2}))?([1-9][0-9]{9})$/, 'Invalid Modile Number']
    },
    firstName: {
        type: String,
        require: true,
        minLength: 3,
        maxLength: 30
    },
    lastName: {
        type: String,
        require: false
    },
    createdDate: {
        type: Date,
        default: () => Date.now(),
        mutable: false
    },
    updatedDate: {
        type: Date,
        default: () => Date.now()
    },
    hobbies: [{ type: String }]
});
UserSchema.plugin(passport_local_mongoose_1.default);
UserSchema.pre("save", function (next) {
    return __awaiter(this, void 0, void 0, function* () {
        const password = this.password || new Buffer("");
        if (typeof password === "string") {
            this.password = yield bcrypt_1.default.hash(password, 12);
        }
        next();
    });
});
UserSchema.methods.isValidPassword = function (password) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield bcrypt_1.default.compare(password, this.password);
    });
};
UserSchema.methods.hasRole = function (role) {
    return this.roles.includes(role);
};
exports.default = (0, mongoose_1.model)("user", UserSchema);
