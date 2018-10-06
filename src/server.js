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
  const token = req.headers["x-token"];

  if (token) {
    try {
      return await jwt.verify(token, process.env.SECRET);
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
  await models.User.create(
    {
      username: "rwieruch",
      email: "hello@robin.com",
      password: "rwieruch",
      role: "ADMIN",
      messages: [
        {
          text: "Published the Road to learn React",
          createdAt: date.setSeconds(date.getSeconds() + 1)
        }
      ]
    },
    {
      include: [models.Message]
    }
  );

  await models.User.create(
    {
      username: "ddavids",
      email: "hello@david.com",
      password: "ddavids",
      messages: [
        {
          text: "Happy to release ...",
          createdAt: date.setSeconds(date.getSeconds() + 1)
        },
        {
          text: "Published a complete ...",
          createdAt: date.setSeconds(date.getSeconds() + 1)
        }
      ]
    },
    {
      include: [models.Message]
    }
  );
};
