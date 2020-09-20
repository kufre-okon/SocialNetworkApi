const express = require('express');
const controller = require('../controllers/post.controller');
const { validate, post } = require('../validators');
const { requireSignIn } = require('../middlewares/verifyAuthentication');

const router = express.Router();

module.exports = (app) => {

    router.get("/", controller.getPosts);
    router.post('/',
        requireSignIn,
        controller.createPost,
        validate(post.createPostValidator()));
    router.get('/:id/photo', controller.getPhoto);
    router.get('/:id',
        controller.getPostById);
    router.delete('/:id',
        requireSignIn,
        controller.deletePost);
    router.put('/:id/unlike',
        requireSignIn,
        controller.unlike);
    router.put('/:id/like',
        requireSignIn,
        controller.like);
    router.put('/:id/comment',
        requireSignIn,
        controller.comment);
    router.put('/:id/uncomment',
        requireSignIn,
        controller.uncomment);
    router.put('/:id',
        requireSignIn,
        controller.updatePost,
        validate(post.createPostValidator()));

    app.use("/api/posts", router);
}