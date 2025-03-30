// const Book = require("../Models/bookModel");
// const Joi = require("joi");

// const bookValidationSchema = Joi.object({
//   date: Joi.date().required(),
//   accessionNumber: Joi.number().required(),
//   isbnNo: Joi.string().trim().required(),
//   sourceOfAcquisition: Joi.string().trim().required(),
//   language: Joi.string().trim().required(),
//   bookNumber: Joi.number().min(1).required(),
//   classNumber: Joi.number().min(1).required(),
//   personalAuthor: Joi.string().trim().allow(""),
//   placeOfPublication: Joi.string().trim().allow(""),
//   corporateAuthor: Joi.string().trim().allow(""),
//   conferenceAuthor: Joi.string().trim().allow(""),
//   statementOfResponsibility:  Joi.string().trim().allow(""),
//   title: Joi.string().trim().required(),
//   subtitle: Joi.array().items(Joi.string().trim()).min(1).required(),
//   editionStatement: Joi.string().trim().allow(""),
//   publisherName: Joi.string().trim().required(),
//   dateOfPublication: Joi.date().required(),
//   physicalDescription: Joi.string().trim().allow(""),
//   seriesTitle: Joi.string().trim().allow(""),
//   seriesNo: Joi.number().min(1).allow(""),
//   notes: Joi.string().trim().allow(""),
//   subjectAddedEntry: Joi.string().trim().allow(""),
//   addedEntryPersonalName: Joi.string().trim().allow(""),
//   source: Joi.string().trim().required(),
//   noOfCopies: Joi.number().min(1).required(),
//   price: Joi.number().min(0).required(),
//   callNo: Joi.string().trim().required(),
//   barCodes: Joi.array().items(Joi.string().trim()).min(1).required(),
//   availabilities: Joi.array()
//   .items(Joi.string().required()) // Only validating status as a string
//   .default([])
//   .allow(null)

// });
// const sendResponse = (res, status, message, data = null) => {
//   res.status(status).json({
//     status,
//     message,
//     data,
//   });
// };

// // Validation Handler
// const validateBook = (bookData) => {
//   const { error } = bookValidationSchema.validate(bookData);
//   if (error) {
//     throw new Error(error.details[0].message);
//   }
// };

// // create books
// const createBook = async (req, res) => {
//   try {
//     validateBook(req.body);

//     let { noOfCopies, barCodes, ...bookData } = req.body;

//     // Check if noOfCopies is provided
//     if (!noOfCopies) {
//       return sendResponse(
//         res,
//         400,
//         "noOfCopies is required and cannot be null."
//       );
//     }

//     // Ensure barCodes is an array
//     if (!Array.isArray(barCodes)) {
//       return sendResponse(res, 400, "barCodes should be an array.");
//     }

//     // Validate number of copies and barcode length
//     if (barCodes.length > noOfCopies) {
//       return sendResponse(
//         res,
//         400,
//         "Number of barcodes cannot exceed number of copies."
//       );
//     }

//     // If only one barcode is provided, generate missing barcodes
//     if (barCodes.length === 1 && noOfCopies > 1) {
//       let baseBarcode = parseInt(barCodes[0]);
//       for (let i = 1; i < noOfCopies; i++) {
//         barCodes.push((baseBarcode + i).toString().padStart(8, "0"));
//       }
//     }

//     // If barCodes length doesn't match noOfCopies, return error
//     if (barCodes.length !== noOfCopies) {
//       return sendResponse(res, 400, "Mismatch between copies and barcodes.");
//     }

//     // Assign the updated barCodes and noOfCopies to bookData
//     bookData.barCodes = barCodes;
//     bookData.noOfCopies = noOfCopies;

//     // Create book entry in the database
//     const newBook = await Book.create(bookData);
//     sendResponse(res, 201, "Book created successfully", newBook);
//   } catch (error) {
//     console.error(error);
//     sendResponse(res, 400, error.message);
//   }
// };

// // **Get All Books**
// const getAllBooks = async (req, res) => {
//   try {
//     const books = await Book.findAll();

//     // Format barCodes as comma-separated strings
//     const formattedBooks = books.map((book) => ({
//       ...book.toJSON(),
//       barCodes: book.barCodes.join(", "),
//     }));

