const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");

const { BookTransaction, Book, Student } = require("../Models/index.model");
const { sequelize } = require("../DataBase/seqDB");
// Constants

// Issue a book to a student

const issueBook = asyncHandler(async (req, res) => {
  const { studentId, bookId, dueDate } = req.body;

  if (!studentId || !bookId || !dueDate) {
    return res.status(400).json({ message: "All fields are required" });
  }

  const book = await Book.findByPk(bookId);
  if (!book) return res.status(404).json({ message: "Book not found" });

  // Check if the student already has this book and hasn't returned it
  const existingTransaction = await BookTransaction.findOne({
    where: { studentId, bookId, isReturned: false },
  });

  if (existingTransaction) {
    return res.status(400).json({
      message: `Book is already issued to student ID ${studentId}`,
      existingTransaction,
    });
  }

  // Check if there are available copies to issue
  if (book.noOfCopies <= 0) {
    return res
      .status(400)
      .json({ message: "No available copies of this book" });
  }

  // Issue the book
  const transaction = await BookTransaction.create({
    studentId,
    bookId,
    issueDate: new Date(),
    dueDate,
    isReturned: false,
    lateFee: 0,
    status: "issued",
  });

  // Decrease the available book copies
  await Book.decrement("noOfCopies", { where: { id: bookId } });

  res.status(201).json({
    success: true,
    message: "Book issued successfully",
    transaction,
    remainingCopies: book.noOfCopies - 1,
  });
});

// Return a book
const returnBook = asyncHandler(async (req, res) => {
  const { transactionId } = req.body;
  const GRACE_PERIOD_DAYS = 5; // 5-day grace period from the issue date
  const LATE_FEE_PER_DAY = 2; // ₹2 per day after grace period

  if (!transactionId) {
    return res.status(400).json({
      success: false,
      message: "Transaction ID is required",
    });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      const transaction = await BookTransaction.findByPk(transactionId, {
        transaction: t,
        lock: true,
      });

      if (!transaction) throw new Error("Transaction not found");
      if (transaction.isReturned) throw new Error("Book already returned");

      const returnDate = new Date();
      const issueDate = new Date(transaction.issueDate);
      const gracePeriodEnd = new Date(issueDate); // Clone issueDate
      gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD_DAYS);

      let lateFee = 0;
      let status = "returned";

      if (returnDate > gracePeriodEnd) {
        const lateDays = Math.ceil(
          (returnDate - gracePeriodEnd) / (1000 * 60 * 60 * 24)
        );
        lateFee = lateDays * LATE_FEE_PER_DAY;
        status = "overdue";
      }

      await transaction.update(
        {
          returnDate,
          status,
          lateFee,
          isReturned: true,
        },
        { transaction: t }
      );

      await Book.increment("noOfCopies", {
        where: { id: transaction.bookId },
        transaction: t,
      });

      return {
        transaction,
        gracePeriodDays: GRACE_PERIOD_DAYS,
        lateDays: returnDate > gracePeriodEnd ? lateDays : 0,
      };
    });

    res.status(200).json({
      success: true,
      message: "Book returned successfully",
      gracePeriodDays: GRACE_PERIOD_DAYS,
      lateDays: result.lateDays,
      lateFee: result.transaction.lateFee,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error("Return Book Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to return book",
    });
  }
});

// Get all books transactions for a specific student
const getStudentTransactions = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { showReturned } = req.query;

  try {
    // Base where clause - only non-returned by default
    const whereClause = {
      studentId,
      ...(!showReturned && { isReturned: false }), // Only apply if showReturned is false
    };

    const transactions = await BookTransaction.findAll({
      where: whereClause,
      include: [
        {
          model: Book,
          attributes: ["id", "title", "accessionNumber", "isbnNo"],
        },
      ],
      order: [["issueDate", "DESC"]],
    });

    // Get accurate counts
    const totalBooks = await BookTransaction.count({ where: { studentId } });
    const activeBooks = await BookTransaction.count({
      where: {
        studentId,
        isReturned: false,
      },
    });

    res.status(200).json({
      success: true,
      totalBooks,
      activeBooks,
      returnedBooks: totalBooks - activeBooks,
      showingReturned: !!showReturned,
      transactionsCount: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Error fetching student transactions:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student transactions",
    });
  }
});

// Get transaction details by ID
const getTransactionById = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;
  const transaction = await BookTransaction.findByPk(transactionId, {
    include: [
      {
        model: Student,
        attributes: ["id", "name", "email", "rollNo", "grade", "phone"],
      },
      {
        model: Book,
        attributes: ["id", "title", "accessionNumber", "isbnNo"],
      },
    ],
  });

  if (!transaction) {
    return res.status(404).json({ message: "Transaction not found" });
  }

  res.status(200).json({ success: true, transaction });
});

// Get all active transactions (books not returned)
const getActiveTransactions = asyncHandler(async (req, res) => {
  const { status } = req.query;

  // Build the where clause
  const whereClause = {
    status: status
      ? Array.isArray(status)
        ? { [Op.in]: status }
        : status
      : { [Op.in]: ["issued", "overdue"] },
    isReturned: false,
  };

  const transactions = await BookTransaction.findAll({
    where: whereClause,
    include: [
      {
        model: Student,
        attributes: ["id", "name", "email", "rollNo", "grade"],
      },
      {
        model: Book,
        attributes: ["id", "title", "accessionNumber", "isbnNo"],
      },
    ],
    order: [["dueDate", "ASC"]], // Sort by due date (earliest first)
  });

  res.status(200).json({
    success: true,
    count: transactions.length,
    transactions,
  });
});

const getOverdueTransactions = asyncHandler(async (req, res) => {
  const overdueTransactions = await BookTransaction.findAll({
    where: {
      status: "overdue",
      isReturned: false,
      dueDate: { [Op.lt]: new Date() }, // Ensure due date is in the past
    },
    include: [
      {
        model: Student,
        attributes: ["id", "name", "email", "rollNo", "grade", "phone"],
      },
      {
        model: Book,
        attributes: ["id", "title", "accessionNumber"],
      },
    ],
    order: [
      ["dueDate", "ASC"],
      ["studentId", "ASC"],
    ],
  });

  res.status(200).json({
    success: true,
    count: overdueTransactions.length,
    overdueTransactions,
  });
});

module.exports = {
  issueBook,
  returnBook,
  getActiveTransactions,
  getStudentTransactions,
  getTransactionById,
  getOverdueTransactions,
};
