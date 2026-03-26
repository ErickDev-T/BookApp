const { Author, Book } = require("../models");

// limpia texto del formulario
function normalizeText(value) {
  return String(value || "").trim();
}

// valida formato de correo
function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// arma url de regreso al listado
function authorsListUrl(params = {}) {
  const query = new URLSearchParams(params).toString();
  return query ? `/authors?${query}` : "/authors";
}

// listado de autores
exports.list = async (req, res, next) => {
  try {
    const authorRows = await Author.findAll({
      include: [{ model: Book, as: "books", attributes: ["id"] }],
      order: [["name", "ASC"]]
    });

    const authors = authorRows.map((author) => {
      const item = author.get({ plain: true });
      item.booksCount = item.books ? item.books.length : 0;
      return item;
    });

    res.render("authors/list", {
      title: "Mantenimiento de Autores",
      authors,
      successMessage: req.query.success || "",
      errorMessage: req.query.error || ""
    });
  } catch (error) {
    next(error);
  }
};

// formulario de crear
exports.createView = (req, res) => {
  res.render("authors/create", {
    title: "Crear Autor",
    formData: {
      name: "",
      email: ""
    }
  });
};

// accion de crear
exports.create = async (req, res, next) => {
  const name = normalizeText(req.body.name);
  const email = normalizeText(req.body.email).toLowerCase();

  if (!name || !email) {
    return res.status(400).render("authors/create", {
      title: "Crear Autor",
      errorMessage: "todos los campos son requeridos.",
      formData: { name, email }
    });
  }

  if (!isValidEmail(email)) {
    return res.status(400).render("authors/create", {
      title: "Crear Autor",
      errorMessage: "el correo no tiene un formato valido.",
      formData: { name, email }
    });
  }

  try {
    await Author.create({ name, email });

    return res.redirect(
      authorsListUrl({ success: "el autor fue creado correctamente." })
    );
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).render("authors/create", {
        title: "Crear Autor",
        errorMessage: "ya existe un autor con ese correo.",
        formData: { name, email }
      });
    }

    return next(error);
  }
};

// formulario de editar
exports.editView = async (req, res, next) => {
  try {
    const author = await Author.findByPk(req.params.id);

    if (!author) {
      return res.redirect(
        authorsListUrl({ error: "el autor no existe." })
      );
    }

    return res.render("authors/edit", {
      title: "Editar Autor",
      author: author.get({ plain: true })
    });
  } catch (error) {
    return next(error);
  }
};

// accion de editar
exports.update = async (req, res, next) => {
  const name = normalizeText(req.body.name);
  const email = normalizeText(req.body.email).toLowerCase();
  const id = Number(req.params.id);

  try {
    const author = await Author.findByPk(id);

    if (!author) {
      return res.redirect(
        authorsListUrl({ error: "el autor no existe." })
      );
    }

    if (!name || !email) {
      return res.status(400).render("authors/edit", {
        title: "Editar Autor",
        errorMessage: "todos los campos son requeridos.",
        author: {
          id,
          name,
          email
        }
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).render("authors/edit", {
        title: "Editar Autor",
        errorMessage: "el correo no tiene un formato valido.",
        author: {
          id,
          name,
          email
        }
      });
    }

    author.name = name;
    author.email = email;
    await author.save();

    return res.redirect(
      authorsListUrl({ success: "el autor fue actualizado correctamente." })
    );
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).render("authors/edit", {
        title: "Editar Autor",
        errorMessage: "ya existe un autor con ese correo.",
        author: {
          id,
          name,
          email
        }
      });
    }

    return next(error);
  }
};

// confirmacion de eliminar
exports.deleteView = async (req, res, next) => {
  try {
    const author = await Author.findByPk(req.params.id);

    if (!author) {
      return res.redirect(
        authorsListUrl({ error: "el autor no existe." })
      );
    }

    return res.render("authors/delete", {
      title: "Eliminar Autor",
      author: author.get({ plain: true })
    });
  } catch (error) {
    return next(error);
  }
};

// accion de eliminar
exports.delete = async (req, res, next) => {
  const id = Number(req.params.id);

  try {
    const author = await Author.findByPk(id, {
      include: [{ model: Book, as: "books", attributes: ["id"] }]
    });

    if (!author) {
      return res.redirect(
        authorsListUrl({ error: "el autor no existe." })
      );
    }

    const booksCount = author.books ? author.books.length : 0;
    if (booksCount > 0) {
      return res.redirect(
        authorsListUrl({
          error: "no se puede eliminar el autor porque tiene libros asociados."
        })
      );
    }

    await author.destroy();

    return res.redirect(
      authorsListUrl({ success: "el autor fue eliminado correctamente." })
    );
  } catch (error) {
    return next(error);
  }
};
