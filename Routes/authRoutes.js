const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../middleware/AuthMiddleware");

const authController = require("../Controllers/authenticationcontroller");

router.post(
  "/register",
  protect,

  authorizeRoles("admin", "librarian"),

  authorizeRoles("admin"),
  authController.register
);

router.route("/login").post(authController.login);
router.route("/logout").get(authController.logout);

// Protected route (only logged-in users)
router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  authController.getAllUsers
);

module.exports = router;
