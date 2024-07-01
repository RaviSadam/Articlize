"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BlogStatus = void 0;
const mongoose_1 = require("mongoose");
var BlogStatus;
(function (BlogStatus) {
    BlogStatus[BlogStatus["PICK"] = 0] = "PICK";
    BlogStatus[BlogStatus["WRITING"] = 1] = "WRITING";
    BlogStatus[BlogStatus["REVIEW"] = 2] = "REVIEW";
    BlogStatus[BlogStatus["COMPLETED"] = 3] = "COMPLETED";
})(BlogStatus || (exports.BlogStatus = BlogStatus = {}));
const BlogSchema = new mongoose_1.Schema({
    _id: {
        type: String,
        default: () => (new mongoose_1.Types.ObjectId()).toString()
    },
    user: {
        type: String,
        ref: "User"
    },
    body: {
        type: String,
    },
    tag: { type: String },
    likes: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: BlogStatus,
        default: BlogStatus.PICK
    },
    title: {
        type: String,
        require: true
    },
    lastUpdate: {
        type: Date,
        default: () => Date.now(),
    },
    explanation: {
        type: String
    },
    likedUsers: {
        type: [String],
        default: () => []
    }
});
exports.default = (0, mongoose_1.model)("Blog", BlogSchema);
