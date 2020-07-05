
module.exports = {
    replaceIndex: (schema) => {
        schema.set('toJSON', {
            virtuals: true,
            versionKey: false,
            transform: function (doc, ret) {
                delete ret._id;
                delete ret.__v;
            }
        });
        schema.set('toObject', {
            virtuals: true,
            versionKey: false,
            transform: function (doc, ret) {
                delete ret._id;
                delete ret.__v;
            }
        })
    }
}