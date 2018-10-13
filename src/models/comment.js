const comment = (sequelize, DataTypes) => {
  const Comment = sequelize.define("comment", {
    body: {
      type: DataTypes.STRING,
      validate: {
        notEmpty: {
          args: true,
          msg: "A comment has to have content."
        }
      }
    },
    createdAt: {
      type: DataTypes.DATE
    },
    updatedAt: {
      type: DataTypes.DATE
    }
  });

  Comment.associate = models => {
    Comment.belongsTo(models.Message);
    Comment.belongsTo(models.User);
  };

  return Comment;
};

module.exports = comment;
