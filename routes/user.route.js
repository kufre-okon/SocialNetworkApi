const router = require('express').Router();
const controller = require('../controllers/user.controller');
const { requireSignIn } = require('../middlewares/verifyAuthentication');
const { validate, user: userValidate } = require('../validators');

module.exports = (app) => {

    router.get('/', controller.getAllUsers);
    router.get('/:id/avatar', controller.getAvatar);
    router.get('/:id', controller.userById);
    router.put('/:id/follow',
        requireSignIn,
        controller.addFollower
    );
    router.put('/:id/unfollow',
        requireSignIn,
        controller.removeFollower
    );
    router.put('/:id/changestatus/:status',
        requireSignIn,
        controller.disable
    );
    router.put('/:id',
        requireSignIn,
        controller.update,
        validate(userValidate.updateUserValidator())
    );

    app.use('/api/users', router);
}
