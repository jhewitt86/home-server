let messages = {
  1: {
    id: "1",
    text: "Hello World",
    userId: "1",
    created: 1538799224281,
    updated: 1538799224281
  },
  2: {
    id: "2",
    text: "By World",
    userId: "2",
    created: 1538799206396,
    updated: 1538799206396
  }
};

let users = {
  1: {
    id: "1",
    username: "Robin Wieruch",
    firstname: "Robbie",
    lastname: "W",
    messageIds: [1]
  },
  2: {
    id: "2",
    username: "Dave Davids",
    firstname: "David",
    lastname: "D",
    messageIds: [2]
  }
};

module.exports = { messages, users };
