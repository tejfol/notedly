import express from 'express';
import dotenv from 'dotenv';

import { ApolloServer } from 'apollo-server-express';
import depthLimit from 'graphql-depth-limit';
import { createComplexityLimitRule } from 'graphql-validation-complexity';

dotenv.config({ silent: process.env.NODE_ENV === 'production' });

import db from './db.js';
import { models } from './models/index.js';
import typeDefs from './schema.js';
import { resolvers } from './resolvers/index.js';
import jwt from 'jsonwebtoken';

import helmet from 'helmet';
import cors from 'cors';

const port = process.env.PORT || 4000;
const DB_HOST = process.env.DB_HOST;

const app = express();
app.use(helmet());
app.use(cors());

db.connect(DB_HOST);

const getUser = token => {
  if (token) {
    try {
      // return the user information from the token
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      // if there's a problem with the token, throw an error
      throw new Error('Session invalid');
    }
  }
};

// Apollo Server setup
const server = new ApolloServer({
  typeDefs,
  resolvers,
  validationRules: [depthLimit(5), createComplexityLimitRule(1000)],
  context: ({ req }) => {
    // get the user token from the headers
    const token = req.headers.authorization;
    // try to retrieve a user with the token
    const user = getUser(token);
    // for now, let's log the user to the console:
    console.log(user);
    // add the db models and the user to the context
    return { models, user };
  }
});

server.applyMiddleware({ app, path: '/api' });

app.get('/', (req, res) => res.send('Hellow World!'));

app.listen(port, () =>
  console.log(`listening on http://localhost:${port}${server.graphqlPath}`)
);
