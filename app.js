const express = require("express");
const path = require("path");
const hbs = require("hbs");
const env = require("./config/env");
const { sequelize } = require("./models");

const homeRoutes = require("./routes/homeRoutes");
const booksRoutes = require("./routes/booksRoutes");
const categoriesRoutes = require("./routes/categoriesRoutes");
const authorsRoutes = require("./routes/authorsRoutes");
const publishersRoutes = require("./routes/publishersRoutes");

const app = express();

app.set("view engine", "hbs");
app.set("views", path.join(__dirname, "views"));
app.set("view options", { layout: "layout" });

hbs.registerPartials(path.join(__dirname, "views/partials"));

hbs.registerHelper("isSelected", function (value, currentValue) {
  return Number(value) === Number(currentValue) ? "selected" : "";
});

hbs.registerHelper("isChecked", function (selectedValues, currentValue) {
  if (!selectedValues) return "";

  const current = String(currentValue);

  if (Array.isArray(selectedValues)) {
    return selectedValues.map((value) => String(value)).includes(current)
      ? "checked"
      : "";
  }

  return String(selectedValues) === current ? "checked" : "";
});

hbs.registerHelper("isActive", function (currentPath, targetPath) {
  if (!currentPath || !targetPath) return "";
  if (targetPath === "/") {
    return currentPath === "/" ? "nav-link-active fw-semibold" : "";
  }
  return currentPath === targetPath || currentPath.startsWith(`${targetPath}/`)
    ? "nav-link-active fw-semibold"
    : "";
});

app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use((req, res, next) => {
  res.locals.currentPath = req.path;
  next();
});

app.use("/", homeRoutes);
app.use("/books", booksRoutes);
app.use("/categories", categoriesRoutes);
app.use("/authors", authorsRoutes);
app.use("/publishers", publishersRoutes);

app.use((req, res) => {
  res.status(404).render("home", {
    title: "No Encontrado",
    errorMessage: "la ruta solicitada no existe",
    books: [],
    categories: [],
    search: "",
    selectedCategoryIds: [],
    hasFilters: false,
    resultsCount: 0
  });
});

app.use((error, req, res, next) => {
  console.error(error);
  res.status(500).send("error interno del servidor");
});

async function bootstrap() {
  try {
    await sequelize.authenticate();
    await sequelize.sync();

    app.listen(env.port, () => {
      console.log(`servidor corriendo en http://localhost:${env.port}`);
      console.log(`entorno activo: ${env.env}`);
    });
  } catch (error) {
    console.error("no fue posible iniciar el servidor", error);
    process.exit(1);
  }
}

bootstrap();
