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

      console.log(me);

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
      include: [models.Message]
    }
  );
  await models.User.create(
    {
      username: "jthewz21",
      email: "tal13k@mytryx.com",
      password: "Jeremy2004",
      role: "ADMIN",
      avatar: "https://randomuser.me/api/portraits/men/18.jpg",
      messages: [
        {
          title: "My partner left me - pls cheer me up",
          body:
            "We have 3 children, we've been married 10 years, and last night he just walked out...",
          public: false
        }
      ]
    },
    {
      include: [models.Message]
    }
  );
  await models.User.create(
    {
      username: "msingh123",
      email: "talk1221@mytryx.com",
      password: "Jeremy2004",
      role: "ADMIN",
      avatar: "https://randomuser.me/api/portraits/women/10.jpg",
      messages: [
        {
          title: "Who wants to come see Jurassic World?",
          body: "Calling out all dinosaur nerds...",
          public: false
        },
        {
          title: "Dealing with loss",
          body: "Some tips for dealing with the loss of a loved one...",
          public: true
        }
      ]
    },
    {
      include: [models.Message]
    }
  );

  await models.User.create(
    {
      username: "msingh",
      email: "talk1@mytryx.com",
      password: "Jeremy2004",
      role: "ADMIN",
      avatar: "https://randomuser.me/api/portraits/women/11.jpg",
      messages: [
        {
          title: "Any lawyers here?",
          body: "I don't like asking for favours, but this is serious...",
          public: true
        },
        {
          title: "After hours doctors clinics in Melbourne?",
          body: "What's out there?...",
          public: true
        }
      ]
    },
    {
      include: [models.Message]
    }
  );
  await models.User.create(
    {
      username: "msingh2",
      email: "talk4@mytryx.com",
      password: "Jeremy2004",
      role: "ADMIN",
      avatar: "https://randomuser.me/api/portraits/women/13.jpg",
      messages: [
        {
          title: "I got a new job",
          body: "It took ages, but I'm finally working again...",
          public: true
        },
        {
          title: "Ideas for Xmas holidays?",
          body:
            "I'll have the kids this year, how can I keep them entertained?...",
          public: true
        },
        {
          title: "Just moved to Sydney, where's everyone at?",
          body: "Help me get settled :)",
          public: true
        },
        {
          title: "Dog parks in Maidstone?",
          body: "Anyone know any good places?",
          public: true
        }
      ]
    },
    {
      include: [models.Message]
    }
  );
  await models.User.create(
    {
      username: "bjones",
      email: "talk2@mytryx.com",
      password: "Jeremy2004",
      role: "ADMIN",
      avatar: "https://randomuser.me/api/portraits/men/23.jpg",
      messages: [
        {
          title: "I finally left Tom",
          body: "I'm worried he'll find me...",
          public: false
        },
        {
          title: "100 days since I last took a punt",
          body: "It's been a struggle, but today I'm celebrating...",
          public: true
        }
      ]
    },
    {
      include: [models.Message]
    }
  );
};
