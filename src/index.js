import express from 'express';

import { ApolloServer, gql } from 'apollo-server-express';

// config.js
dotenv.config({ silent: process.env.NODE_ENV === 'production' });
import dotenv from 'dotenv';

//Database
import db from './db.js';
import models from './models/index.js';

//env imports
const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

//Apollo scheme
const typeDefs = gql`
  type Note {
    id: ID!
    content: String!
    author: String!
  }
  type Query {
    hello: String!
    notes: [Note!]!
    note(id: ID!): Note!
  }
  type Mutation {
    newNote(content: String!): Note!
  }
`;

const resolvers = {
  Query: {
    hello: () => 'Hello WoRld!',
    notes: async () => {
      return await models.Note.find();
    },
    note: async (parent, args) => {
      return await models.Note.findById(args.id);
    }
  },
  Mutation: {
    newNote: async (parent, args) => {
      return await models.Note.create({
        content: args.content,
        author: 'Adam Scott'
      });
    }
  }
};

//Initialized server
const app = express();
db.connect(DB_HOST);

//Apollo server setup
const server = new ApolloServer({ typeDefs, resolvers });
server.applyMiddleware({ app, path: '/api' });

app.get('/', (req, res) => res.send('Hellow World!'));

//Listener
app.listen(port, () =>
  console.log(`listening on port ${port}${server.graphqlPath}`)
);
