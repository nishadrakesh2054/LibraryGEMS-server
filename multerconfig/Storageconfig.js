const multer = require("multer");
const path = require("path");









// Define  pdf file filter function to allow only PDF files
const pdfStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./uploads/pdf");
  },
  filename: function (req, file, cb) {
    // Set filename for uploaded files
    const filename = `pdf-${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});
const pdfFileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    // Accept file
    cb(null, true);
  } else {
    // Reject file with specific error
    cb(new Error("Only PDF files are allowed"));
  }
};
const pdfUpload = multer({
    storage: pdfStorage,
    pdfFileFilter: pdfFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 },
  });
  
// Define file  and image filter function to allow only specific image types
const imageStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./uploads/images");
    },
    filename: function (req, file, cb) {
      cb(null, `img-${Date.now()}-${file.originalname}`);
    },
  });
const imageFilter = (req, file, cb) => {
  const allowedTypes = ["image/png", "image/jpg", "image/jpeg", "image/webp"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("Only jpeg, png, jpg,webp images are allowed"));
  }
};
const imageUpload = multer({
  storage: imageStorage,
  fileFilter:imageFilter,
});





// === Excel Storage & Filter ===
const excelStorage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, "./uploads/excel");
    },
    filename: function (req, file, cb) {
      cb(null, `excel-${Date.now()}-${file.originalname}`);
    },
  });
  const excelFileFilter = (req, file, cb) => {
    const allowedTypes = [
      "application/vnd.ms-excel", // .xls
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet", 
    ];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Only Excel files (.xls, .xlsx) are allowed"));
    }
  }
  const excelUpload = multer({
    storage: excelStorage,
    fileFilter: excelFileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  });
module.exports = {
  pdfUpload,
  imageUpload,
  excelUpload
};
