const Student = require("../Models/Students");
const xlsx = require("xlsx");
const fs = require("fs");
const path = require("path");
const { Op } = require("sequelize");
// Fetch all students
// const getAllStudents = async (req, res) => {
//   try {
//     const students = await Student.findAll();
//     res.status(200).json({
//       Total_students: students.length,
//       message: "student found successfuly",
//       students,
//     });
//   } catch (error) {
//     res.status(500).json({ message: "Error fetching students", error });
//   }
// };
const getAllStudents = async (req, res) => {
  try {
    const { search } = req.query; // Get search keyword from query params

    let whereCondition = {};

    if (search) {
      whereCondition = {
        [Op.or]: [
          { name: { [Op.iLike]: `%${search}%` } },
          { rollNo: { [Op.iLike]: `%${search}%` } },
          { email: { [Op.iLike]: `%${search}%` } },
        ],
      };
    }

    const students = await Student.findAll({ where: whereCondition });

    res.status(200).json({
      Total_students: students.length,
      message: "Students retrieved successfully",
      students,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching students", error });
  }
};

// get single student by rollNo
const getStudentByID = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findOne({ where: { id } });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student found successfully",
      student,
    });
  } catch (error) {
    res.status(500).json({ message: "Error fetching student", error });
  }
};

// Save a new student
const addStudent = async (req, res) => {
  try {
    const { name, rollNo, grade, age, email, phone } = req.body;

    // Validate required fields
    if (!name || !rollNo || !grade || !age || !email || !phone) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Check if a student with the same rollNo number already exists
    const existingStudent = await Student.findOne({ where: { rollNo } });
    if (existingStudent) {
      return res
        .status(400)
        .json({ message: "Student with this rollNo number already exists" });
    }

    // Create a new student
    const newStudent = await Student.create({
      name,
      grade,
      age,
      rollNo,
      email,
      phone,
    });

    res
      .status(201)
      .json({ message: "Student add successfully", student: newStudent });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error saving student", error: error.message });
  }
};

// Delete a student
const deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedStudent = await Student.destroy({
      where: { id },
    });

    if (deletedStudent === 0) {
      return res.status(404).json({ message: "Student not found" });
    }

    res.status(200).json({
      message: "Student deleted successfully",
      student: deletedStudent,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error deleting student", error: error.message });
  }
};

// Update student details
const updateStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, rollNo, grade, age, email, phone } = req.body;

    // Find the student by id first
    const student = await Student.findOne({ where: { id } });

    if (!student) {
      return res.status(404).json({ message: "Student not found" });
    }

    // Update student details
    student.name = name;
    student.rollNo = rollNo;
    student.grade = grade;
    student.age = age;
    student.email = email;
    student.phone = phone;

    // Save the updated student
    await student.save();

    res.status(200).json({
      message: "Student updated successfully",
      student,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Error updating student", error: error.message });
  }
};

// excell file upload
const UploadExcelStudent = async (req, res) => {
  try {
    // Check if a file was uploaded
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    // Read the uploaded Excel file
    const workbook = xlsx.readFile(req.file.path);
    const sheetName = workbook.SheetNames[0]; // Get the first sheet
    const worksheet = workbook.Sheets[sheetName];

    // Convert Excel sheet to JSON
    const jsonData = xlsx.utils.sheet_to_json(worksheet);

    // Validate and save each student to the database
    const savedStudents = [];
    const errors = [];

    for (const row of jsonData) {
      const { name, phone, email, grade, age, rollNo } = row;

      // Validate required fields
      if (!name || !phone || !email || !rollNo || !grade || !age) {
        errors.push({ row, error: "Missing required fields" });
        console.warn("Skipping invalid row:", row);
        continue;
      }

      // Check if a student with the same roll number already exists
      const existingStudent = await Student.findOne({ where: { rollNo } });
      if (existingStudent) {
        errors.push({
          row,
          error: "Student with this roll number already exists",
        });
        console.warn("Skipping duplicate row:", row);
        continue;
      }

      // Create a new student instance
      const newStudent = await Student.create({
        name,
        phone,
        email,
        rollNo,
        grade,
        age,
      });

      savedStudents.push(newStudent);
    }

    // Respond with success and any errors encountered
    res.status(201).json({
      message: "Students saved successfully",
      savedStudents,
      errors,
    });
  } catch (error) {
    console.error("Error processing Excel file:", error);
    res
      .status(500)
      .json({ message: "Error processing Excel file", error: error.message });
  }
};

// Export all students to Excel
const exportStudentsToExcel = async (req, res) => {
  try {
    // Fetch all students from the database
    const students = await Student.findAll();

    // Check if there are no students
    if (students.length === 0) {
      return res.status(404).json({ message: "No students found" });
    }

    // Convert student data to a JSON-friendly format
    const studentData = students.map((student) => ({
      Name: student.name,
      Phone: student.phone,
      Email: student.email,
      RollNo: student.rollNo,
      Grade: student.grade,
      Age: student.age,
    }));

    // Create a new workbook and worksheet
    const workbook = xlsx.utils.book_new();
    const worksheet = xlsx.utils.json_to_sheet(studentData);

    // Append the worksheet to the workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, "Students");

    // Define the path for saving the Excel file
    const filePath = path.join(__dirname, "../exports/students.xlsx");

    // Ensure the "exports" folder exists
    if (!fs.existsSync(path.join(__dirname, "../exports"))) {
      fs.mkdirSync(path.join(__dirname, "../exports"));
    }

    // Write the Excel file to the defined file path
    xlsx.writeFile(workbook, filePath);

    // Send the Excel file as a response to the client
    res.download(filePath, "students.xlsx", (err) => {
      if (err) {
        console.error("Error downloading file:", err);
        res.status(500).json({ message: "Error downloading file" });
      }
    });
  } catch (error) {
    // Log the error and send a response
    console.error("Error exporting students:", error);
    res.status(500).json({
      message: "Error exporting students",
      error: error.message,
    });
  }
};

module.exports = {
  getAllStudents,
  addStudent,
  UploadExcelStudent,
  deleteStudent,
  updateStudent,
  exportStudentsToExcel,
  getStudentByID,
};
