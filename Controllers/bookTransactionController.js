const asyncHandler = require("express-async-handler");


const { BookTransaction, Book, Student } = require("../Models/index.model");

// Issue a book to a student
const issueBook = asyncHandler(async (req, res) => {
  const { studentId, bookId, dueDate } = req.body;

  // Check if student exists
  const student = await Student.findByPk(studentId); // Correct method is findByPk in Sequelize
  if (!student) {
    return res.status(404).json({ message: "Student not found" });
  }

  // Check if book exists
  const book = await Book.findByPk(bookId); // Correct method is findByPk in Sequelize
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  // Check if the book has available copies
  if (book.noOfCopies <= 0) {
    return res.status(400).json({ message: "No copies available for issue" });
  }

  // Check if book is already issued
  const existingTransaction = await BookTransaction.findOne({
    where: { bookId, isReturned: false }, // Correct Sequelize query
  });
  if (existingTransaction) {
    return res
      .status(400)
      .json({ message: "Book is already issued to another student" });
  }

  // Create a new book transaction
  const transaction = await BookTransaction.create({
    studentId, // Using studentId and bookId directly as per Sequelize model
    bookId,
    dueDate,
  });

  // Reduce the number of available copies
  book.noOfCopies -= 1;
  await book.save();

  res
    .status(201)
    .json({ success: true, message: "Book issued successfully", transaction });
});

// Return a book
const returnBook = asyncHandler(async (req, res) => {
  const { transactionId } = req.body;
  const transaction = await BookTransaction.findByPk(transactionId); 

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }
  if (transaction.isReturned) {
    return res.status(400).json({ message: "Book already returned" });
  }

  // Calculate late fee
  const returnDate = new Date();
  const dueDate = new Date(transaction.dueDate);
  const lateDays = Math.max(
    0,
    Math.ceil((returnDate - dueDate) / (1000 * 60 * 60 * 24))
  );

  const lateFeePerDay = 5; // You can change this fee
  const lateFee = lateDays * lateFeePerDay;

  // Update transaction details
  transaction.returnDate = returnDate;
  transaction.isReturned = true;
  transaction.lateFee = lateFee;
  await transaction.save();

  // Increase book copies since it's returned
  const book = await Book.findByPk(transaction.bookId); // Correct method is findByPk in Sequelize
  if (book) {
    book.noOfCopies += 1;
    await book.save();
  }

  res.status(200).json({
    success: true,
    message: "Book returned successfully",
    lateFee,
  });
});

// Get all active transactions (books not returned)
const getActiveTransactions = asyncHandler(async (req, res) => {
  const transactions = await BookTransaction.findAll({
    where: { isReturned: false },
    include: [
      {
        model: Student,
        attributes: ["name", "email", "rollNo", "grade"],
      },
      {
        model: Book,
        attributes: ["title", "accessionNumber", "isbnNo"],
      },
    ],
  });

  res.status(200).json({ success: true, transactions });
});

// Get all transactions for a specific student
const getStudentTransactions = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const transactions = await BookTransaction.findAll({
    where: { studentId },
    include: [
      {
        model: Book,
        attributes: ["title", "accessionNumber", "isbnNo"],
      },
    ],
    order: [["issueDate", "DESC"]],
  });

  res.status(200).json({ success: true,Total_Books:transactions.length, transactions });
});

// Get transaction details by ID
const getTransactionById = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const transaction = await BookTransaction.findByPk(transactionId, {
    include: [
      {
        model: Student,
        attributes: ["name", "email", "rollNo", "grade"],
      },
      {
        model: Book,
        attributes: ["title", "accessionNumber", "isbnNo"],
      },
    ],
  });

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  res.status(200).json({ success: true, transaction });
});

module.exports = {
  issueBook,
  returnBook,
  getActiveTransactions,
  getStudentTransactions,
  getTransactionById,
};
