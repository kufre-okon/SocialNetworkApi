const { body } = require('express-validator');

module.exports = {
    passwordResetValidator: (req, res, next) => {

        return [
            
            body('newPassword', "Password is required").notEmpty(),
            body('newPassword', "Password must contain at least 6 characters").isLength({
                min: 6
            }),            
        ]
    }    
}