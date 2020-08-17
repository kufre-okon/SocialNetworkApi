const ApiResponse = require('../helpers/apiresponse.helper');
const { body, validationResult } = require('express-validator');


const validate = (validations) => {
    return async (req, res, next) => {
        await Promise.all(validations.map(validation => validation.run(req)));

        const errors = validationResult(req);
        if (errors.isEmpty()) {
            return next();
        }
        let firstMsg = errors.array()[0].msg;
        return ApiResponse.handleValidationError(res, firstMsg);
    }
};

const validator = {
    validate: validate,
    post: require('./post.validator'),
    user: require('./user.validator')
}

module.exports = validator;