const ApiResponse = require('../helpers/apiresponse.helper');
const Post = require('../models/post.model');
const formidable = require('formidable');
const fs = require('fs');
const { isValidObjectId } = require('../helpers/modelhelper.helper');


const postViewmodel = (post) => {
    return {
        title: post.title,
        body: post.body,
        id: post.id,
        postedBy: post.postedBy ? post.postedBy : {},
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
        likes: post.likes,
        comments: post.comments
    }
};

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
                .sort({ createdAt: -1 })
                .populate('postedBy', "firstName lastName")
                .exec();
            ApiResponse.successPaginate(res, page, pageSize, totalDocs, posts.map((p) => postViewmodel(p)));
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
                post.photo = {
                    data: fs.readFileSync(files.photo.path),
                    contentType: files.photo.type
                }
            }
            post.save().then(() => {
                ApiResponse.success(res, postViewmodel(post));
            }).catch((err) => {
                ApiResponse.handleError(res, 400, err.message || err);
            });
        })
    },

    /**
  * Get post image as stream
  * @param {string} id.param.required - post Id
  * @returns {object} 200 - image data stream
  */
    getPhoto: async (req, res) => {
        const { id } = req.params;
        const post = await Post.findById(id);
        if (post.photo && post.photo.data) {
            res.set('Content-Type', post.photo.contentType);
            res.send(post.photo.data);
        }

    },

    /**
     * Get post
     * @route GET /posts/:id
     * @group Post   
     * @param {string} id.param.required - post title
     * @returns {object} 200 - { payload: Post object,message:null}
     * @returns {string} 500 - { message: Server error message}     
     */
    getPostById: async (req, res) => {
        try {
            if (!isValidObjectId(req.params.id))
                throw new Error("Invalid post id");

            let post = await Post.findById(req.params.id)
                .populate('postedBy', 'firstName lastName')
                .populate('comments', 'id text createdAt')
                .populate('comments.postedBy', 'firstName lastName')
                .populate('likes', 'firstName lastName');

            return ApiResponse.success(res, postViewmodel(post));
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
                    post.photo = {
                        data: fs.readFileSync(files.photo.path),
                        contentType: files.photo.type
                    }
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
    },

    /**
     * Like a post
     * @route PUT /posts/:id/like
     * @group Post 
     * @param {string} id.param.required - post id
     * @param { string } userId.body.required - user id
     * @param { string } postId.body.required - post id
     * @returns {object} 200 - {Payload{post,message}}
     * @returns {object} 500 - {Payload{message}}
     * @security JWT
     */
    like: async (req, res) => {
        const { postId, userId } = req.body;
        try {
            let post = await Post.findByIdAndUpdate(postId, {
                $push: { likes: userId }
            }, { new: true })
                .populate('postedBy', 'firstName lastName')
                .populate('likes', 'firstName lastName')
                .exec();
            return ApiResponse.success(res, postViewmodel(post));
        } catch (err) {
            ApiResponse.handleError(res, 500, err.message || err);
        }
    },
    /**
    * UnLike a post
    * @route PUT /posts/:id/unlike
    * @group Post 
    * @param {string} id.param.required - post id
    * @param { string } userId.body.required - user id
    * @param { string } postId.body.required - post id
    * @returns {object} 200 - {Payload{post,message}}
    * @returns {object} 500 - {Payload{message}}
    * @security JWT
    */
    unlike: async (req, res) => {
        const { postId, userId } = req.body;
        try {
            let post = await Post.findByIdAndUpdate(postId, {
                $pull: { likes: userId }
            }, { new: true })
                .populate('postedBy', 'firstName lastName')
                .populate('likes', 'firstName lastName')
                .exec();
            return ApiResponse.success(res, postViewmodel(post));
        } catch (err) {
            ApiResponse.handleError(res, 500, err.message || err);
        }
    },
    /**
    * Comment on a post
    * @route PUT /posts/:id/comment
    * @group Post 
    * @param {string} id.param.required - post id
    * @param { string } userId.body.required - user id
    * @param { string } postId.body.required - post id
    * @param { string } text.body.required - comment text
    * @returns {object} 200 - {Payload{post,message}}
    * @returns {object} 500 - {Payload{message}}
    * @security JWT
    */
    comment: async (req, res) => {
        const { postId, userId, text } = req.body;
        let comment = { postedBy: userId, text };
        try {
            let post = await Post.findByIdAndUpdate(postId, {
                $push: { comments: comment }
            }, { new: true })
                .populate('postedBy', 'firstName lastName')
                .populate('likes', 'firstName lastName')
                .populate('comments', 'id text createdAt')
                .populate('comments.postedBy', 'firstName lastName')
                .exec();
            return ApiResponse.success(res, postViewmodel(post));
        } catch (err) {
            ApiResponse.handleError(res, 500, err.message || err);
        }
    },
    /**
    * Uncomment a post
    * @route PUT /posts/:id/uncomment
    * @group Post 
    * @param {string} id.param.required - post id
    * @param {string} commentId.body.required - comment id
    * @param {string} postId.body.required - post id
    * @returns {object} 200 - {Payload{post,message}}
    * @returns {object} 500 - {Payload{message}}
    * @security JWT
    */
    uncomment: async (req, res) => {
        const { postId, commentId } = req.body;
        try {
            let post = await Post.findByIdAndUpdate(postId, {
                $pull: { comments: { _id: commentId } }
            }, { new: true })
                .populate('postedBy', 'firstName lastName')
                .populate('likes', 'firstName lastName')
                .populate('comments', 'id text createdAt')
                .populate('comments.postedBy', 'firstName lastName')
                .exec();
            return ApiResponse.success(res, postViewmodel(post));
        } catch (err) {
            ApiResponse.handleError(res, 500, err.message || err);
        }
    }
}