module.exports = (sequelize, DataTypes) => {
  // modelo de editoriales
  return sequelize.define(
    "Publisher",
    {
      id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
      },
      name: {
        type: DataTypes.STRING(160),
        allowNull: false,
        unique: true,
        validate: {
          notEmpty: true
        }
      },
      phone: {
        type: DataTypes.STRING(40),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      },
      country: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
          notEmpty: true
        }
      }
    },
    {
      tableName: "publishers",
      underscored: true,
      timestamps: true
    }
  );
};
