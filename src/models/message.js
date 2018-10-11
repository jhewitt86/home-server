const message = (sequelize, DataTypes) => {
  const Message = sequelize.define("message", {
    title: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: "A message has to have a title."
        }
      }
    },
    body: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: "A message has to have a body."
        }
      }
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    },
    public: {
      type: DataTypes.BOOLEAN
    }
  });

  Message.associate = models => {
    Message.belongsTo(models.User);
  };

  return Message;
};

module.exports = message;
