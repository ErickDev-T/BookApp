const express = require("express");
const router = express.Router();
const categoriesController = require("../controllers/categoriesController");

// listado
router.get("/", categoriesController.list);

// crear
router.get("/create", categoriesController.createView);
router.post("/create", categoriesController.create);

// editar
router.get("/edit/:id", categoriesController.editView);
router.post("/edit/:id", categoriesController.update);

// eliminar
router.get("/delete/:id", categoriesController.deleteView);
router.post("/delete/:id", categoriesController.delete);

module.exports = router;
