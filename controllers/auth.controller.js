const User = require('../models/user.model');
const ApiResponse = require('../helpers/apiresponse.helper');
const jsonwebtoken = require('jsonwebtoken');
const emailAdmin = require('../helpers/emailAdmin');

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
                    process.env.JWT_SECRET, {
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
    },

    /**
     * Forgot password API
     * @route POST /auth/forgotpassword
     * @group Authentication
     * @param {string} email.body.required - user email - eg: user@domain     
     * @returns { object } 200 - { payload: null,message: ""}
     * @returns { object } 400 - { message:Invalid email}
     * @returns { string } 500 - { message:Server error}
     */
    forgotPassword: async (req, res) => {
        const { email } = req.body;
        try {
            const user = await User.findOne({ email });
            if (user) {
                const token = jsonwebtoken.sign(
                    {
                        id: user.id,
                        iss: "SOCIALNETWORK_API"
                    },
                    process.env.JWT_SECRET, {
                    expiresIn: 259200 // 72hours
                });

                const emailData = {
                    text: `Please use the following link to reset your password: ${process.env.CLIENT_URL}/resetpassword/${token}`,
                    html: `<p>Please use the following link to reset your password:</p><p>${process.env.CLIENT_URL}/resetpassword/${token}</p>`
                }
                await user.updateOne({ resetPasswordLink: token })
 
                emailAdmin.send(email, "Password Reset Instructions", emailData.text, emailData.html);

                console.log(emailData.text)
                ApiResponse.success(res, null, `Email has been sent to ${email}. Follow the instructions to reset your password.`);
            }
            else {
                ApiResponse.handleError(res, 400, 'Email does not exist');
            }
        } catch (err) {
            ApiResponse.handleError500(res, err.message || err);
        }
    },

    /**
     * Change password API
     * @route POST /auth/changePassword
     * @group Authentication
     * @param {string} userId.body.required - user id  
     * @param {string} oldPassword.body.required - user old password  
     * @param {string} newPassword.body.required - user new password   
     * @returns { object } 200 - { payload: null,message: ""}
     * @returns { object } 400 - { message:Invalid userId or password}
     * @returns { string } 500 - { message:Server error}
     */
    changePassword: async (req, res) => {
        const { userId, newPassword, oldPassword } = req.body;
        try {
            const user = await User.findById(userId);
            if (user) {
                if (!user.authenticate(oldPassword))
                    return ApiResponse.handleError(res, 400, 'Invalid old password');

                await user.updateOne({ password: newPassword })
                ApiResponse.success(res, null, 'Password changed successfully');
            }
            else {
                ApiResponse.handleError(res, 400, 'Invalid user');
            }
        } catch (err) {
            ApiResponse.handleError500(res, err.message || err);
        }
    },

    /**
     * Reset password API
     * @route POST /auth/resetpassword
     * @group Authentication
     * @param {string} resetPasswordToken.body.required - token sent in the email
     * @param {string} newPassword.body.required - user's new password.
     * @returns { object } 200 - { payload: null,message: null}
     * @returns { object } 400 - { message:resetPasswordLink}
     * @returns { string } 500 - { message:Server error}
     */
    resetPassword: async (req, res) => {
        const { resetPasswordToken, newPassword } = req.body;

        try {
            const user = await User.findOne({ resetPasswordLink: resetPasswordToken });
            if (user) {
                const updatedFields = {
                    password: newPassword,
                    resetPasswordLink: ''
                }
                //  user = Object.assign(user, updatedFields);                
                await user.update(updatedFields);

                ApiResponse.success(res, null, "Password reset succesfully");
            }
            else {
                ApiResponse.handleError(res, 400, 'Invalid reset password token');
            }
        } catch (err) {
            ApiResponse.handleError500(res, err.message || err);
        }
    },

    /**
     * Social Login API
     * @route POST /auth/sociallogin
     * @group Authentication
     * @param {string} email.body.required - user email  
     * @param {string} username.body.required - username
     * @param {string} lastName.body.required - user lastName
     * @param {string} firstName.body.required - user firstName
     * @param {string} password.body.required - user password      
     * @returns { object } 200 - { payload: null,message: null}
     * @returns { object } 400 - { message:resetPasswordLink}
     * @returns { string } 500 - { message:Server error}
     */
    socialLogin: async (req, res) => {

        try {
            let user = await User.findOne({ email:req.body.email });
            if (!user) {
                // create new user
                user = new User(req.body);
                user.save();
            } else {
                // update an existing user                           
                await user.update(req.body);
            }
            // generate a token with user id and secret
            const token = jsonwebtoken.sign(
                { id: user.id, iss: "SOCIALNETWORK_API" },
                process.env.JWT_SECRET
            );
            return ApiResponse.success(res, { accessToken: token, user: userViewmodel(user) });
        } catch (err) {
            ApiResponse.handleError500(res, err.message || err);
        }
    }
}
