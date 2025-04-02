// const asyncHandler = require("express-async-handler");
// const { Op } = require("sequelize");

// const { BookTransaction, Book, Student } = require("../Models/index.model");
// const { sequelize } = require("../DataBase/seqDB");

// // Issue a book to a student
// const issueBook = asyncHandler(async (req, res) => {
//   const { studentId, bookId, dueDate } = req.body;

//   if (!studentId || !bookId || !dueDate) {
//     return res.status(400).json({ message: "All fields are required" });
//   }

//   const book = await Book.findByPk(bookId);
//   if (!book) return res.status(404).json({ message: "Book not found" });

//   // Check if the student already has this book and hasn't returned it
//   const existingTransaction = await BookTransaction.findOne({
//     where: { studentId, bookId, isReturned: false },
//   });

//   if (existingTransaction) {
//     return res.status(400).json({
//       message: `Book is already issued to student ID ${studentId}`,
//       existingTransaction,
//     });
//   }

//   // Check if there are available copies to issue
//   if (book.noOfCopies <= 0) {
//     return res
//       .status(400)
//       .json({ message: "No available copies of this book" });
//   }

//   // Issue the book
//   const transaction = await BookTransaction.create({
//     studentId,
//     bookId,
//     issueDate: new Date(),
//     dueDate,
//     isReturned: false,
//     lateFee: 0,
//     status: "issued",
//   });

//   // Decrease the available book copies
//   await Book.decrement("noOfCopies", { where: { id: bookId } });

//   res.status(201).json({
//     success: true,
//     message: "Book issued successfully",
//     transaction,
//     remainingCopies: book.noOfCopies - 1,
//   });
// });

// // Return a book
// const returnBook = asyncHandler(async (req, res) => {
//   const { transactionId } = req.body;
//   const GRACE_PERIOD_DAYS = 5;
//   const LATE_FEE_PER_DAY = 2;

//   if (!transactionId) {
//     return res.status(400).json({
//       success: false,
//       message: "Transaction ID is required",
//     });
//   }

//   try {
//     const result = await sequelize.transaction(async (t) => {
//       const transaction = await BookTransaction.findByPk(transactionId, {
//         transaction: t,
//         lock: true,
//       });

//       if (!transaction) throw new Error("Transaction not found");
//       if (transaction.isReturned) throw new Error("Book already returned");

//       const returnDate = new Date();
//       const issueDate = new Date(transaction.issueDate);
//       const gracePeriodEnd = new Date(issueDate); // Clone issueDate
//       gracePeriodEnd.setDate(gracePeriodEnd.getDate() + GRACE_PERIOD_DAYS);

//       let lateFee = 0;
//       let status = "returned";

//       if (returnDate > gracePeriodEnd) {
//         const lateDays = Math.ceil(
//           (returnDate - gracePeriodEnd) / (1000 * 60 * 60 * 24)
//         );
//         lateFee = lateDays * LATE_FEE_PER_DAY;
//         status = "overdue";
//       }

//       await transaction.update(
//         {
//           returnDate,
//           status,
//           lateFee,
//           isReturned: true,
//         },
//         { transaction: t }
//       );

//       await Book.increment("noOfCopies", {
//         where: { id: transaction.bookId },
//         transaction: t,
//       });

//       return {
//         transaction,
//         gracePeriodDays: GRACE_PERIOD_DAYS,
//         lateDays: returnDate > gracePeriodEnd ? lateDays : 0,
//       };
//     });

//     res.status(200).json({
//       success: true,
//       message: "Book returned successfully",
//       gracePeriodDays: GRACE_PERIOD_DAYS,
//       lateDays: result.lateDays,
//       lateFee: result.transaction.lateFee,
//       transaction: result.transaction,
//     });
//   } catch (error) {
//     console.error("Return Book Error:", error);
//     res.status(400).json({
//       success: false,
//       message: error.message || "Failed to return book",
//     });
//   }
// });

