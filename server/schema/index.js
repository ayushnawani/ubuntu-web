const { gql } = require('apollo-server');

const typeDefs = gql`
  type Query {
    baseFiles: [File]
    baseFolders: [Folder]
  }

  type Mutation {
    addFile(name: String!, parent: ID, data: String): File
    addFolder(name: String!, parent: ID): Folder
    delete(id: ID!, type: String!): ID
  }

  type File {
    id: ID
    parent: ID
    name: String
    data: String
  }

  type Folder {
    id: ID
    parent: ID
    name: String
    folders: [Folder]
    files: [File]
  }
`;

module.exports = { typeDefs };
