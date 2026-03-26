const { DataTypes } = require("sequelize");
const sequelize = require("../config/db");

const BookFactory = require("./Book");
const CategoryFactory = require("./Category");
const AuthorFactory = require("./Author");
const PublisherFactory = require("./Publisher");

// crea modelos
const Book = BookFactory(sequelize, DataTypes);
const Category = CategoryFactory(sequelize, DataTypes);
const Author = AuthorFactory(sequelize, DataTypes);
const Publisher = PublisherFactory(sequelize, DataTypes);

// relaciones de libro
Book.belongsTo(Category, { foreignKey: "categoryId", as: "category" });
Book.belongsTo(Author, { foreignKey: "authorId", as: "author" });
Book.belongsTo(Publisher, { foreignKey: "publisherId", as: "publisher" });

// relaciones inversas
Category.hasMany(Book, { foreignKey: "categoryId", as: "books" });
Author.hasMany(Book, { foreignKey: "authorId", as: "books" });
Publisher.hasMany(Book, { foreignKey: "publisherId", as: "books" });

module.exports = {
  sequelize,
  Book,
  Category,
  Author,
  Publisher
};
