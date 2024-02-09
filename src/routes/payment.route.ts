import express from 'express'
import { allCoupons, applyDiscount, createPaymentIntent, deleteCoupon, newcoupon } from '../controllers/payment.controller.js';
import { adminOnly } from '../middlewares/auth.middleware.js';
const app = express.Router();


//api/v1/payment/create
app.post("/create",createPaymentIntent)

//api/v1/payment/discount
app.get("/discount", applyDiscount);

//api/v1/payment/coupon/new
app.post("/coupon/new", adminOnly,newcoupon); 

//api/v1/payment/coupon/all
app.get("/coupon/all", adminOnly,allCoupons);//so in query we have to provide the id of admin then

//api/v1/payment/coupon/:id
app.route("/coupon/:id").delete(adminOnly,deleteCoupon);



export default app;