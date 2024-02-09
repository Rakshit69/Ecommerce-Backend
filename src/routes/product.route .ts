import express from 'express'
import { adminOnly } from '../middlewares/auth.middleware.js';
import { deleteroduct, getAllProduct, getCategories, getLatestProducts, getSingleProduct, newProduct, searchAllProducts, updateProduct } from '../controllers/product.controller.js';
import { singleUpload } from '../middlewares/multer.middleware.js';

const app = express.Router();
//add new product in the category
app.post("/new", adminOnly, singleUpload, newProduct);
//get latest product 6
app.get("/latest" ,getLatestProducts)
//get all unique categories 
app.get("/categories" ,getCategories)
// get all prodcts only admin can access
app.get("/admin-product", adminOnly, getAllProduct)

app.get('/all',searchAllProducts);
//to update the product
app.route("/:id").get(getSingleProduct)
    .put(adminOnly,singleUpload, updateProduct)
    .delete(adminOnly, deleteroduct);
    //to search in the list of product with filters
export default app;

