const { PubSub } = require("apollo-server");

const MESSAGE_EVENTS = require("./message");
const COMMENT_EVENTS = require("./comment");

const EVENTS = {
  MESSAGE: MESSAGE_EVENTS,
  COMMENT: COMMENT_EVENTS
};

module.exports = { pubsub: new PubSub(), EVENTS };
