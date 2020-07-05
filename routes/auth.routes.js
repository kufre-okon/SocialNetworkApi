const express = require('express');
const controller = require('../controllers/auth.controller');
const { validate, user } = require('../validators');
const { checkDuplicateUsernameOrEmail } = require('../middlewares/verifySignUp');

const router = express.Router();

module.exports = (app) => {

    router.post('/signup',
        validate(user.createUserValidator()),
        checkDuplicateUsernameOrEmail,
        controller.signup);

    app.use("/api/auth", router);
}