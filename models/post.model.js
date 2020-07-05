const mongoose = require('mongoose');
const baseSchema = require('./basemodel.model');

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
    }
}, {
    timestamps: true
})

baseSchema.replaceIndex(postSchema);
const Post = mongoose.model('Post', postSchema);

module.exports = Post;

