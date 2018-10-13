const { gql } = require("apollo-server-express");

const messageSchema = gql`
  extend type Query {
    messages(cursor: String, limit: Int): MessageConnection!
    message(id: ID!): Message!
  }

  extend type Mutation {
    createMessage(title: String!, body: String!, public: Boolean!): Message!
    deleteMessage(id: ID!): Boolean!
    updateMessage(id: ID!, body: String!): Message!
    incrementComments(id: ID!): Message!
    decrementComments(id: ID!): Message!
  }

  type MessageConnection {
    edges: [Message!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
    total: Int!
    hasNextPage: Boolean!
    endCursor: String!
  }

  type Message {
    id: ID!
    title: String!
    body: String!
    user: User!
    createdAt: String!
    updatedAt: String!
    public: Boolean!
    comments: [Comment!]
    commentCount: Int!
  }

  extend type Subscription {
    messageCreated: MessageCreated!
  }

  type MessageCreated {
    message: Message!
  }
`;

module.exports = messageSchema;
