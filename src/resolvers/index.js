import Query from './query.js';
import Mutation from './mutation.js';
import pkg from 'graphql-iso-date';
const { GraphQLDateTime } = pkg;

export default [Query, Mutation, { DateTime: GraphQLDateTime }];
