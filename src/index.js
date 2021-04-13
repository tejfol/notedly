import express from 'express';
import dotenv from 'dotenv';
import { ApolloServer } from 'apollo-server-express';
dotenv.config({ silent: process.env.NODE_ENV === 'production' });

import db from './db.js';
import models from './models/index.js';
import typeDefs from './schema.js';
import resolvers from './resolvers/index.js';

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const app = express();

db.connect(DB_HOST);

const server = new ApolloServer({
  typeDefs,
  resolvers,
  context: () => {
    return { models };
  }
});

server.applyMiddleware({ app, path: '/api' });

app.get('/', (req, res) => res.send('Hellow World!'));

app.listen(port, () =>
  console.log(`listening on port ${port}${server.graphqlPath}`)
);
