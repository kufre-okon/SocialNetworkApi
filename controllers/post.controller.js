const ApiResponse = require('../helpers/apiresponse.helper');
const Post = require('../models/post.model');

module.exports = {
    getPosts: async (req, res) => {
        const posts = await Post.find({});
        ApiResponse.success(res, posts);
    },

    createPost: async (req, res) => {
        try {            
            const post = new Post(req.body);
            await post.save();

            ApiResponse.success(res, post);
        } catch (err) {
            ApiResponse.handleError500(res, err.message || err);
        }
    }
}