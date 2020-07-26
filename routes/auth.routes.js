const express = require('express');
const controller = require('../controllers/auth.controller');
const { validate, user: userValiate } = require('../validators');
const { checkDuplicateUsernameOrEmail } = require('../middlewares/verifySignUp');

const router = express.Router();

module.exports = (app) => {

    router.post('/signup',
        validate(userValiate.createUserValidator()),
        checkDuplicateUsernameOrEmail,
        controller.signup);
    router.post('/signin', controller.signin);


    app.use("/api/auth", router);
}