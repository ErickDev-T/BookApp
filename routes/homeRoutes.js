const express = require("express");
const router = express.Router();
const homeController = require("../controllers/homeController");

// home
router.get("/", homeController.index);
// detalle desde home
router.get("/detalle-libro/:id", homeController.detail);

module.exports = router;
