var mongoose = require('mongoose');

module.exports = {
    getObjectId: (idString) => {
        return mongoose.Types.ObjectId(idString);
    },
    isValidObjectId: (id) => {
        return mongoose.Types.ObjectId.isValid(id);
    }
}