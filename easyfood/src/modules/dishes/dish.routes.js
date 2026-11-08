const express = require("express");
const dishController = require("./dish.controller");
const authenticate = require("../auth/auth.middleware");
const upload = require("../shared/upload.middleware");

const router = express.Router();

router.get("/restaurants/:restaurantId/dishes", dishController.list);
router.post("/restaurants/:restaurantId/dishes", authenticate, dishController.create);
router.get("/dishes/:dishId", dishController.getById);
router.put("/dishes/:dishId", authenticate, dishController.update);
router.delete("/dishes/:dishId", authenticate, dishController.remove);
router.post("/dishes/:dishId/image", authenticate, upload.single("image"), dishController.uploadImage);

module.exports = router;
