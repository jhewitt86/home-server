const uuid = require("uuid");

const messageResolver = {
  Query: {
    messages: async (parent, args, { models }) => {
      return await models.Message.findAll();
    },
    message: async (parent, { id }, { models }) => {
      return await models.Message.findById(id);
    }
  },

  Mutation: {
    createMessage: async (parent, { text }, { me, models }) => {
      try {
        return await models.Message.create({
          text,
          userId: me.id
        });
      } catch (e) {
        throw new Error(e);
      }
    },

    deleteMessage: async (parent, { id }, { models }) => {
      return await models.Message.destroy({ where: { id } });
    }
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
    }
  }
};

module.exports = messageResolver;
