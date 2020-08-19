const ApiResponse = require('../helpers/apiresponse.helper');
const Post = require('../models/post.model');
const formidable = require('formidable');
const fs = require('fs');
const { isValidObjectId } = require('../helpers/modelhelper.helper');

module.exports = {
    /**
     * Get all posts
     * @route GET /posts/
     * @group Post
     * @param {string} page.query.required - page index 
     * @param {string} pageSize.query.required - page size
     * @param {string} postedBy.query - User Id
     * @returns {object} 200 - { payload: Array<Post>,message:null}
     * @returns {string} 500 - { message: Server error message}
     * @security JWT
     */
    getPosts: async (req, res) => {
        try {
            let { postedBy, page, pageSize } = req.query;
            page = parseInt(page) || 1;
            pageSize = parseInt(pageSize) || 20;

            let match = {};
            if (postedBy) {
                if (!isValidObjectId(postedBy))
                    throw new Error("Invalid parameter 'postedBy'");
                match.postedBy = postedBy;
            }
            const totalDocs = await Post.countDocuments(match);
            const posts = await Post.find(match)
                .skip((page - 1) * pageSize)
                .limit(pageSize)
                .sort('createdAt')
                .populate('postedBy', "firstName lastName")
                .exec();
            ApiResponse.successPaginate(res, page, pageSize, totalDocs, posts);
        } catch (err) {
            ApiResponse.handleError(res, 400, err.message || err);
        }
    },
    /**
     * Create new post
     * @route POST /posts
     * @group Post   
     * @param {string} title.body.required - post title
     * @param {string} body.body.required - post body
     * @param {string} photo.body - post avater
     * @returns {object} 200 - { payload: Post object,message:null}
     * @returns {string} 500 - { message: Server error message}
     * @security JWT
     */
    createPost: (req, res) => {

        let form = new formidable.IncomingForm();
        form.keepExtensions = true;

        form.parse(req, (err, fields, files) => {

            if (err) {
                return ApiResponse.handleError(res, 400, err.message || err);
            }

            const post = new Post(fields);
            post.postedBy = req.user.id;
            if (files.photo) {
                post.photo.data = fs.readFileSync(files.photo.path)
                post.photo.contentType = files.photo.type
            }
            post.save().then(() => {
                ApiResponse.success(res, post);
            }).catch((err) => {
                ApiResponse.handleError(res, 400, err.message || err);
            });
        })
    },
    /**
     * Get post
     * @route GET /posts/:id
     * @group Post   
     * @param {string} id.param.required - post title
     * @returns {object} 200 - { payload: Post object,message:null}
     * @returns {string} 500 - { message: Server error message}
     * @security JWT
     */
    getPostById: async (req, res) => {
        try {
            if (!isValidObjectId(req.params.id))
                throw new Error("Invalid post id");

            let post = await Post.findById(req.params.id).populate('postedBy', 'firstName lastName');

            return ApiResponse.success(res, post);
        } catch (err) {
            ApiResponse.handleError(res, 400, err.message || err);
        }
    },
    /**
     * Update post
     * @route PUT /posts/:id
     * @group Post   
     * @param {string} id.param.required - post Id
     * @param {string} title.body.required - post title
     * @param {string} body.body.required - post body
     * @param {string} photo.body - post avater
     * @returns {object} 200 - { payload: null,message:message}
     * @returns {string} 500 - { message: Server error message}
     * @security JWT
     */
    updatePost: (req, res) => {
        try {
            if (!isValidObjectId(req.params.id))
                throw new Error("Invalid post id");

            let form = new formidable.IncomingForm();
            form.keepExtensions = true;
            form.parse(req, (err, fields, files) => {

                if (err) {
                    throw new Error(err);
                }

                const post = { ...fields };

                if (files.photo) {
                    post.photo = {};
                    post.photo.data = fs.readFileSync(files.photo.path);
                    post.photo.contentType = files.photo.type;
                }
                Post.findByIdAndUpdate(req.params.id, post, { new: true, useFindAndModify: false })
                    .then((_post) => {
                        if (!_post)
                            throw new Error('Post not found');
                    }).catch((err) => {
                        return ApiResponse.handleError(res, 400, err.message || err);
                    });
                ApiResponse.success(res, null, 'Post updated successfully');
            })
        } catch (err) {
            ApiResponse.handleError(res, 400, err.message || err);
        }
    },
    /**
     * Delete post
     * @route DELETE /posts/:id
     * @group Post   
     * @param {string} id.param.required - post Id
     * @returns {object} 200 - { payload: null,message:null}
     * @returns {string} 500 - { message: Server error message}
     * @security JWT
     */
    deletePost: async (req, res) => {
        try {
            if (!isValidObjectId(req.params.id))
                throw new Error("Invalid post id");
            let post = await Post.findById(req.params.id);
            if (post) {
                if (post.postedBy != req.user.id)
                    return ApiResponse.handleError(res, 403);
                await post.remove();
            }
            return ApiResponse.success(res);
        } catch (err) {
            ApiResponse.handleError(res, 400, err.message || err);
        }
    }
}