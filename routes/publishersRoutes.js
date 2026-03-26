const express = require("express");
const router = express.Router();
const publishersController = require("../controllers/publishersController");

// listado
router.get("/", publishersController.list);

// crear
router.get("/create", publishersController.createView);
router.post("/create", publishersController.create);

// editar
router.get("/edit/:id", publishersController.editView);
router.post("/edit/:id", publishersController.update);

// eliminar
router.get("/delete/:id", publishersController.deleteView);
router.post("/delete/:id", publishersController.delete);

module.exports = router;
