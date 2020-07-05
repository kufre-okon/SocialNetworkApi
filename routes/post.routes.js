const express = require('express');
const controller = require('../controllers/post.controller');
const validator = require('../validators');
const router = express.Router();

module.exports = (app) => {

    router.get("/", controller.getPosts);
    router.post('/',
        validator.validate(validator.post.createPostValidator()),
        controller.createPost);

    app.use("/api/posts", router);
}