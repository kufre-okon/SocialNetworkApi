const mongoose = require('mongoose');
const baseSchema = require('./basemodel.model');
const { ObjectId } = mongoose.Schema;

const postSchema = new mongoose.Schema({
    title: {
        type: String,
        required: 'Title is required',
        minlength: 4,
        max: 150
    },
    body: {
        type: String,
        required: 'Body is required',
        minlength: 4,
        max: 2000
    },
    photo: {
        data: Buffer,
        contentType: String
    },
    postedBy: {
        type: ObjectId,
        ref: "User"
    },
    likes: [{ type: ObjectId, ref: 'User' }],
    comments: [{
        text: { type: String },
        createdAt: { type: Date, default: Date.now },
        postedBy: { type: ObjectId, ref: 'User' }
    }]
}, {
    timestamps: true
})

baseSchema.replaceIndex(postSchema);
const Post = mongoose.model('Post', postSchema);

module.exports = Post;

