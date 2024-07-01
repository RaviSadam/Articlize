"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Decompress;
const zlib_1 = __importDefault(require("zlib"));
function Decompress(data) {
    return new Promise((resolve, reject) => {
        const buffer = Buffer.from(data, 'base64');
        zlib_1.default.gunzip(buffer, (err, buffer) => {
            if (err) {
                return reject(err);
            }
            resolve(buffer.toString());
        });
    });
}
