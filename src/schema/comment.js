const { gql } = require("apollo-server-express");

const commentSchema = gql`
  extend type Query {
    comments(cursor: String, limit: Int): CommentConnection!
    comment(id: ID!): Comment!
  }

  extend type Mutation {
    createComment(body: String!, messageId: String!): Comment!
    deleteComment(id: ID!): Boolean!
    updateComment(id: ID!, body: String!): Comment!
  }

  type CommentConnection {
    edges: [Comment!]!
    pageInfo: PageInfo!
  }

  type Comment {
    id: ID!
    body: String!
    user: User
    message: Message!
    createdAt: String!
    updatedAt: String!
  }

  extend type Subscription {
    commentCreated: CommentCreated!
  }

  type CommentCreated {
    comment: Comment!
  }
`;

module.exports = commentSchema;
