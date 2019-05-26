const { ApolloServer, gql } = require('apollo-server');
const { typeDefs } = require('./schema');
const { resolvers } = require('./resolvers');
const mongoose = require('mongoose');

mongoose.connect(process.env.DB_HOST, {
  useNewUrlParser: true,
});

mongoose.connection.once('open', () => {
  console.log('connected to database');
});

const server = new ApolloServer({
  typeDefs,
  resolvers,
});

server.listen({ port: 4000 }).then(({ url }) => {
  console.log(`Server ready at ${url}`);
});