// // Get all books transactions for a specific student
// const getStudentTransactions = asyncHandler(async (req, res) => {
//   const { studentId } = req.params;
//   const { showReturned } = req.query;

//   try {
//     // Base where clause - only non-returned by default
//     const whereClause = {
//       studentId,
//       ...(!showReturned && { isReturned: false }), // Only apply if showReturned is false
//     };

//     const transactions = await BookTransaction.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: Book,
//           attributes: ["id", "title", "accessionNumber", "isbnNo"],
//         },
//       ],
//       order: [["issueDate", "DESC"]],
//     });

//     // Get accurate counts
//     const totalBooks = await BookTransaction.count({ where: { studentId } });
//     const activeBooks = await BookTransaction.count({
//       where: {
//         studentId,
//         isReturned: false,
//       },
//     });

//     res.status(200).json({
//       success: true,
//       totalBooks,
//       activeBooks,
//       returnedBooks: totalBooks - activeBooks,
//       showingReturned: !!showReturned,
//       transactionsCount: transactions.length,
//       transactions,
//     });
//   } catch (error) {
//     console.error("Error fetching student transactions:", error);
//     res.status(500).json({
//       success: false,
//       message: "Failed to fetch student transactions",
//     });
//   }
// });
// // Get all active transactions (books not returned)
// const getActiveTransactions = asyncHandler(async (req, res) => {
//     const { status } = req.query;

//     // Build the where clause
//     const whereClause = {
//       status: status
//         ? Array.isArray(status)
//           ? { [Op.in]: status }
//           : status
//         : { [Op.in]: ["issued", "overdue"] },
//       isReturned: false,
//     };

//     const transactions = await BookTransaction.findAll({
//       where: whereClause,
//       include: [
//         {
//           model: Student,
//           attributes: ["id", "name", "email", "rollNo", "grade"],
//         },
//         {
//           model: Book,
//           attributes: ["id", "title", "accessionNumber", "isbnNo"],
//         },
//       ],
//       order: [["dueDate", "ASC"]], // Sort by due date (earliest first)
//     });

//     res.status(200).json({
//       success: true,
//       count: transactions.length,
//       transactions,
//     });
//   });

// // Get transaction details by ID
// const getTransactionById = asyncHandler(async (req, res) => {
//   const { transactionId } = req.params;
//   const transaction = await BookTransaction.findByPk(transactionId, {
//     include: [
//       {
//         model: Student,
//         attributes: ["id", "name", "email", "rollNo", "grade", "phone"],
//       },
//       {
//         model: Book,
//         attributes: ["id", "title", "accessionNumber", "isbnNo"],
//       },
//     ],
//   });

//   if (!transaction) {
//     return res.status(404).json({ message: "Transaction not found" });
//   }

//   res.status(200).json({ success: true, transaction });
// });

// const getOverdueTransactions = asyncHandler(async (req, res) => {
//   const overdueTransactions = await BookTransaction.findAll({
//     where: {
//       status: "overdue",
//       isReturned: false,
//       dueDate: { [Op.lt]: new Date() }, // Ensure due date is in the past
//     },
//     include: [
//       {
//         model: Student,
//         attributes: ["id", "name", "email", "rollNo", "grade", "phone"],
//       },
//       {
//         model: Book,
//         attributes: ["id", "title", "accessionNumber"],
//       },
//     ],
//     order: [
//       ["dueDate", "ASC"],
//       ["studentId", "ASC"],
//     ],
//   });

//   res.status(200).json({
//     success: true,
//     count: overdueTransactions.length,
//     overdueTransactions,
//   });
// });

// module.exports = {
//   issueBook,
//   returnBook,
//   getActiveTransactions,
//   getStudentTransactions,
//   getTransactionById,
//   getOverdueTransactions,
// };

const asyncHandler = require("express-async-handler");
const { Op } = require("sequelize");
const { BookTransaction, Book, Student } = require("../Models/index.model");
const { sequelize } = require("../DataBase/seqDB");

