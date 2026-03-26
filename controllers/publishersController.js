const { Publisher, Book } = require("../models");

// limpia texto del formulario
function normalizeText(value) {
  return String(value || "").trim();
}

// arma url de regreso al listado
function publishersListUrl(params = {}) {
  const query = new URLSearchParams(params).toString();
  return query ? `/publishers?${query}` : "/publishers";
}

// listado de editoriales
exports.list = async (req, res, next) => {
  try {
    const publisherRows = await Publisher.findAll({
      include: [{ model: Book, as: "books", attributes: ["id"] }],
      order: [["name", "ASC"]]
    });

    const publishers = publisherRows.map((publisher) => {
      const item = publisher.get({ plain: true });
      item.booksCount = item.books ? item.books.length : 0;
      return item;
    });

    res.render("publishers/list", {
      title: "Mantenimiento de Editoriales",
      publishers,
      successMessage: req.query.success || "",
      errorMessage: req.query.error || ""
    });
  } catch (error) {
    next(error);
  }
};

// formulario de crear
exports.createView = (req, res) => {
  res.render("publishers/create", {
    title: "Crear Editorial",
    formData: {
      name: "",
      phone: "",
      country: ""
    }
  });
};

// accion de crear
exports.create = async (req, res, next) => {
  const name = normalizeText(req.body.name);
  const phone = normalizeText(req.body.phone);
  const country = normalizeText(req.body.country);

  if (!name || !phone || !country) {
    return res.status(400).render("publishers/create", {
      title: "Crear Editorial",
      errorMessage: "todos los campos son requeridos.",
      formData: { name, phone, country }
    });
  }

  try {
    await Publisher.create({ name, phone, country });

    return res.redirect(
      publishersListUrl({ success: "la editorial fue creada correctamente." })
    );
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).render("publishers/create", {
        title: "Crear Editorial",
        errorMessage: "ya existe una editorial con ese nombre.",
        formData: { name, phone, country }
      });
    }

    return next(error);
  }
};

// formulario de editar
exports.editView = async (req, res, next) => {
  try {
    const publisher = await Publisher.findByPk(req.params.id);

    if (!publisher) {
      return res.redirect(
        publishersListUrl({ error: "la editorial no existe." })
      );
    }

    return res.render("publishers/edit", {
      title: "Editar Editorial",
      publisher: publisher.get({ plain: true })
    });
  } catch (error) {
    return next(error);
  }
};

// accion de editar
exports.update = async (req, res, next) => {
  const id = Number(req.params.id);
  const name = normalizeText(req.body.name);
  const phone = normalizeText(req.body.phone);
  const country = normalizeText(req.body.country);

  try {
    const publisher = await Publisher.findByPk(id);

    if (!publisher) {
      return res.redirect(
        publishersListUrl({ error: "la editorial no existe." })
      );
    }

    if (!name || !phone || !country) {
      return res.status(400).render("publishers/edit", {
        title: "Editar Editorial",
        errorMessage: "todos los campos son requeridos.",
        publisher: {
          id,
          name,
          phone,
          country
        }
      });
    }

    publisher.name = name;
    publisher.phone = phone;
    publisher.country = country;
    await publisher.save();

    return res.redirect(
      publishersListUrl({ success: "la editorial fue actualizada correctamente." })
    );
  } catch (error) {
    if (error.name === "SequelizeUniqueConstraintError") {
      return res.status(400).render("publishers/edit", {
        title: "Editar Editorial",
        errorMessage: "ya existe una editorial con ese nombre.",
        publisher: {
          id,
          name,
          phone,
          country
        }
      });
    }

    return next(error);
  }
};

// confirmacion de eliminar
exports.deleteView = async (req, res, next) => {
  try {
    const publisher = await Publisher.findByPk(req.params.id);

    if (!publisher) {
      return res.redirect(
        publishersListUrl({ error: "la editorial no existe." })
      );
    }

    return res.render("publishers/delete", {
      title: "Eliminar Editorial",
      publisher: publisher.get({ plain: true })
    });
  } catch (error) {
    return next(error);
  }
};

// accion de eliminar
exports.delete = async (req, res, next) => {
  const id = Number(req.params.id);

  try {
    const publisher = await Publisher.findByPk(id, {
      include: [{ model: Book, as: "books", attributes: ["id"] }]
    });

    if (!publisher) {
      return res.redirect(
        publishersListUrl({ error: "la editorial no existe." })
      );
    }

    const booksCount = publisher.books ? publisher.books.length : 0;
    if (booksCount > 0) {
      return res.redirect(
        publishersListUrl({
          error: "no se puede eliminar la editorial porque tiene libros asociados."
        })
      );
    }

    await publisher.destroy();

    return res.redirect(
      publishersListUrl({ success: "la editorial fue eliminada correctamente." })
    );
  } catch (error) {
    return next(error);
  }
};
