import mongoose from "mongoose";

const schema = new mongoose.Schema({

    name: {
        type: String,
        required: [true, "Please enter Name"],
    },
    photo: {
        type: String,
        required: [true, "Please add Photo"],
    },
    stock: {
        type: Number,
        required: [true, "Please update Stock"],
    },
    category: {
        type: String,
        required: [true, "Please add Category"],
        trim:true,
    },
    price: {
        type: Number,
        required: [true, "Please add Price"],
    },
}, { timestamps: true, });



export const Product = mongoose.model("Product", schema);