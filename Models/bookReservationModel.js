const { DataTypes } = require("sequelize");
const { sequelize } = require("../DataBase/seqDB");

const Reservation = sequelize.define("Reservation", {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
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
  reserved_at: {
    type: DataTypes.STRING,
    allowNull: false,
  },
});

module.exports = Reservation;
