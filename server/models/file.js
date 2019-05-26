const { Schema, model } = require('mongoose');

const FileSchema = new Schema({
  parent: Schema.Types.ObjectId,
  name: String,
  data: String,
});

FileSchema.virtual('fild_id').get(function() {
  return this._id;
});

module.exports = model('File', FileSchema);
