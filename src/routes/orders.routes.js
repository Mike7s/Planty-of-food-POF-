const express = require("express");
const router = express.Router();

const {
  createOrder,
  deleteOrder,
  updateOrder,
  getOrders
} = require("../controller/orders.controller");

router.post("/", createOrder);
router.delete("/:id", deleteOrder);
router.put("/:id", updateOrder);
router.get("/", getOrders);

module.exports = router;