module.exports = (sequelize, DataTypes) => {
  // modelo de libros
  return sequelize.define(
    "Book",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      title: {
        type: DataTypes.STRING(200),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      publishedYear: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
          min: 0
        }
      },
      coverImage: {
        type: DataTypes.STRING(255),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      categoryId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      authorId: {
        type: DataTypes.INTEGER,
        allowNull: false
      },
      publisherId: {
        type: DataTypes.INTEGER,
        allowNull: false
      }
    },
    {
      tableName: "books",
      underscored: true,
      timestamps: true
    }
  );
};
