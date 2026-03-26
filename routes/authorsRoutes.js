const express = require("express");
const router = express.Router();
const authorsController = require("../controllers/authorsController");

// listado
router.get("/", authorsController.list);

// crear
router.get("/create", authorsController.createView);
router.post("/create", authorsController.create);

// editar
router.get("/edit/:id", authorsController.editView);
router.post("/edit/:id", authorsController.update);

// eliminar
router.get("/delete/:id", authorsController.deleteView);
router.post("/delete/:id", authorsController.delete);

module.exports = router;
