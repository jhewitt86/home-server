const uuid = require("uuid");

const messageResolver = {
  Query: {
    messages: (parent, args, { models }) => {
      return Object.values(models.messages);
    },
    message: (parent, { id }, { models }) => {
      return models.messages[id];
    }
  },

  Mutation: {
    createMessage: (parent, { text }, { me, models }) => {
      const id = uuid.v4();
      const message = {
        id,
        text,
        userId: me.id,
        created: new Date().getTime(),
        updated: new Date().getTime()
      };

      models.messages[id] = message;
      models.users[me.id].messageIds.push(id);

      return message;
    },

    deleteMessage: (parent, { id }, { models }) => {
      const { [id]: message, ...otherMessages } = models.messages;

      if (!message) {
        return false;
      }

      models.messages = otherMessages;

      return true;
    },

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
  },

  Message: {
    user: (message, args, { models }) => {
      return models.users[message.userId];
    }
  }
};

module.exports = messageResolver;
