require("dotenv").config();
const express = require("express");

const app = express();
app.use(express.json());

const productsRoutes = require("./routes/products.routes");
app.use("/products", productsRoutes);

const ordersRoutes= require("./routes/orders.routes");
app.use("/orders",ordersRoutes);

const usersRoutes= require("./routes/users.routes")
app.use("/users",usersRoutes);

app.listen(process.env.PORT || 3000, () => {
  console.log("Server running");
});