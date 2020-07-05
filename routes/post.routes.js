const express = require('express');
const controller = require('../controllers/post.controller');
const { validate, post } = require('../validators');
const router = express.Router();

module.exports = (app) => {

    router.get("/", controller.getPosts);
    router.post('/',
        validate(post.createPostValidator()),
        controller.createPost);

    app.use("/api/posts", router);
}