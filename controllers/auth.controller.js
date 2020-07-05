const User = require('../models/user.model');
const ApiResponse = require('../helpers/apiresponse.helper');

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
        const user = await User.findOne({
            $or: [
                { 'username': req.body.login },
                { 'email': req.body.login }
            ]
        });
        if (!user)
            ApiResponse.handleError(res, 400, 'Invalid username or password');

    }
}
