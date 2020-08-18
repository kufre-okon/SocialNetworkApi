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
    userById: async (req, res) => {
        try {
            if (!isValidObjectId(req.params.id))
                throw new Error("Invalid post id");

            var user = await User.findById(req.params.id)
                .populate('following', 'id name')
                .populate('followers', 'id name')
                .exec();
            ApiResponse.success(res, userViewmodel(user));
        } catch (err) {
            ApiResponse.handleError500(res, err.message || err);
        }
    },
    update: (req, res) => {

        if (!isValidObjectId(req.params.id))
            return ApiResponse.handleError(res, 400, "Invalid post id");

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