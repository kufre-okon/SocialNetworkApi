const { body } = require('express-validator');

module.exports = {
    createUserValidator: (req, res, next) => {

        return [
            body('username', "Username is required").notEmpty(),
            body('username', "Username must be between 4 to 100 characters").isLength({
                min: 4, max: 150
            }),

            body('password', "Password is required").notEmpty(),
            body('password', "Password must contain at least 6 characters").isLength({
                min: 6
            }),

            body('email', "Email is required").notEmpty(),
            body('email', "Email is invalid").isEmail(),

            body('firstName', "FirstName is required").notEmpty(),
            body('lastName', "LastName is required").notEmpty(),
        ]
    },
    updateUserValidator: (req, res, next) => {

        return [

            body('email', "Email is required").notEmpty(),
            body('email', "Email is invalid").isEmail(),

            body('firstName', "FirstName is required").notEmpty(),
            body('lastName', "LastName is required").notEmpty(),
        ]
    }
}