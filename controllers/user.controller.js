const User = require('../models/user.model');
const ApiResponse = require('../helpers/apiresponse.helper');
const formidable = require('formidable');
const _ = require('lodash');
const fs = require('fs');
const { isValidObjectId } = require('../helpers/modelhelper.helper');


const userViewmodel = (user) => {
    return {
        username: user.username,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        id: user.id,
        isActive: user.isActive,
        photo: user.photo,
        following: user.following,
        followers: user.followers
    }
};

module.exports = {
    /**
     * Get User by Id API
     * @route GET /users/:Id
     * @group User
     * @param {string} id.param.required - user Id    
     * @returns {object}  200 - { payload: User Object,message:null}
     * @returns {string} 500 - { message: Server error message}
     * @security JWT
     */
    userById: async (req, res) => {
        try {
            if (!isValidObjectId(req.params.id))
                throw new Error("Invalid user id");

            var user = await User.findById(req.params.id)
                .populate('following', 'id name')
                .populate('followers', 'id name')
                .exec();
            ApiResponse.success(res, userViewmodel(user));
        } catch (err) {
            ApiResponse.handleError500(res, err.message || err);
        }
    },
    /**
     * Update User by Id API, body parameter must be FormData object
     * @route PUT /users/:Id
     * @group User
     * @param {string} id.param.required - user Id  
     * @param {string} firstName.body.required - first name
     * @param {string} lastName.body.required - last name
     * @param {string} email.body.required - email
     * @param {file}   photo.body - Profile photo
     * @returns {object} 200 - { payload: User Object,message:null}
     * @returns {string} 500 - { message: Server error message}
     * @security JWT
     */
    update: (req, res) => {

        if (!isValidObjectId(req.params.id))
            return ApiResponse.handleError(res, 400, "Invalid user id");

        let form = new formidable.IncomingForm();
        form.keepExtensions = true;

        form.parse(req, (err, fields, files) => {
            if (err) {
                return ApiResponse.handleError(res, 400, err.message || err);
            }

            let user = { ...fields };
            if (files.photo) {
                user.photo.data = fs.readFileSync(files.photo.path);
                user.photo.contentType = files.photo.type;
            }

            User.findByIdAndUpdate(req.params.id, user, { new: true, useFindAndModify: false })
                .then((user) => {
                    if (!user)
                        return ApiResponse.handleError(res, 400, 'User not found.');
                }).catch((err) => {
                    return ApiResponse.handleError(res, 400, err.message||err);
                })

            ApiResponse.success(res, null, 'User updated successfully');
        })
    },
    /**
     * Get all users
     * @route GET /users/
     * @group User
     * @param {string} page.query.required - page index 
     * @param {string} pageSize.query.required - page size
     * @returns {object} 200 - { payload: Paginated Array<User>,message:null}
     * @returns {string} 500 - { message: Server error message}
     * @security JWT
     */
    getAllUsers: async (req, res) => {
        try {
            let page = parseInt(req.query.page) || 1,
                limit = parseInt(req.query.pageSize) || 20,
                match = {};

            let totalDoc = await User.countDocuments(match);
            let users = await User.find(match).skip((page - 1) * limit)
                .limit(limit)
                .exec();

            let data = users.map(u => userViewmodel(u));

            ApiResponse.successPaginate(res, page, limit, totalDoc, data);
        } catch (err) {
            ApiResponse.handleError500(res, err.message || err);
        }
    },
   /**
     * Toggle User status
     * @route PUT /users/:id/changestatus/:status
     * @group User
     * @param {string} id.param.required - user Id
     * @param {boolean} status.body.required - status to be activated
     * @returns {object} 200 - {message:null}
     * @returns {string} 500 - { message: Server error message}
     * @security JWT
     */
    disable: async (req, res) => {
        const { id, status } = req.params;

        try {
            if (!isValidObjectId(id))
                throw new Error("Invalid post id");

            let user = await User.findByIdAndUpdate(id, { isActive: status }, { new: true, useFindAndModify: false });
            if (!user)
                throw new Error("User not found.");
            ApiResponse.success(res, null);
        } catch (err) {
            ApiResponse.handleError500(res, err.message || err);
        }
    },

    /**
     * Add User followers
     * @route PUT /users/follow
     * @group User
     * @param {string} userId.body.required - user Id(follower)
     * @param {string} followId.body.required - user Id to be followed
     * @returns {object} 200 - {payload:User Object(User to be followed), message:null}
     * @returns {string} 500 - { message: Server error message}
     * @security JWT
     */
    addFollower: async (req, res) => {
        try {
            // Add following
            // the login user 'req.body.userId' is following the user 'req.body.followId'
            await User.findByIdAndUpdate(req.body.userId, {
                $push: {
                    following: req.body.followId
                }
            })

            // Add follower
            // the login user 'req.body.userId' is a follower of the user 'req.body.followId'
            let user = await User.findByIdAndUpdate(req.body.followId, {
                $push: {
                    followers: req.body.userId
                }
            }, { new: true })
                .populate('following', 'id name')
                .populate('followers', 'id name')
                .exec();
            ApiResponse.success(res, userViewmodel(user));
        } catch (err) {
            ApiResponse.handleError(res, 400, err.message || err);
        }
    },
    /**
     * Remove User follwers
     * @route PUT /users/unfollow
     * @group User
     * @param {string} userId.body.required - user Id(follower)
     * @param {string} unfollowId.body.required - user Id to be unfollowed
     * @returns {object} 200 - {payload:User Object(User to be unfollowed), message:null}
     * @returns {string} 500 - { message: Server error message}
     * @security JWT
     */
    removeFollower: async (req, res) => {
        try {
            // Remove following
            await User.findByIdAndUpdate(req.body.userId, {
                $pull: {
                    following: req.body.unfollowId
                }
            })

            // Remove follower
            let user = await User.findByIdAndUpdate(req.body.unfollowId, {
                $pull: {
                    followers: req.body.userId
                }
            }, { new: true })
                .populate('following', 'id name')
                .populate('followers', 'id name')
                .exec();
            ApiResponse.success(res, userViewmodel(user));
        } catch (err) {
            ApiResponse.handleError(res, 400, err.message || err);
        }
    }
}