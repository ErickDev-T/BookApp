const express = require("express");
const router = express.Router();
const booksController = require("../controllers/booksController");
const upload = require("../middlewares/upload");

// listado
router.get("/", booksController.list);

// crear
router.get("/create", booksController.createView);
router.post("/create", upload.single("coverImage"), booksController.create);

// editar
router.get("/edit/:id", booksController.editView);
router.post("/edit/:id", upload.single("coverImage"), booksController.update);

// eliminar
router.get("/delete/:id", booksController.deleteView);
router.post("/delete/:id", booksController.delete);

module.exports = router;
