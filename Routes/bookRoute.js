const express = require("express");
const {
  getAllBooks,
  getBookById,
  createBook,
  updateBook,
  deleteBook,
} = require("../Controllers/bookController");

const router = express.Router();

router.get("/", getAllBooks); // GET /api/books
router.get("/:id", getBookById); // GET /api/books/:id
router.post("/", createBook); // POST /api/books
router.put("/:id", updateBook); // PUT /api/books/:id
router.delete("/:id", deleteBook); // DELETE /api/books/:id

module.exports = router;
