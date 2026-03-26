module.exports = (sequelize, DataTypes) => {
  // modelo de autores
  return sequelize.define(
    "Author",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      email: {
        type: DataTypes.STRING(160),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true,
          isEmail: true
        }
      }
    },
    {
      tableName: "authors",
      underscored: true,
      timestamps: true
    }
  );
};
