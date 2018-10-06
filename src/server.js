require("dotenv").config();

const cors = require("cors");
const express = require("express");
const { ApolloServer } = require("apollo-server-express");
const uuid = require("uuid");

const schema = require("./schema");
const resolvers = require("./resolvers");
const { models, sequelize } = require("./models");

const app = express();
app.use(cors());

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
  context: async () => ({
    models,
    me: await models.User.findByLogin("rwieruch")
  })
});

server.applyMiddleware({ app, path: "/graphql" });

const eraseDatabaseOnSync = true;

sequelize.sync({ force: eraseDatabaseOnSync }).then(async () => {
  if (eraseDatabaseOnSync) {
    createUsersWithMessages();
  }
  app.listen({ port: 8000 }, () => {
    console.log("Apollo Server on http://localhost:8000/graphql");
  });
});

const createUsersWithMessages = async () => {
  await models.User.create(
    {
      username: "rwieruch",
      messages: [
        {
          text: "Published the Road to learn React"
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
      messages: [
        {
          text: "Happy to release ..."
        },
        {
          text: "Published a complete ..."
        }
      ]
    },
    {
      include: [models.Message]
    }
  );
};
