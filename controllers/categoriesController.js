const { Category, Book } = require("../models");

// limpia texto del formulario
function normalizeText(value) {
  return String(value || "").trim();
}

// arma url de regreso al listado
function categoriesListUrl(params = {}) {
  const query = new URLSearchParams(params).toString();
  return query ? `/categories?${query}` : "/categories";
}

// listado de categorias
exports.list = async (req, res, next) => {
  try {
    const categoryRows = await Category.findAll({
      include: [{ model: Book, as: "books", attributes: ["id"] }],
      order: [["name", "ASC"]]
    });

    const categories = categoryRows.map((category) => {
      const item = category.get({ plain: true });
      item.booksCount = item.books ? item.books.length : 0;
      return item;
    });

    res.render("categories/list", {
      title: "Mantenimiento de Categorias",
      categories,
      successMessage: req.query.success || "",
      errorMessage: req.query.error || ""
    });
  } catch (error) {
    next(error);
  }
};

// formulario de crear
exports.createView = (req, res) => {
  res.render("categories/create", {
    title: "Crear Categoria",
    formData: {
      name: "",
      description: ""
    }
  });
};

// accion de crear
exports.create = async (req, res, next) => {
  const name = normalizeText(req.body.name);
  const description = normalizeText(req.body.description);

  if (!name || !description) {
    return res.status(400).render("categories/create", {
      title: "Crear Categoria",
      errorMessage: "todos los campos son requeridos.",
      formData: { name, description }
    });
  }

  try {
    await Category.create({ name, description });

    return res.redirect(
      categoriesListUrl({ success: "la categoria fue creada correctamente." })
    );
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).render("categories/create", {
        title: "Crear Categoria",
        errorMessage: "ya existe una categoria con ese nombre.",
        formData: { name, description }
      });
    }

    return next(error);
  }
};

// formulario de editar
exports.editView = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.redirect(
        categoriesListUrl({ error: "la categoria no existe." })
      );
    }

    return res.render("categories/edit", {
      title: "Editar Categoria",
      category: category.get({ plain: true })
    });
  } catch (error) {
    return next(error);
  }
};

// accion de editar
exports.update = async (req, res, next) => {
  const name = normalizeText(req.body.name);
  const description = normalizeText(req.body.description);
  const id = Number(req.params.id);

  try {
    const category = await Category.findByPk(id);

    if (!category) {
      return res.redirect(
        categoriesListUrl({ error: "la categoria no existe." })
      );
    }

    if (!name || !description) {
      return res.status(400).render("categories/edit", {
        title: "Editar Categoria",
        errorMessage: "todos los campos son requeridos.",
        category: {
          id,
          name,
          description
        }
      });
    }

    category.name = name;
    category.description = description;
    await category.save();

    return res.redirect(
      categoriesListUrl({ success: "la categoria fue actualizada correctamente." })
    );
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).render("categories/edit", {
        title: "Editar Categoria",
        errorMessage: "ya existe una categoria con ese nombre.",
        category: {
          id,
          name,
          description
        }
      });
    }

    return next(error);
  }
};

// confirmacion de eliminar
exports.deleteView = async (req, res, next) => {
  try {
    const category = await Category.findByPk(req.params.id);

    if (!category) {
      return res.redirect(
        categoriesListUrl({ error: "la categoria no existe." })
      );
    }

    return res.render("categories/delete", {
      title: "Eliminar Categoria",
      category: category.get({ plain: true })
    });
  } catch (error) {
    return next(error);
  }
};

// accion de eliminar
exports.delete = async (req, res, next) => {
  const id = Number(req.params.id);

  try {
    const category = await Category.findByPk(id, {
      include: [{ model: Book, as: "books", attributes: ["id"] }]
    });

    if (!category) {
      return res.redirect(
        categoriesListUrl({ error: "la categoria no existe." })
      );
    }

    const booksCount = category.books ? category.books.length : 0;
    if (booksCount > 0) {
      return res.redirect(
        categoriesListUrl({
          error: "no se puede eliminar la categoria porque tiene libros asociados."
        })
      );
    }

    await category.destroy();

    return res.redirect(
      categoriesListUrl({ success: "la categoria fue eliminada correctamente." })
    );
  } catch (error) {
    return next(error);
  }
};
