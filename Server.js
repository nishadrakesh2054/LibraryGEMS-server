const express = require("express");
const app = express();
const cookieParser = require("cookie-parser");
const cors = require("cors");
const errorHandler = require("./utils/errorHandler");
const morgan = require("morgan");
const bp = require("body-parser");
const PORT = process.env.PORT || 5000;
const { sequelize, connectDB } = require("./DataBase/seqDB");

// middleware
app.use(morgan("dev"));
app.use(errorHandler);
app.use(cookieParser());
app.use(bp.json());
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173","http://localhost:5174"],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE"],
  })
);
app.use(express.json());

app.use("/uploads", express.static("uploads/"));

// user routes defined
// const authrouter = require("./Routes/authRoutes");
// app.use("/api", authrouter);

// students  routes defined
const studentRoutes = require("./Routes/studentRoutes");
app.use("/api", studentRoutes);

// books  routes defined
const bookRoutes = require("./Routes/bookRoute");
app.use("/api/books", bookRoutes);

// books  routes defined
const bookTransaction = require("./Routes/bookTransactionRoute");
app.use("/api/bookscirculation", bookTransaction);

// Connect to Database & Start Server
const startServer = async () => {
  try {
    await connectDB();
    await sequelize.sync({  alter: true });
    console.log("Database tables synced!");

    app.listen(PORT, () => {
      console.log(`Server listening on ${PORT}`);
    });
  } catch (error) {
    console.error("Error starting server:", error);
  }
};

startServer();
