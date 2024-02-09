import express from "express";
import { adminOnly } from "../middlewares/auth.middleware.js";
import { allOrders, deleteOrder, getSingleOrder, myOrders, newOrder, processOrder } from "../controllers/order.controller.js";


const app = express.Router();

app.post("/new", newOrder);

app.get('/my', myOrders);

//localhos/api/v1/order/all?id=eiefje
app.get('/all', adminOnly, allOrders);

app.route("/:id")
    .get(getSingleOrder)
    .put(adminOnly, processOrder)
    .delete(adminOnly,deleteOrder);

export default app;
