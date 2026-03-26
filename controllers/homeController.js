const { Op } = require("sequelize");
const { Book, Category, Author, Publisher } = require("../models");

// limpia texto de busqueda
function normalizeSearch(value) {
  return String(value || "").trim();
}

// convierte query de categorias a array de ids
function parseCategoryIds(rawValue) {
  const source = Array.isArray(rawValue)
    ? rawValue
    : rawValue !== undefined
      ? [rawValue]
      : [];

  const parsed = source
    .map((value) => Number(value))
    .filter((value) => Number.isInteger(value) && value > 0);

  return [...new Set(parsed)];
}

// home con listado y filtros
exports.index = async (req, res, next) => {
  try {
    const search = normalizeSearch(req.query.search);
    const selectedCategoryIds = parseCategoryIds(req.query.categoryIds);

    const where = {};

    if (search) {
      where.title = {
        [Op.like]: `%${search}%`
      };
    }

    if (selectedCategoryIds.length > 0) {
      where.categoryId = {
        [Op.in]: selectedCategoryIds
      };
    }

    const [bookRows, categoryRows] = await Promise.all([
      Book.findAll({
        where,
        include: [
          { model: Category, as: "category" },
          { model: Author, as: "author" },
          { model: Publisher, as: "publisher" }
        ],
        order: [["title", "ASC"]]
      }),
      Category.findAll({ order: [["name", "ASC"]] })
    ]);

    const books = bookRows.map((book) => book.get({ plain: true }));
    const categories = categoryRows.map((category) => category.get({ plain: true }));

    res.render("home", {
      title: "Home",
      books,
      categories,
      search,
      selectedCategoryIds,
      hasFilters: !!search || selectedCategoryIds.length > 0,
      resultsCount: books.length
    });
  } catch (error) {
    next(error);
  }
};

// detalle de libro desde home
exports.detail = async (req, res, next) => {
  try {
    const id = Number(req.params.id);

    const book = await Book.findByPk(id, {
      include: [
        { model: Category, as: "category" },
        { model: Author, as: "author" },
        { model: Publisher, as: "publisher" }
      ]
    });

    if (!book) {
      return res.status(404).render("books/detail", {
        title: "Detalle de Libro",
        notFound: true
      });
    }

    return res.render("books/detail", {
      title: "Detalle de Libro",
      book: book.get({ plain: true }),
      notFound: false
    });
  } catch (error) {
    return next(error);
  }
};
