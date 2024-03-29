
import { stripe } from "../app.js";
import { TryCatch } from "../middlewares/error.middleware.js";
import { Coupon } from "../models/coupon.model.js";
import ErrorHandler from "../utils/utilityclasses.js";



export const createPaymentIntent = TryCatch(async (req, res, next) => {
  const { amount,ShippingInfo,name } = req.body;

  if (!amount || !ShippingInfo || !name) return next(new ErrorHandler("Please enter details", 400));
  const paymentIntent = await stripe.paymentIntents.create({
   
    amount: Number(amount) * 100,
    currency: "inr",
    description: 'Purchase of ...', 
   
    shipping: {
      name,
      address: {
       
      line1: ShippingInfo.address || "nothing",
      line2: ShippingInfo.address || "nothing",
      city: ShippingInfo.city || "mp",
      state: ShippingInfo.state || "mp",
      postal_code: ShippingInfo.pincode || "000000",
      country: "US", 
  }
   }

    
  });

  return res.status(201).json({
    success: true,
    clientSecret: paymentIntent.client_secret,
  });

})

export const newcoupon = TryCatch(async (req, res, next) => {

    const { coupon, amount } = req.body;

    if (!coupon || !amount) return next(new ErrorHandler("Please enter both field ", 400));

    await Coupon.create({ code: coupon, amount });

    return res.status(201).json({
        success: true,
        message: `Coupon ${coupon} created successfully`
    });

})

export const applyDiscount = TryCatch(async (req, res, next) => {

    const { coupon } = req.query;

    const discount = await Coupon.findOne({ code: coupon });
  
    if (!discount) return next(new ErrorHandler("Invalid Coupon Code", 400));
  
    return res.status(200).json({
      success: true,
      discount: discount.amount,
    });
});

export const allCoupons = TryCatch(async (req, res, next) => {

   

    const coupons = await Coupon.find({});
  
  
    return res.status(200).json({
      success: true,
        coupons
    });
});
export const deleteCoupon = TryCatch(async (req, res, next) => {

    const { id } = req.params;
    
  const coupon=  await Coupon.findByIdAndDelete(id);

    if (!coupon) next(new ErrorHandler("Invalid Coupon ID Given", 400));


 
    return res.status(200).json({
      success: true,
        message:`coupon ${coupon?.code} deleted successfully done`
    });
});

