const express = require("express");
const router = express.Router();
const studentController = require("../Controllers/studentController");
const { excelUpload } = require("../multerconfig/Storageconfig");
const { protect, authorizeRoles } = require("../middleware/AuthMiddleware");

// Fetch all students
router.get(
  "/students",studentController.getAllStudents
);
// export  and save students from Excel
router.get("/students/export", studentController.exportStudentsToExcel);

// Fetch single students
router.get("/students/:id", studentController.getStudentByID);

// Save a new student
router.post("/students", studentController.addStudent);

// edit student
router.put("/students/:id", studentController.updateStudent);

// delete student
router.delete("/students/:id", studentController.deleteStudent);

// import  and save students from Excel
router.post(
  "/students/import",
  excelUpload.single("file"),
  studentController.UploadExcelStudent
);

module.exports = router;
