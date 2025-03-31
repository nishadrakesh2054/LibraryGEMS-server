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
      onDelete: "RESTRICT",
    },
    bookId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: "Testbooks",
        key: "id",
      },
      onDelete: "RESTRICT",
    },
    issueDate: {
      type: DataTypes.DATEONLY,
      defaultValue: DataTypes.NOW,
      validate: {
        isDate: true,
      },
    },
    dueDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      validate: {
        isDate: true,
      },
    },
    returnDate: {
      type: DataTypes.DATEONLY,
      validate: {
        isDate: true,
        isAfterIssueDate(value) {
          if (
            value &&
            this.issueDate &&
            new Date(value) < new Date(this.issueDate)
          ) {
            throw new Error("Return date cannot be before issue date");
          }
        },
      },
    },
    isReturned: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    lateFee: {
      type: DataTypes.DECIMAL(10, 2),
      defaultValue: 0.0,
      validate: {
        min: 0,
      },
    },
    status: {
      type: DataTypes.ENUM("issued", "returned", "overdue", "lost"),
      defaultValue: "issued",
    },
  },
  {
    timestamps: true,
    paranoid: true, // Enable soft deletion
    indexes: [
      {
        fields: ["studentId"],
      },
      {
        fields: ["bookId"],
      },
      {
        fields: ["isReturned"],
      },
      {
        fields: ["status"],
      },
    ],
  }
);

module.exports = BookTransaction;
