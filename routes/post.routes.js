const express = require('express');
const controller = require('../controllers/post.controller');
const { validate, post } = require('../validators');
const { requireSignIn } = require('../middlewares/verifyAuthentication');

const router = express.Router();

module.exports = (app) => {

    router.get("/", requireSignIn, controller.getPosts);
    router.post('/',
        requireSignIn,
        controller.createPost,
        validate(post.createPostValidator()));
    router.get('/:id',
        requireSignIn,
        controller.getPostById);
    router.delete('/:id',
        requireSignIn,
        controller.deletePost);
    router.put('/:id',
        requireSignIn,
        controller.updatePost,
        validate(post.createPostValidator()));

    app.use("/api/posts", router);
}