// Helper function to calculate late fee


// Issue a book to a student
const issueBook = asyncHandler(async (req, res) => {
  const { studentId, bookId, dueDate } = req.body;

  if (!studentId || !bookId || !dueDate) {
    return res.status(400).json({
      success: false,
      message: "Student ID, Book ID and Due Date are required",
    });
  }

  try {
    const result = await sequelize.transaction(async (t) => {
      const book = await Book.findByPk(bookId, { transaction: t });
      if (!book) throw new Error("Book not found");
      if (book.noOfCopies <= 0) throw new Error("No available copies");

      const student = await Student.findByPk(studentId, { transaction: t });
      if (!student) throw new Error("Student not found");

      // Check for existing active transaction
      const existingTransaction = await BookTransaction.findOne({
        where: { studentId, bookId, isReturned: false },
        transaction: t,
      });

      if (existingTransaction) {
        throw new Error(`Book is already issued to student ID ${studentId}`);
      }

      // Create transaction
      const transaction = await BookTransaction.create(
        {
          studentId,
          bookId,
          issueDate: new Date(),
          dueDate,
          isReturned: false,
          lateFee: 0,
          status: "issued",
        },
        { transaction: t }
      );

      // Update book copies
      await Book.decrement("noOfCopies", {
        where: { id: bookId },
        transaction: t,
      });

      return {
        transaction,
        remainingCopies: book.noOfCopies - 1,
        studentName: student.name,
        bookTitle: book.title,
      };
    });

    res.status(201).json({
      success: true,
      message: "Book issued successfully",
      transaction: result.transaction,
      remainingCopies: result.remainingCopies,
    //   studentName: result.studentName,
    //   bookTitle: result.bookTitle,
    });
  } catch (error) {
    console.error("Issue Book Error:", error);
    res.status(400).json({
      success: false,
      message: error.message || "Failed to issue book",
    });
  }
});


// Function to calculate late fee (after 15 minutes)
const calculateLateFee = (dueDate, returnDate) => {
    const lateFeePerMinute = 1; // Example fee: $1 per minute
    
    // Convert dates to UTC to avoid timezone issues
    const due = new Date(dueDate);
    const returned = new Date(returnDate);
  
    // Calculate the difference in milliseconds
    const differenceInTime = returned - due;
  
    // Convert milliseconds to minutes
    const lateMinutes = Math.max(Math.ceil(differenceInTime / (1000 * 60)) - 15, 0); // Start counting after 15 minutes
  
    const lateFee = lateMinutes > 0 ? lateMinutes * lateFeePerMinute : 0;
  
    return { lateMinutes, lateFee };
  };
// Return a book
const returnBook = asyncHandler(async (req, res) => {
    const { transactionId } = req.body;
  
    if (!transactionId) {
      return res.status(400).json({
        success: false,
        message: "Transaction ID is required",
      });
    }
  
    try {
      const result = await sequelize.transaction(async (t) => {
        // Fetch transaction with a lock, without includes
        const transaction = await BookTransaction.findByPk(transactionId, {
          transaction: t,
          lock: t.LOCK.UPDATE, // Explicitly use row-level lock
        });
  
        if (!transaction) throw new Error("Transaction not found");
        if (transaction.isReturned) throw new Error("Book already returned");
  
        const returnDate = new Date();
        const { lateFee, lateDays } = calculateLateFee(
          new Date(transaction.dueDate),
          returnDate
        );
  
        const status = lateFee > 0 ? "overdue" : "returned";
  
        // Update transaction details
        await transaction.update(
          {
            returnDate,
            status,
            lateFee,
            isReturned: true,
          },
          { transaction: t }
        );
  
        // Increase book copies
        await Book.increment("noOfCopies", {
          where: { id: transaction.bookId },
          transaction: t,
        });
  
        // Fetch related data separately (without locking)
        const book = await Book.findByPk(transaction.bookId, {
          attributes: ["title"],
        });
  
        const student = await Student.findByPk(transaction.studentId, {
          attributes: ["name"],
        });
  
        return {
          transaction,
          lateDays,
          lateFee,
          bookTitle: book?.title || "Unknown",
          studentName: student?.name || "Unknown",
        };
      });
  
      res.status(200).json({
        success: true,
        message: "Book returned successfully",
        lateDays: result.lateDays,
        lateFee: result.lateFee,
        transaction: result.transaction,
        // bookTitle: result.bookTitle,
        // studentName: result.studentName,
      });
    } catch (error) {
      console.error("Return Book Error:", error);
      res.status(400).json({
        success: false,
        message: error.message || "Failed to return book",
      });
    }
  });
  

