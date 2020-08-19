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
    /**
     * SignUp API
     * @route POST /auth/signup
     * @group Authentication
     * @param {string} firstName.body.required - first name
     * @param {string} lastName.body.required - last name
     * @param {string} email.body.required - email
     * @param {string} username.body.required - username
     * @param {string} password.body.required - user's password.
     * @returns {object}  200 - { payload: User Object,message: null}
     * @returns { object} 400 - { message:Validation error message}
     * @returns { object} 403 - { message:Validation error message}
     * @returns { string} 500 - { message:Server error message}
     */
    signup: async (req, res) => {
        try {
            const user = await new User(req.body);
            await user.save();
            ApiResponse.success(res, userViewmodel(user));
        } catch (err) {
            ApiResponse.handleError500(res, err.message || err);
        }
    },
    /**
     * SignIn API
     * @route POST /auth/signin
     * @group Authentication
     * @param {string} login.body.required - username or email - eg: user@domain
     * @param {string} password.body.required - user's password.
     * @returns { object } 200 - { payload: User login object,message: null}
     * @returns { object } 400 - { message:Invalid username or password}
     * @returns { string } 500 - { message:Server error}
     */
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
