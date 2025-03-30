const { DataTypes } = require("sequelize");
const { sequelize } = require("../DataBase/seqDB");

const BookTransaction = sequelize.define(
  "BookTransaction",
  {
    studentId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Students",
        key: "id",
      },
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Books",
        key: "id",
      },
    },
    issueDate: {
      type: DataTypes.DATE,
      defaultValue: DataTypes.NOW,
    },
    dueDate: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    returnDate: {
      type: DataTypes.DATE,
    },
    isReturned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lateFee: {
      type: DataTypes.FLOAT,
      defaultValue: 0,
    },
  },
  {
    timestamps: false,
  }
);

module.exports = BookTransaction;
