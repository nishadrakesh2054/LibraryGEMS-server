const { DataTypes } = require("sequelize");
const { sequelize } = require("../DataBase/seqDB");
const bcrypt = require("bcrypt");

const Auth = sequelize.define(
  "Auth",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },

    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    roles: {
      type: DataTypes.ENUM(
        "admin",
        "teacher",
        "student",
        "librarian",
        "HR",
        "counselor"
      ),
      allowNull: false,
      defaultValue: "student",
    },
  },
  {
    timestamps: false,
    tableName: "Auth",
  }
);

// Ensure the predefined admin exists
const ensureAdminExists = async () => {
  const adminEmail = "admin@example.com";
  const adminPassword = "Admin@123";

  // await sequelize.sync({ alter: true });

  const existingAdmin = await Auth.findOne({ where: { email: adminEmail } });

  if (!existingAdmin) {
    const hashedPassword = await bcrypt.hash(adminPassword, 10);
    await Auth.create({
      name: "Super Admin",
      email: adminEmail,
      password: hashedPassword,
      roles: "admin",
    });
    console.log("Default Admin Created.");
  }
};

ensureAdminExists();

module.exports = Auth;
