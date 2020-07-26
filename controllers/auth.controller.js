const User = require('../models/user.model');
const ApiResponse = require('../helpers/apiresponse.helper');
const jsonwebtoken = require('jsonwebtoken');
const config = require('../config/config');


const userViewmodel = (user) => {
    return {
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        id: user.id
    }
};

module.exports = {
    signup: async (req, res) => {
        try {
            const user = await new User(req.body);
            await user.save();
            ApiResponse.success(res, userViewmodel(user));
        } catch (err) {
            ApiResponse.handleError500(res, err.message || err);
        }
    },
    signin: async (req, res) => {
        const { login, password } = req.body;
        try {
            const user = await User.findOne({
                $or: [
                    { 'username': login },
                     { 'email': login }
                ]
            });
            if (user && user.authenticate(password)) {
                let userVm = userViewmodel(user);
                let token = jsonwebtoken.sign({ id: user.id },
                    config.JWT_SECRET, {
                    expiresIn: 86400 // 24hours
                });

                ApiResponse.success(res, { accessToken: token, user: userViewmodel(userVm) });
            }
            else {
                ApiResponse.handleError(res, 400, 'Invalid username or password');
            }
        } catch (err) {
            ApiResponse.handleError500(res, err.message || err);
        }
    }
}
