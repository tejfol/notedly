import { Query } from './query.js';
import { Mutation } from './mutation.js';
import pkg from 'graphql-iso-date';
import { Note } from './note.js';
import { User } from './user.js';
const { GraphQLDateTime } = pkg;

export const resolvers = {
  Query,
  Mutation,
  DateTime: GraphQLDateTime,
  Note,
  User
};
