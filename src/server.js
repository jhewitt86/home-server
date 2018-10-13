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

const eraseDatabaseOnSync = false;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    createUsersWithMessages(new Date());
  }
  httpServer.listen({ port: 8000 }, () => {
    console.log("Apollo Server on http://localhost:8000/graphql");
  });
});

const createUsersWithMessages = async date => {
  await models.User.create(
    {
      username: "jthewz",
      email: "talk@mytryx.com",
      password: "Jeremy2004",
      role: "ADMIN",
      avatar: "https://randomuser.me/api/portraits/men/11.jpg",
      messages: [
        {
          title: "I'm quitting drinking today",
          body:
            "I've been drinking for 22 years, and in that time I've lost...",
          public: true
        }
      ]
    },
    {
      include: [models.Message, models.Comment]
    }
  );
  await models.Comment.create({
    body: "Testing 123",
    messageId: 1,
    userId: 1
  });
  await models.Comment.create({
    body: "Testing 45678",
    messageId: 1,
    userId: 1
  });
};
