// const { DataTypes } = require("sequelize");
// const { sequelize } = require("../DataBase/seqDB");

// const Book = sequelize.define(
//   "Book",
//   {
//     id: {
//       type: DataTypes.INTEGER,
//       primaryKey: true,
//       autoIncrement: true,
//     },
//     date: {
//       type: DataTypes.DATE,
//       allowNull: true,
//     },
//     title: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     subtitle: {
//       type: DataTypes.ARRAY(DataTypes.STRING),
//       allowNull: false,
//       validate: {
//         notEmpty: true,
//       },
//     },
//     accessionNumber: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       unique: true,
//     },
//     isbnNo: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     sourceOfAcquisition: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     language: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     bookNumber: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       validate: { min: 1 },
//     },
//     classNumber: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       validate: { min: 1 },
//     },
//     personalAuthor: { type: DataTypes.STRING },
//     corporateAuthor: { type: DataTypes.STRING },
//     conferenceAuthor: { type: DataTypes.STRING },
//     statementOfResponsibility: { type: DataTypes.STRING },
//     editionStatement: { type: DataTypes.STRING },
//     publisherName: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     dateOfPublication: {
//       type: DataTypes.DATE,
//     },
//     placeOfPublication: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     physicalDescription: { type: DataTypes.STRING },
//     subjectAddedEntry: { type: DataTypes.STRING },
//     addedEntryPersonalName: { type: DataTypes.STRING },
//     notes: { type: DataTypes.STRING },
//     price: {
//       type: DataTypes.FLOAT,
//       allowNull: false,
//       validate: { min: 0 },
//     },
//     source: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     seriesTitle: { type: DataTypes.STRING },
//     seriesNo: {
//       type: DataTypes.INTEGER,
//       validate: { min: 1 },
//     },
//     barCodes: {
//       type: DataTypes.ARRAY(DataTypes.STRING),
//       allowNull: false,
//       validate: {
//         notEmpty: true,
//       },
//     },
//     callNo: {
//       type: DataTypes.STRING,
//       allowNull: false,
//     },
//     noOfCopies: {
//       type: DataTypes.INTEGER,
//       allowNull: false,
//       validate: { min: 1 },
//     },
//     availabilities: {
//       type: DataTypes.ARRAY(DataTypes.JSON),
//       allowNull: true,
//       defaultValue: [],
//     },
//   },
//   {
//     timestamps: false,
//   }
// );

// module.exports = Book;

const { DataTypes } = require("sequelize");
const { sequelize } = require("../DataBase/seqDB");

const Book = sequelize.define(
  "Testbook",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },

    title: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    subtitle: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    accessionNumber: {
      type: DataTypes.INTEGER,
      allowNull: false,
      unique: true,
    },
    isbnNo: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    noOfCopies: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: { min: 1 },
    },
    barCodes: {
      type: DataTypes.ARRAY(DataTypes.STRING),
      allowNull: false,
      validate: {
        notEmpty: true,
      },
    },
    availabilities: {
      type: DataTypes.ARRAY(DataTypes.JSON),
      allowNull: true,
      defaultValue: [],
    },
  },
  {
    timestamps: false,
  }
);

module.exports = Book;