//     sendResponse(res, 200, "Books retrieved successfully", {
//       Total_Books: books.length,
//       books: formattedBooks,
//     });
//   } catch (error) {
//     sendResponse(res, 500, "Error fetching books");
//   }
// };

// // **Get Book by ID**
// const getBookById = async (req, res) => {
//   try {
//     const book = await Book.findByPk(req.params.id);
//     if (!book) return sendResponse(res, 404, "Book not found");

//     sendResponse(res, 200, "Book retrieved successfully", book);
//   } catch (error) {
//     sendResponse(res, 500, "Error fetching book");
//   }
// };

// // **Update Book**
// const updateBook = async (req, res) => {
//   try {
//     const { id, ...bookData } = req.body;

//     // Validate the updated data
//     validateBook(bookData);

//     let { noOfCopies, barCodes } = bookData;

//     // Ensure barCodes is an array
//     if (!Array.isArray(barCodes)) {
//       return sendResponse(res, 400, "barCodes should be an array.");
//     }

//     // If only one barcode is provided and noOfCopies is greater than 1, generate missing barcodes
//     if (barCodes.length === 1 && noOfCopies > 1) {
//       let baseBarcode = parseInt(barCodes[0]);
//       let generatedBarcodes = [barCodes[0]];

//       for (let i = 1; i < noOfCopies; i++) {
//         generatedBarcodes.push((baseBarcode + i).toString().padStart(8, "0"));
//       }
//       barCodes = generatedBarcodes;
//     }

//     // Check if the number of barcodes matches the number of copies
//     if (barCodes.length !== noOfCopies) {
//       return sendResponse(res, 400, "Mismatch between copies and barcodes.");
//     }

//     // Assign the updated barCodes and noOfCopies to bookData
//     bookData.barCodes = barCodes;
//     bookData.noOfCopies = noOfCopies;

//     // Update book in the database
//     const [updated] = await Book.update(bookData, {
//       where: { id: req.params.id },
//     });

//     if (!updated) {
//       return sendResponse(res, 404, "Book not found");
//     }

//     // Fetch the updated book to return in the response
//     const updatedBook = await Book.findByPk(req.params.id);
//     sendResponse(res, 200, "Book updated successfully", updatedBook);
//   } catch (error) {
//     console.error(error);
//     sendResponse(res, 400, error.message);
//   }
// };
// // **Delete Book**
// const deleteBook = async (req, res) => {
//   try {
//     const deleted = await Book.destroy({ where: { id: req.params.id } });
//     if (!deleted) return sendResponse(res, 404, "Book not found");

//     sendResponse(res, 200, "Book deleted successfully");
//   } catch (error) {
//     sendResponse(res, 500, "Error deleting book");
//   }
// };

// module.exports = {
//   getAllBooks,
//   createBook,
//   getBookById,
//   updateBook,
//   deleteBook,

// -------------just testing data start--------------------------------------------------------------
const Book = require("../Models/bookModel");
const Joi = require("joi");

const bookValidationSchema = Joi.object({
  title: Joi.string().trim().required(),
  subtitle: Joi.array().items(Joi.string().trim()).min(1).required(),
  accessionNumber: Joi.number().required(),
  isbnNo: Joi.string().trim().required(),
  noOfCopies: Joi.number().min(1).required(),
  barCodes: Joi.array().items(Joi.string().trim()).min(1).required(),
  availabilities: Joi.array()
    .items(Joi.string().required()) // Only validating status as a string
    .default([])
    .allow(null),
});
const sendResponse = (res, status, message, data = null) => {
  res.status(status).json({
    status,
    message,
    data,
  });
};
// Validation Handler
const validateBook = (bookData) => {
  const { error } = bookValidationSchema.validate(bookData);
  if (error) {
    throw new Error(error.details[0].message);
  }
};

