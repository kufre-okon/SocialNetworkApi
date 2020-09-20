const jwt = require('jsonwebtoken');
const ApiResponse = require('../helpers/apiresponse.helper');

module.exports = {
    requireSignIn: (req, res, next) => {
        const authHeader = req.headers.authorization;
        if (authHeader) {
            const token = authHeader.split(' ')[1];
            jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
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