
const ROLES = [];

const User = require('../models/user.model');
const ApiResponse = require('../helpers/apiresponse.helper');


const checkDuplicateUsernameOrEmail = async (req, res, next) => {

    // username
    let user = await User.findOne({
        'username': req.body.username
    });
    if (user) {
        ApiResponse.handleError(res, 403, 'Username is already taken!');
        return;
    }

    // email
    user = await User.findOne({
        'email': req.body.email
    });
    if (user) {
        ApiResponse.handleError(res, 403, 'Email is already taken!');
        return;
    }

    next();
}

const checkRolesExisted = (req, res, next) => {
    if (req.body.roles) {
        const roles = req.body.roles;
        for (let i = 0; i < roles.length; i++) {
            if (!ROLES.includes(roles[i])) {
                res.status(400).send({
                    message: `Failed! Role ${roles[i]} does not exist!`
                })
                return;
            }
        }
    }

    next();
}

const verifySignUp = {
    checkDuplicateUsernameOrEmail,
    checkRolesExisted
}

module.exports = verifySignUp;