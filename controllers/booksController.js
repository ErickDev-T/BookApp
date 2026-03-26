const fs = require("fs");
const { Book, Category, Author, Publisher } = require("../models");
const { sendBookPublishedEmail } = require("../services/mailer");

// limpia texto
function normalizeText(value) {
  return String(value || "").trim();
}

// valida ids
function normalizeId(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

// valida ano
function normalizeYear(value) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed > 0 ? parsed : null;
}

// arma url de regreso al listado
function booksListUrl(params = {}) {
  const query = new URLSearchParams(params).toString();
  return query ? `/books?${query}` : "/books";
}

// borra archivo subido si no se usa
function deleteUploadedFile(filePath) {
  if (!filePath) return;
  if (fs.existsSync(filePath)) {
    fs.unlinkSync(filePath);
  }
}

// carga catalogos para selects
async function loadCatalogs() {
  const [categoryRows, authorRows, publisherRows] = await Promise.all([
    Category.findAll({ order: [["name", "ASC"]] }),
    Author.findAll({ order: [["name", "ASC"]] }),
    Publisher.findAll({ order: [["name", "ASC"]] })
  ]);

  return {
    categories: categoryRows.map((item) => item.get({ plain: true })),
    authors: authorRows.map((item) => item.get({ plain: true })),
    publishers: publisherRows.map((item) => item.get({ plain: true }))
  };
}

// revisa si faltan datos base
function getMissingCatalogs(catalogs) {
  const missing = [];
  if (!catalogs.categories.length) missing.push("categorias");
  if (!catalogs.authors.length) missing.push("autores");
  if (!catalogs.publishers.length) missing.push("editoriales");
  return missing;
}

// valida ids seleccionados
async function validateReferences(formData) {
  const [category, author, publisher] = await Promise.all([
    Category.findByPk(formData.categoryId),
    Author.findByPk(formData.authorId),
    Publisher.findByPk(formData.publisherId)
  ]);

  if (!category) return "la categoria seleccionada no existe.";
  if (!author) return "el autor seleccionado no existe.";
  if (!publisher) return "la editorial seleccionada no existe.";
  return "";
}

// datos base del formulario
function buildFormData(source = {}) {
  return {
    title: normalizeText(source.title),
    publishedYear: normalizeYear(source.publishedYear),
    categoryId: normalizeId(source.categoryId),
    authorId: normalizeId(source.authorId),
    publisherId: normalizeId(source.publisherId)
  };
}

// render de crear
async function renderCreate(res, options = {}) {
  const catalogs = await loadCatalogs();
  const missingCatalogs = getMissingCatalogs(catalogs);

  return res.status(options.status || 200).render("books/create", {
    title: "Crear Libro",
    errorMessage: options.errorMessage || "",
    formData: options.formData || buildFormData(),
    categories: catalogs.categories,
    authors: catalogs.authors,
    publishers: catalogs.publishers,
    missingCatalogs,
    canSubmit: missingCatalogs.length === 0
  });
}

// render de editar
async function renderEdit(res, book, options = {}) {
  const catalogs = await loadCatalogs();
  const missingCatalogs = getMissingCatalogs(catalogs);

  return res.status(options.status || 200).render("books/edit", {
    title: "Editar Libro",
    errorMessage: options.errorMessage || "",
    book: book.get({ plain: true }),
    formData:
      options.formData ||
      buildFormData({
        title: book.title,
        publishedYear: book.publishedYear,
        categoryId: book.categoryId,
        authorId: book.authorId,
        publisherId: book.publisherId
      }),
    categories: catalogs.categories,
    authors: catalogs.authors,
    publishers: catalogs.publishers,
    missingCatalogs,
    canSubmit: missingCatalogs.length === 0
  });
}

// listado de libros
exports.list = async (req, res, next) => {
  try {
    const bookRows = await Book.findAll({
      include: [
        { model: Category, as: "category" },
        { model: Author, as: "author" },
        { model: Publisher, as: "publisher" }
      ],
      order: [["title", "ASC"]]
    });

    const books = bookRows.map((book) => book.get({ plain: true }));

    res.render("books/list", {
      title: "Mantenimiento de Libros",
      books,
      successMessage: req.query.success || "",
      errorMessage: req.query.error || "",
      warningMessage: req.query.warning || ""
    });
  } catch (error) {
    next(error);
  }
};

// formulario de crear
exports.createView = async (req, res, next) => {
  try {
    return await renderCreate(res);
  } catch (error) {
    return next(error);
  }
};

