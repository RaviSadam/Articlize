"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const CommentSchema = new mongoose_1.Schema({
    content: { type: String, required: true },
    author: { type: String, required: true, mutable: false },
    createdAt: { type: Date, default: () => Date.now() },
    updatedAt: { type: Date, default: () => Date.now() }
});
CommentSchema.methods.addAuther = function (auther) {
    this.auther = auther;
};
exports.default = (0, mongoose_1.model)("comments", CommentSchema);
