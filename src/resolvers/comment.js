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
        order: [["createdAt", "ASC"]],
        limit: limit + 1,
        ...cursorOptions
      });

      const hasNextPage = comments.length > limit;
      const total = comments.length;
      const edges = hasNextPage ? comments.slice(0, -1) : comments;

      return {
        edges,
        pageInfo: {
          total,
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
        const comment = await models.Comment.create({
          body,
          messageId: messageId,
          userId: me.id
        });

        // Increment message comment count
        const message = await models.Message.findById(messageId);
        if (!message) {
          return false;
        } else {
          await message.increment("commentCount");
        }
        pubsub.publish(EVENTS.MESSAGE.UPDATED, {
          messageUpdated: { message }
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
        const comment = await models.Comment.findById(id);
        if (comment) {
          const messageId = comment.messageId;
          const message = await models.Message.findById(messageId);
          if (!message) {
            return false;
          } else {
            await models.Comment.destroy({ where: { id } });
            await message.decrement("commentCount");
          }
          pubsub.publish(EVENTS.MESSAGE.UPDATED, {
            messageUpdated: { message }
          });
          pubsub.publish(EVENTS.COMMENT.DELETED, {
            commentDeleted: { comment }
          });

          return comment;
        } else {
          return null;
        }
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
    },
    commentDeleted: {
      subscribe: () => pubsub.asyncIterator(EVENTS.COMMENT.DELETED)
    },
    messageUpdated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.UPDATED)
    }
  }
};

module.exports = commentResolver;