// create books
const createBook = async (req, res) => {
  try {
    validateBook(req.body);

    let { noOfCopies, barCodes, ...bookData } = req.body;

    // Check if noOfCopies is provided
    if (!noOfCopies) {
      return sendResponse(
        res,
        400,
        "noOfCopies is required and cannot be null."
      );
    }

    // Ensure barCodes is an array
    if (!Array.isArray(barCodes)) {
      return sendResponse(res, 400, "barCodes should be an array.");
    }

    // Validate number of copies and barcode length
    if (barCodes.length > noOfCopies) {
      return sendResponse(
        res,
        400,
        "Number of barcodes cannot exceed number of copies."
      );
    }

    // If only one barcode is provided, generate missing barcodes
    if (barCodes.length === 1 && noOfCopies > 1) {
      let baseBarcode = parseInt(barCodes[0]);
      for (let i = 1; i < noOfCopies; i++) {
        barCodes.push((baseBarcode + i).toString().padStart(8, "0"));
      }
    }

    // If barCodes length doesn't match noOfCopies, return error
    if (barCodes.length !== noOfCopies) {
      return sendResponse(res, 400, "Mismatch between copies and barcodes.");
    }

    // Assign the updated barCodes and noOfCopies to bookData
    bookData.barCodes = barCodes;
    bookData.noOfCopies = noOfCopies;

    // Create book entry in the database
    const newBook = await Book.create(bookData);
    sendResponse(res, 201, "Book created successfully", newBook);
  } catch (error) {
    console.error(error);
    sendResponse(res, 400, error.message);
  }
};

// **Get All Books**
const getAllBooks = async (req, res) => {
  try {
    const books = await Book.findAll();

    // Format barCodes as comma-separated strings
    const formattedBooks = books.map((book) => ({
      ...book.toJSON(),
      barCodes: book.barCodes.join(", "),
    }));

    sendResponse(res, 200, "Books retrieved successfully", {
      Total_Books: books.length,
      books: formattedBooks,
    });
  } catch (error) {
    sendResponse(res, 500, "Error fetching books");
  }
};

// **Get Book by ID**
const getBookById = async (req, res) => {
  try {
    const book = await Book.findByPk(req.params.id);
    if (!book) return sendResponse(res, 404, "Book not found");

    sendResponse(res, 200, "Book retrieved successfully", book);
  } catch (error) {
    sendResponse(res, 500, "Error fetching book");
  }
};

// **Update Book**
const updateBook = async (req, res) => {
  try {
    const { id, ...bookData } = req.body;

    // Validate the updated data
    validateBook(bookData);

    let { noOfCopies, barCodes } = bookData;

    // Ensure barCodes is an array
    if (!Array.isArray(barCodes)) {
      return sendResponse(res, 400, "barCodes should be an array.");
    }

    // If only one barcode is provided and noOfCopies is greater than 1, generate missing barcodes
    if (barCodes.length === 1 && noOfCopies > 1) {
      let baseBarcode = parseInt(barCodes[0]);
      let generatedBarcodes = [barCodes[0]];

      for (let i = 1; i < noOfCopies; i++) {
        generatedBarcodes.push((baseBarcode + i).toString().padStart(8, "0"));
      }
      barCodes = generatedBarcodes;
    }

    // Check if the number of barcodes matches the number of copies
    if (barCodes.length !== noOfCopies) {
      return sendResponse(res, 400, "Mismatch between copies and barcodes.");
    }

    // Assign the updated barCodes and noOfCopies to bookData
    bookData.barCodes = barCodes;
    bookData.noOfCopies = noOfCopies;

    // Update book in the database
    const [updated] = await Book.update(bookData, {
      where: { id: req.params.id },
    });

    if (!updated) {
      return sendResponse(res, 404, "Book not found");
    }

    // Fetch the updated book to return in the response
    const updatedBook = await Book.findByPk(req.params.id);
    sendResponse(res, 200, "Book updated successfully", updatedBook);
  } catch (error) {
    console.error(error);
    sendResponse(res, 400, error.message);
  }
};
// **Delete Book**
const deleteBook = async (req, res) => {
  try {
    const deleted = await Book.destroy({ where: { id: req.params.id } });
    if (!deleted) return sendResponse(res, 404, "Book not found");

    sendResponse(res, 200, "Book deleted successfully");
  } catch (error) {
    sendResponse(res, 500, "Error deleting book");
  }
};

module.exports = {
  getAllBooks,
  createBook,
  getBookById,
  updateBook,
  deleteBook,
};