// Get all transactions (with filters)
const getAllTransactions = asyncHandler(async (req, res) => {
  const { status, studentId, bookId, showReturned } = req.query;

  const whereClause = {};

  // Apply filters
  if (status) {
    whereClause.status = Array.isArray(status) ? { [Op.in]: status } : status;
  }
  if (studentId) whereClause.studentId = studentId;
  if (bookId) whereClause.bookId = bookId;
  if (showReturned === "false") whereClause.isReturned = false;

  try {
    const { count, rows: transactions } = await BookTransaction.findAndCountAll(
      {
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
        order: [["createdAt", "DESC"]],
      }
    );

    res.status(200).json({
      success: true,
   
      count: transactions.length,

      transactions,
    });
  } catch (error) {
    console.error("Get All Transactions Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transactions",
    });
  }
});

// Get active transactions (issued/overdue)
const getActiveTransactions = asyncHandler(async (req, res) => {
  const { status } = req.query;

  const whereClause = {
    isReturned: false,
    status: status
      ? Array.isArray(status)
        ? { [Op.in]: status }
        : status
      : { [Op.in]: ["issued", "overdue"] },
  };

  try {
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
      order: [["dueDate", "ASC"]],
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get Active Transactions Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch active transactions",
    });
  }
});

// Get overdue transactions
const getOverdueTransactions = asyncHandler(async (req, res) => {
  try {
    const transactions = await BookTransaction.findAll({
      where: {
        status: "overdue",
        isReturned: false,
        dueDate: { [Op.lt]: new Date() },
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
      order: [["dueDate", "ASC"]],
    });

    res.status(200).json({
      success: true,
      count: transactions.length,
      transactions,
    });
  } catch (error) {
    console.error("Get Overdue Transactions Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch overdue transactions",
    });
  }
});

// Get student transactions
const getStudentTransactions = asyncHandler(async (req, res) => {
  const { studentId } = req.params;
  const { showReturned, status } = req.query;

  try {
    const whereClause = { studentId };
    if (showReturned === "false") whereClause.isReturned = false;
    if (status) {
      whereClause.status = Array.isArray(status) ? { [Op.in]: status } : status;
    }

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

    // Get counts
    const counts = await BookTransaction.findAll({
      attributes: [
        "status",
        [sequelize.fn("COUNT", sequelize.col("id")), "count"],
      ],
      where: { studentId },
      group: ["status"],
      raw: true,
    });

    res.status(200).json({
      success: true,
      counts,
      transactions,
    });
  } catch (error) {
    console.error("Get Student Transactions Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch student transactions",
    });
  }
});

// Get transaction by ID
const getTransactionById = asyncHandler(async (req, res) => {
  const { transactionId } = req.params;

  try {
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
      return res.status(404).json({
        success: false,
        message: "Transaction not found",
      });
    }

    res.status(200).json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("Get Transaction Error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch transaction",
    });
  }
});

module.exports = {
  issueBook,
  returnBook,
  getAllTransactions,
  getActiveTransactions,
  getOverdueTransactions,
  getStudentTransactions,
  getTransactionById,
};
