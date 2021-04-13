import { gql } from 'apollo-server-express';

export default gql`
  type Note {
    id: ID!
    content: String!
    author: String!
  }

  type Mutation {
    newNote(content: String!): Note!
  }

  type Query {
    notes: [Note!]!
    note(id: ID!): Note!
  }
`;
