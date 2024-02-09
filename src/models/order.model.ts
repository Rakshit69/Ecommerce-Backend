import mongoose, { Schema } from "mongoose";
import { User } from "./user.model.js";

const schema = new mongoose.Schema({
    shippingInfo: {
        address: {
            type: String,
            required:true
        },
        city: {
            type: String,
            required:true
        },
        state: {
            type: String,
            required:true
        },
        country: {
            type: String,
            required:true
        },
        pincode: {
            type: Number,
            required:true
        },

    },
    user: {
        type: String,
        /// <reference path="" />
        ref: "User",
        required: true,

    },

    subtotal: {
        type: Number,
        required: true,
    },
    discount: {
        
        type: Number,
        required: true,
        default:0,
    },
    tax: {
        
        type: Number,
        required: true,
    },
    shippingCharges: {
        
        type: Number,
        required: true,
        default :0,
    },

    total: {
        
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ["Processing", "Delivered", "Shipped"],
        default:"Processing"
    },
    orderItems: [
        {
            name: String,
            photo: String,
            quantity: Number,
            price: Number,
            productId: {
                type: mongoose.Types.ObjectId,
                ref: "Product",
                
            }
        }
    ]

}, { timestamps: true, });



export const Order = mongoose.model("Order", schema);