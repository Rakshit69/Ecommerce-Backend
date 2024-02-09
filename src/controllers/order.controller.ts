import { Request } from "express";
import { TryCatch } from "../middlewares/error.middleware.js";
import { NewOrderRequestBody } from "../types/types.js";
import ErrorHandler from "../utils/utilityclasses.js";
import { Order } from "../models/order.model.js";
import { invalidateCache, reduceStock } from "../utils/features.js";
import { myCache } from "../app.js";

export const myOrders = TryCatch(async (req, res, next) => {
    let orders;
    let { id: user } = req.query
    // ?id=userid in the url ok
    const key = `my-orders-${user}`
    if (myCache.has(key)) {
        orders = JSON.parse(myCache.get(key) as string);
    }
    else {
        orders = await Order.find({ user });
        myCache.set(key, JSON.stringify(orders));

    }

    
    return res.status(200).json({
        success: true,
        orders,
    }
    
    )
});

export const allOrders = TryCatch(async (req, res, next) => {
    const key = `all-orders`;
  
    let orders = [];
  
    if (myCache.has(key)) orders = JSON.parse(myCache.get(key) as string);
    else {
      orders = await Order.find().populate("user", "name");
      myCache.set(key, JSON.stringify(orders));
    }
    return res.status(200).json({
      success: true,
      orders,
    });
  });


  export const getSingleOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
    const key = `order-${id}`;
  
    let order;
  
    if (myCache.has(key)) order = JSON.parse(myCache.get(key) as string);
    else {
      order = await Order.findById(id).populate("user", "name");
  
      if (!order) return next(new ErrorHandler("Order Not Found", 404));
  
      myCache.set(key, JSON.stringify(order));
    }
    return res.status(200).json({
      success: true,
      order,
    });
  });



  export const newOrder = TryCatch(async (req:Request<{},{},NewOrderRequestBody>, res, next) => {
    const {
        shippingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
      } = req.body;
  
    if (!shippingInfo || !orderItems || !user  || !subtotal || !tax || !total) {
       console.log(req.body)
        return next(new ErrorHandler(  "Please Enter All Fields", 400));
      }
  
    const order = await Order.create({
        shippingInfo,
        orderItems,
        user,
        subtotal,
        tax,
        shippingCharges,
        discount,
        total,
    });
    
    await reduceStock(orderItems);

    
    invalidateCache({
      products: true,
      admin: true,
      order: true,
      userId: user,
      productId: order.orderItems.map((i) => String(i.productId))
    })
    return res.status(201).json({
        success: true,
        message: "Order Placed Successfully",
    });
    
  })

 
  export const processOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
  
    const order = await Order.findById(id);
  
    if (!order) return next(new ErrorHandler("Order Not Found", 404));
  
    switch (order.status) {
      case "Processing":
        order.status = "Shipped";
        break;
      case "Shipped":
        order.status = "Delivered";
        break;
      default:
        order.status = "Delivered";
        break;
    }
  
    await order.save();
  
   invalidateCache({
      products: false,
      order: true,
      admin: true,
       userId: order.user,
       orderId:String(order._id)
     
    });
  
    return res.status(200).json({
      success: true,
      message: "Order Processed Successfully",
    });
  });
  
  export const deleteOrder = TryCatch(async (req, res, next) => {
    const { id } = req.params;
  
    const order = await Order.findById(id);
    if (!order) return next(new ErrorHandler("Order Not Found", 404));
  
    invalidateCache({
        products: false,
        order: true,
          admin: true,
        userId: order.user,
          orderId:String(order._id)
           });
    
    await order.deleteOne();
  
   
    return res.status(200).json({
      success: true,
      message: "Order Deleted Successfully",
    });
  });