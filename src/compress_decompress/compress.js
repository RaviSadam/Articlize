"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Compress;
const zlib_1 = __importDefault(require("zlib"));
function Compress(data) {
    return new Promise((resolve, reject) => {
        zlib_1.default.gzip(data, (err, buffer) => {
            if (err) {
                reject(err);
            }
            else {
                const base64String = buffer.toString('base64');
                resolve(base64String);
            }
        });
    });
}
