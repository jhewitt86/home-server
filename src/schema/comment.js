const { gql } = require("apollo-server-express");

const commentSchema = gql`
  extend type Query {
    comments(cursor: String, limit: Int): CommentConnection!
    comment(id: ID!): Comment!
  }

  extend type Mutation {
    createComment(body: String!, messageId: String!): Comment!
    deleteComment(id: ID!): Comment!
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
    commentDeleted: CommentDeleted!
  }

  type CommentCreated {
    comment: Comment!
  }
  type CommentDeleted {
    result: Boolean!
  }
`;

module.exports = commentSchema;
