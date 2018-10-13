require("dotenv").config();

const jwt = require("jsonwebtoken");
const cors = require("cors");
const express = require("express");
const http = require("http");
const { ApolloServer, AuthenticationError } = require("apollo-server-express");
const uuid = require("uuid");

const schema = require("./schema");
const resolvers = require("./resolvers");
const { models, sequelize } = require("./models");

const app = express();
app.use(cors());

const getMe = async req => {
  const token = req.headers.authorization;
  if (token) {
    try {
      return await jwt.verify(token, process.env.AUTH_SECRET);
    } catch (e) {
      console.log(e);
      throw new AuthenticationError("Your session expired. Sign in again.");
    }
  }
};

const server = new ApolloServer({
  typeDefs: schema,
  resolvers,
  formatError: error => {
    // remove the internal sequelize error message
    // leave only the important validation error
    const message = error.message
      .replace("SequelizeValidationError: ", "")
      .replace("Validation error: ", "");
    return {
      message
    };
  },
  context: async ({ req, connection }) => {
    if (connection) {
      return {
        models
      };
    }

    if (req) {
      const me = await getMe(req);
      return {
        models,
        me,
        secret: process.env.AUTH_SECRET
      };
    }
  }
});

server.applyMiddleware({ app, path: "/graphql" });

const httpServer = http.createServer(app);
server.installSubscriptionHandlers(httpServer);

const eraseDatabaseOnSync = true;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    createUsersWithMessages(new Date());
  }
  httpServer.listen({ port: 8000 }, () => {
    console.log("Apollo Server on http://localhost:8000/graphql");
  });
});

const createUsersWithMessages = async date => {
  await models.User.create({
    username: "schnapps",
    email: "talk@mytryx.com",
    password: "Jeremy2004",
    role: "ADMIN",
    avatar: "https://randomuser.me/api/portraits/men/11.jpg"
  });
  await models.User.create({
    username: "sparrow",
    email: "talk1@mytryx.com",
    password: "Jeremy2004",
    role: "ADMIN",
    avatar: "https://randomuser.me/api/portraits/men/12.jpg"
  });
  await models.User.create({
    username: "missfire",
    email: "talk2@mytryx.com",
    password: "Jeremy2004",
    role: "ADMIN",
    avatar: "https://randomuser.me/api/portraits/women/11.jpg"
  });
  await models.User.create({
    username: "prototype",
    email: "talk3@mytryx.com",
    password: "Jeremy2004",
    role: "ADMIN",
    avatar: "https://randomuser.me/api/portraits/women/12.jpg"
  });
  await models.User.create({
    username: "jenn_80",
    email: "talk4@mytryx.com",
    password: "Jeremy2004",
    role: "ADMIN",
    avatar: "https://randomuser.me/api/portraits/women/13.jpg"
  });

  // Sample message 1
  await models.Message.create({
    userId: 1,
    title: "I'm quitting drinking today",
    body:
      "I've been drinking for 22 years, and in that time I've lost a lot. I've lost my dream job, I've lost my best friend, and I'm losing my kids. They're old enough now to know about my addiction, and while I know their love isn't conditional, neither of them deserve the negative force of an alcoholic parent in their life. This morning I emptied out two bottles of scotch, and I've been drinking tea. I'm scare about this, but the only thing that scares me more is losing my two precious children.",
    public: true,
    commentCount: 4
  });
  await models.Comment.create({
    body:
      "That is fantastic, congratulations. The more important the reason, the stronger your will will be.",
    messageId: 1,
    userId: 2
  });
  await models.Comment.create({
    body: "Congratulations! 👏👏",
    messageId: 1,
    userId: 3
  });
  await models.Comment.create({
    body:
      "Good luck, if you'd like to hear a few tips on how I knocked over the bottle just reach out. 👊",
    messageId: 1,
    userId: 4
  });
  await models.Comment.create({
    body:
      "Amazing news, set goals, remind yourself each time you slip why you're doing this. 💙💙💙",
    messageId: 1,
    userId: 5
  });

  // Sample message 2
  await models.Message.create({
    userId: 2,
    title: "Walk the dogs with me today (Hurlstone Park)? 🐕 🐩",
    body:
      "The weather looks nice, who'd like to join me for a walk with the puppies?",
    public: true,
    commentCount: 3
  });
  await models.Comment.create({
    body: "OMG I wish I could, but housework has waited long enough. Enjoy!",
    messageId: 2,
    userId: 1
  });
  await models.Comment.create({
    body: "Hey I'm around, what time? I'll bring my puppies too!",
    messageId: 2,
    userId: 4
  });
  await models.Comment.create({
    body: "Awesome! 4PM!",
    messageId: 2,
    userId: 2
  });

  // Sample message 3
  await models.Message.create({
    userId: 3,
    title: "Tips for dealing with loss",
    body:
      "There's nothing harder than losing a loved one, so I thought I'd share a few tips for dealing with loss. Nothing can prepare you for what you're going through, but there are ways to cope.",
    public: true,
    commentCount: 4
  });
  await models.Comment.create({
    body: "Thank you",
    messageId: 3,
    userId: 5
  });
  await models.Comment.create({
    body: "Thank you",
    messageId: 3,
    userId: 4
  });
  await models.Comment.create({
    body: "Thanks for sharing.",
    messageId: 3,
    userId: 1
  });
  await models.Comment.create({
    body: "Thanks :)",
    messageId: 3,
    userId: 2
  });
};
