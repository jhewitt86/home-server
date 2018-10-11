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
  }

  type MessageConnection {
    edges: [Message!]!
    pageInfo: PageInfo!
  }

  type PageInfo {
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
  }

  extend type Subscription {
    messageCreated: MessageCreated!
  }

  type MessageCreated {
    message: Message!
  }
`;

module.exports = messageSchema;
