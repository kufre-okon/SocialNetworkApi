const mongoose = require('mongoose');
const baseSchema = require('./basemodel.model');
const bcrypt = require('bcryptjs');
const { ObjectId } = mongoose.Schema;

const userSchema = new mongoose.Schema({
    lastName: {
        type: String,
        trim: true,
        required: true
    },
    firstName: {
        type: String,
        trim: true,
        required: true
    },
    username: {
        type: String,
        trim: true,
        required: true
    },
    email: {
        type: String,
        trim: true,
        required: true
    },
    hashPassword: {
        type: String,
        required: true
    },
    salt: {
        type: String
    },
    photo: {
        data: Buffer,
        contentType: String
    },
    about: {
        type: String,
        trim: true
    },
    /** list of users you are following */
    following: [{
        type: ObjectId,
        ref: 'User'
    }],
    /** list of users following you */
    followers: [{
        type: ObjectId,
        ref: 'User'
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

// virtual field
userSchema.virtual('password')
    .set(function (password) {
        // create temporary variable called password
        this._password = password;
        this.salt = bcrypt.genSaltSync(8);
        // encrypt the password
        this.hashPassword = this.encryptPassword(password);
    })
    .get(function () {
        return this._password;
    });

// methods
userSchema.methods = {
    authenticate: function (password) {
        try {
            return bcrypt.compareSync(password, this.hashPassword);
        } catch (err) {
            console.log("authenticatePassword", err)
            return false;
        }
    },
    encryptPassword: function (password) {
        if (!password) return "";
        try {
            return bcrypt.hashSync(password, this.salt);
        } catch (err) {
            console.log("encryptPassword", err)
            return "";
        }
    }
}

baseSchema.replaceIndex(userSchema);

const User = mongoose.model('User', userSchema);

module.exports = User;
