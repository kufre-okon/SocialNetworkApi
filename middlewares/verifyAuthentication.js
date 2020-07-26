const jwt = require('jsonwebtoken');
const config = require('../config/config');
const ApiResponse = require('../helpers/apiresponse.helper');

module.exports = {
    requireSignIn: (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, config.JWT_SECRET, (err, user) => {
                if (err) {
                    return ApiResponse.handleError(res, 401);
                }

                req.user = user;
                next();
            })
        } else {
            return ApiResponse.handleError(res, 401);
        }
    }
}