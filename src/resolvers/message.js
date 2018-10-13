const uuid = require("uuid");
const { combineResolvers } = require("graphql-resolvers");
const { isAuthenticated, isMessageOwner } = require("./authorisation");
const Sequelize = require("sequelize");
const { pubsub, EVENTS } = require("../subscription");

const toCursorHash = string => Buffer.from(string).toString("base64");
const fromCursorHash = string =>
  Buffer.from(string, "base64").toString("ascii");

const messageResolver = {
  Query: {
    messages: async (parent, { cursor, limit = 100 }, { models }) => {
      const cursorOptions = cursor
        ? {
            where: {
              createdAt: {
                [Sequelize.Op.lt]: fromCursorHash(cursor)
              }
            }
          }
        : {};
      const messages = await models.Message.findAll({
        order: [["createdAt", "DESC"]],
        limit: limit + 1,
        ...cursorOptions
      });

      const hasNextPage = messages.length > limit;
      const total = messages.length;
      const edges = hasNextPage ? messages.slice(0, -1) : messages;

      return {
        edges,
        pageInfo: {
          hasNextPage,
          total,
          endCursor: toCursorHash(edges[edges.length - 1].createdAt.toString())
        }
      };
    },
    message: async (parent, { id }, { models }) => {
      return await models.Message.findById(id);
    }
  },

  Mutation: {
    createMessage: combineResolvers(
      // isAuthenticated,
      async (parent, { title, body, public }, { models, me }) => {
        const message = await models.Message.create({
          title,
          body,
          userId: me.id,
          public,
          commentCount: 0
        });

        pubsub.publish(EVENTS.MESSAGE.CREATED, {
          messageCreated: { message }
        });

        return message;
      }
    ),

    incrementComments: combineResolvers(
      async (parent, { id }, { models, me }) => {
        const message = await models.Message.findById(id);
        if (!message) {
          return false;
        } else {
          await message.increment("commentCount");
          return message;
        }
      }
    ),

    decrementComments: combineResolvers(
      async (parent, { id }, { models, me }) => {
        const message = await models.Message.findById(id);
        if (!message) {
          return false;
        } else {
          if (message.commentCount <= 0) {
            return message;
          } else {
            await message.decrement("commentCount");
            return message;
          }
        }
      }
    ),

    deleteMessage: combineResolvers(
      isAuthenticated,
      isMessageOwner,
      async (parent, { id }, { models }) => {
        return await models.Message.destroy({ where: { id } });
      }
    )
    /*
    updateMessage: (parent, { id, text }, { models }) => {
      const { [id]: message, ...otherMessages } = models.messages;

      if (!message) {
        return false;
      } else {
        message.text = text;
        message.updated = new Date().getTime();
      }

      models.messages[id] = message;

      return message;
    }
    */
  },

  Message: {
    user: async (message, args, { models }) => {
      return await models.User.findById(message.userId);
    },
    comments: async (message, args, { models }) => {
      return await models.Comment.findAll({
        where: {
          messageId: message.id
        }
      });
    }
  },
  Subscription: {
    messageCreated: {
      subscribe: () => pubsub.asyncIterator(EVENTS.MESSAGE.CREATED)
    }
  }
};

module.exports = messageResolver;
