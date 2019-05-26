const File = require('../models/file');
const Folder = require('../models/folder');

const resolvers = {
  Query: {
    baseFiles: (root, args) => {
      return File.find({
        // parentId: null
      });
    },
    baseFolders: (root, args) => {
      return Folder.find({
        // parentId: null
      });
    },
  },
  Mutation: {
    addFile: (_, { parent, name, data }) => {
      let file = new File({
        parent,
        name,
        data,
      });

      return file.save();
    },

    addFolder: (_, { parent, name }) => {
      let folder = new Folder({
        parent,
        name,
      });

      return folder.save();
    },

    delete: async (_, { id, type }) => {
      if (type === 'FOLDER') {
        await Folder.findByIdAndDelete({ _id: id }).exec();
      }

      if (type === 'FILE') {
        await File.findByIdAndDelete({ _id: id }).exec();
      }

      return id;
    },
  },
};

module.exports = { resolvers };
