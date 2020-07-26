const router = require('express').Router();
const controller = require('../controllers/user.controller');
const { requireSignIn } = require('../middlewares/verifyAuthentication');
const { validate, user: userValidate } = require('../validators');

module.exports = (app) => {

    router.get('/', requireSignIn, controller.getAllUsers);
    router.get('/:id', requireSignIn, controller.userById);
    router.put('/:id',
        requireSignIn,
        controller.update,
        validate(userValidate.updateUserValidator())
    );
    router.put('/follow',
        requireSignIn,
        controller.addFollower
    );
    router.put('/unfollow',
        requireSignIn,
        controller.removeFollower
    );

    router.put('/:id/changestatus/:status',
        requireSignIn,
        controller.disable
    );

    app.use('/api/users', router);
}
