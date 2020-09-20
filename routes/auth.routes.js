const express = require('express');
const controller = require('../controllers/auth.controller');
const { validate, user: userValiate, password } = require('../validators');
const { checkDuplicateUsernameOrEmail } = require('../middlewares/verifySignUp');

const router = express.Router();

module.exports = (app) => {

    router.post('/signup',
        validate(userValiate.createUserValidator()),
        checkDuplicateUsernameOrEmail,
        controller.signup);
    router.post('/signin', controller.signin);
    router.post('/forgotpassword', controller.forgotPassword)
    router.post('/resetpassword',
        validate(password.passwordResetValidator()),
        controller.resetPassword)
    router.post('/changepassword',
        validate(password.passwordResetValidator()),
        controller.changePassword)

    router.post('/sociallogin', controller.socialLogin)

    app.use("/api/auth", router);
}