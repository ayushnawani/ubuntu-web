const { Schema, model } = require('mongoose');

const FolderSchema = new Schema({
  parent: Schema.Types.ObjectId,
  name: String,
});

module.exports = model('Folder', FolderSchema);
