const { body } = require('express-validator');

module.exports = {
    createPostValidator: (req, res, next) => {

        return [
            // title
            body('title', "Title is required").notEmpty(),
            body('title', "Title must be between 4 to 150 characters").isLength({
                min: 4, max: 150
            }),

            // body
            body('body', "Body is required").notEmpty(),
            body('body', "Body must be between 4 to 2000 characters").isLength({
                min: 4, max: 2000
            })
        ]
    }
}