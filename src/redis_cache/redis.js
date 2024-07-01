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
exports.moveDataFromRedisToDb = exports.checkHash = exports.addCountToHashField = exports.delHashAndAddCount = exports.getCount = exports.getAllCount = exports.subToCounter = exports.addToCounter = exports.delHasObj = exports.setHashObj = exports.getHashValue = exports.setHashKey = exports.getValue = exports.setKey = void 0;
exports.default = default_1;
const redis_1 = require("redis");
const blog_schema_1 = __importDefault(require("../db/blog_schema"));
const compress_1 = __importDefault(require("../compress_decompress/compress"));
const password = process.env.REDIS_PASSWORD || "Ravi@9390";
const host = process.env.REDIS_HOST || "redis-10287.c309.us-east-2-1.ec2.redns.redis-cloud.com";
const username = process.env.REDIS_USERNAME || "default";
let client;
function default_1() {
    return __awaiter(this, void 0, void 0, function* () {
        client = (0, redis_1.createClient)({
            password: password,
            username: username,
            socket: {
                port: 10287,
                host: host
            }
        });
        client.on("connect", () => console.log("connected to redis"));
        client.on("error", (err) => console.log("error occured while connecting to redis", err));
        yield client.connect();
    });
}
const setKey = function (key, value, ttl) {
    return __awaiter(this, void 0, void 0, function* () {
        const time = ttl || 5 * 60;
        return yield client.setEx(key, time, value);
    });
};
exports.setKey = setKey;
const getValue = function (key) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield client.get(key);
    });
};
exports.getValue = getValue;
const setHashKey = function (key, value, field, ttl) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.multi().hSet(key, field, value).expire(key, ttl).exec();
        return;
    });
};
exports.setHashKey = setHashKey;
const getHashValue = function (key) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield client.hGetAll(key);
    });
};
exports.getHashValue = getHashValue;
const setHashObj = function (key, fields, values, ttl) {
    return __awaiter(this, void 0, void 0, function* () {
        const multi = client.multi();
        for (let i = 0; i < fields.length; i++) {
            multi.hSet(key, fields[i], values[i]);
        }
        multi.expire(key, ttl);
        yield multi.exec();
    });
};
exports.setHashObj = setHashObj;
const delHasObj = function name(key) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.DEL(key);
    });
};
exports.delHasObj = delHasObj;
const addToCounter = function name(key, fields) {
    return __awaiter(this, void 0, void 0, function* () {
        const multi = client.multi();
        for (let field of fields) {
            multi.hIncrBy(key, field, 1);
        }
        yield multi.exec();
    });
};
exports.addToCounter = addToCounter;
const subToCounter = function (key, fields) {
    return __awaiter(this, void 0, void 0, function* () {
        const multi = client.multi();
        for (let field of fields) {
            multi.hIncrBy(key, field, -1);
        }
        yield multi.exec();
    });
};
exports.subToCounter = subToCounter;
const getAllCount = function name(key) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield client.hGetAll(key);
    });
};
exports.getAllCount = getAllCount;
const getCount = function (key, field) {
    return __awaiter(this, void 0, void 0, function* () {
        return yield client.hGet(key, field);
    });
};
exports.getCount = getCount;
const delHashAndAddCount = function (hashKey, CKey, fields) {
    return __awaiter(this, void 0, void 0, function* () {
        const multi = client.multi();
        multi.del(hashKey);
        for (let field of fields) {
            multi.hIncrBy(CKey, field, 1);
        }
        yield multi.exec();
    });
};
exports.delHashAndAddCount = delHashAndAddCount;
const addCountToHashField = function (key, field) {
    return __awaiter(this, void 0, void 0, function* () {
        yield client.hIncrBy(key, field, 1);
    });
};
exports.addCountToHashField = addCountToHashField;
const checkHash = function (key) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield client.hLen(key);
        return data != 0;
    });
};
exports.checkHash = checkHash;
const moveDataFromRedisToDb = function (suffix) {
    return __awaiter(this, void 0, void 0, function* () {
        const data = yield client.SCAN(0, { TYPE: 'HASH', MATCH: "*" + suffix });
        for (let key of data.keys) {
            const blog = yield client.hGetAll(key);
            blog.body = yield (0, compress_1.default)(blog.body);
            blog_schema_1.default.updateOne({ _id: key.slice(0, key.length - 1) }, { body: blog.body });
            (0, exports.delHasObj)(key);
        }
    });
};
exports.moveDataFromRedisToDb = moveDataFromRedisToDb;
