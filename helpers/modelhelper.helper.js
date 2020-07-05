var mongoose = require('mongoose');

module.exports = {
    getObjectId(idString) {
        return mongoose.Types.ObjectId(idString);
    }
}