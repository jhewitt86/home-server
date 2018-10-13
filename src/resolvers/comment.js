const uuid = require("uuid");
const { combineResolvers } = require("graphql-resolvers");
const { isAuthenticated, isCommentOwner } = require("./authorisation");
const Sequelize = require("sequelize");
const { pubsub, EVENTS } = require("../subscription");

const toCursorHash = string => Buffer.from(string).toString("base64");
const fromCursorHash = string =>
  Buffer.from(string, "base64").toString("ascii");

const commentResolver = {
  Query: {
    comments: async (parent, { cursor, limit = 100 }, { models }) => {
      console.log("........");
      const cursorOptions = cursor
        ? {
            where: {
              createdAt: {
                [Sequelize.Op.lt]: fromCursorHash(cursor)
              }
            }
          }
        : {};
      const comments = await models.Comment.findAll({
        order: [["createdAt", "DESC"]],
        limit: limit + 1,
        ...cursorOptions
      });

      const hasNextPage = comments.length > limit;
      const edges = hasNextPage ? comments.slice(0, -1) : comments;

      return {
        edges,
        pageInfo: {
          hasNextPage,
          endCursor: toCursorHash(edges[edges.length - 1].createdAt.toString())
        }
      };
    },
    comment: async (parent, { id }, { models }) => {
      return await models.Comment.findById(id);
    }
  },

  Mutation: {
    createComment: combineResolvers(
      // isAuthenticated,
      async (parent, { body, messageId }, { models, me }) => {
        console.log(parent);
        const comment = await models.Comment.create({
          body,
          messageId: messageId,
          userId: me.id
        });

        pubsub.publish(EVENTS.COMMENT.CREATED, {
          commentCreated: { comment }
        });

        return comment;
      }
    ),

    deleteComment: combineResolvers(
      isAuthenticated,
      isCommentOwner,
      async (parent, { id }, { models }) => {
        return await models.Comment.destroy({ where: { id } });
      }
    )
  },

  Comment: {
    user: async (comment, args, { models }) => {
      return await models.User.findById(comment.userId);
    },
    message: async (comment, args, { models }) => {
      return await models.Message.findById(comment.messageId);
    }
  },

  Subscription: {
    commentCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.COMMENT.CREATED)
    }
  }
};

module.exports = commentResolver;
