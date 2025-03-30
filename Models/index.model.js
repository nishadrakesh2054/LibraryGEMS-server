const sequelize = require("../DataBase/seqDB");
const Student = require("./Students");
const Book = require("./bookModel");
const BookTransaction = require("./bookTransactionModel");

// Set up associations
Student.hasMany(BookTransaction, { foreignKey: "studentId" });
BookTransaction.belongsTo(Student, { foreignKey: "studentId" });

Book.hasMany(BookTransaction, { foreignKey: "bookId" });
BookTransaction.belongsTo(Book, { foreignKey: "bookId" });

module.exports = {
  sequelize,
  Student,
  Book,
  BookTransaction,
};