const userResolvers = require("./user");
const messageResolvers = require("./message");
const commentResolvers = require("./comment");

module.exports = [userResolvers, messageResolvers, commentResolvers];