// accion de crear
exports.create = async (req, res, next) => {
  const formData = buildFormData(req.body);
  const coverImageFile = req.file;

  try {
    const catalogs = await loadCatalogs();
    const missingCatalogs = getMissingCatalogs(catalogs);

    if (missingCatalogs.length > 0) {
      deleteUploadedFile(coverImageFile && coverImageFile.path);
      return await renderCreate(res, {
        status: 400,
        errorMessage: `no se puede crear libros porque faltan: ${missingCatalogs.join(", ")}.`,
        formData
      });
    }

    if (!formData.title || !formData.publishedYear || !formData.categoryId || !formData.authorId || !formData.publisherId) {
      deleteUploadedFile(coverImageFile && coverImageFile.path);
      return await renderCreate(res, {
        status: 400,
        errorMessage: "todos los campos son requeridos.",
        formData
      });
    }

    if (!coverImageFile) {
      return await renderCreate(res, {
        status: 400,
        errorMessage: "la imagen de portada es requerida.",
        formData
      });
    }

    const referencesError = await validateReferences(formData);
    if (referencesError) {
      deleteUploadedFile(coverImageFile.path);
      return await renderCreate(res, {
        status: 400,
        errorMessage: referencesError,
        formData
      });
    }

    const createdBook = await Book.create({
      ...formData,
      coverImage: `/uploads/${coverImageFile.filename}`
    });

    const author = await Author.findByPk(formData.authorId);

    try {
      const mailResult = await sendBookPublishedEmail({
        authorEmail: author ? author.email : "",
        authorName: author ? author.name : "autor",
        bookTitle: createdBook.title
      });

      if (!mailResult.sent) {
        return res.redirect(
          booksListUrl({
            warning: "el libro fue creado, pero no se envio correo al autor porque no tiene email."
          })
        );
      }

      if (mailResult.mode === "mock") {
        return res.redirect(
          booksListUrl({
            success: "el libro fue creado y el correo se genero en modo simulado."
          })
        );
      }
    } catch (mailError) {
      console.error("error enviando correo al autor:", mailError);
      return res.redirect(
        booksListUrl({
          warning: "el libro fue creado, pero ocurrio un error enviando el correo al autor."
        })
      );
    }

    return res.redirect(
      booksListUrl({ success: "el libro fue creado y se envio correo al autor." })
    );
  } catch (error) {
    deleteUploadedFile(coverImageFile && coverImageFile.path);
    return next(error);
  }
};

// formulario de editar
exports.editView = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
      return res.redirect(booksListUrl({ error: "el libro no existe." }));
    }

    return await renderEdit(res, book);
  } catch (error) {
    return next(error);
  }
};

// accion de editar
exports.update = async (req, res, next) => {
  const formData = buildFormData(req.body);
  const coverImageFile = req.file;
  const id = Number(req.params.id);

  try {
    const book = await Book.findByPk(id);

    if (!book) {
      deleteUploadedFile(coverImageFile && coverImageFile.path);
      return res.redirect(booksListUrl({ error: "el libro no existe." }));
    }

    const catalogs = await loadCatalogs();
    const missingCatalogs = getMissingCatalogs(catalogs);

    if (missingCatalogs.length > 0) {
      deleteUploadedFile(coverImageFile && coverImageFile.path);
      return await renderEdit(res, book, {
        status: 400,
        errorMessage: `no se puede editar libros porque faltan: ${missingCatalogs.join(", ")}.`,
        formData
      });
    }

    if (!formData.title || !formData.publishedYear || !formData.categoryId || !formData.authorId || !formData.publisherId) {
      deleteUploadedFile(coverImageFile && coverImageFile.path);
      return await renderEdit(res, book, {
        status: 400,
        errorMessage: "todos los campos son requeridos, excepto la imagen.",
        formData
      });
    }

    const referencesError = await validateReferences(formData);
    if (referencesError) {
      deleteUploadedFile(coverImageFile && coverImageFile.path);
      return await renderEdit(res, book, {
        status: 400,
        errorMessage: referencesError,
        formData
      });
    }

    book.title = formData.title;
    book.publishedYear = formData.publishedYear;
    book.categoryId = formData.categoryId;
    book.authorId = formData.authorId;
    book.publisherId = formData.publisherId;

    if (coverImageFile) {
      book.coverImage = `/uploads/${coverImageFile.filename}`;
    }

    await book.save();

    return res.redirect(
      booksListUrl({ success: "el libro fue actualizado correctamente." })
    );
  } catch (error) {
    deleteUploadedFile(coverImageFile && coverImageFile.path);
    return next(error);
  }
};

// confirmacion de eliminar
exports.deleteView = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
      return res.redirect(booksListUrl({ error: "el libro no existe." }));
    }

    return res.render("books/delete", {
      title: "Eliminar Libro",
      book: book.get({ plain: true })
    });
  } catch (error) {
    return next(error);
  }
};

// accion de eliminar
exports.delete = async (req, res, next) => {
  try {
    const book = await Book.findByPk(req.params.id);

    if (!book) {
      return res.redirect(booksListUrl({ error: "el libro no existe." }));
    }

    await book.destroy();

    return res.redirect(
      booksListUrl({ success: "el libro fue eliminado correctamente." })
    );
  } catch (error) {
    return next(error);
  }
};
