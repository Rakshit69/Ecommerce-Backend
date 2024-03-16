import { Request } from "express";
import { TryCatch } from "../middlewares/error.middleware.js";
import { BaseQuery, NewProductRequestBody, SearchRequestQuery } from "../types/types.js";
import { Product } from "../models/product.model.js";
import ErrorHandler from "../utils/utilityclasses.js";
import { rm } from "fs";
import { myCache } from "../app.js";
import { invalidateCache } from "../utils/features.js";


//revalidate on create new ,update or delete product and new Order
export const getLatestProducts = TryCatch(async (req, res, next) => {
  let products = [];
  if (myCache.has("latest-products")) {

    products = JSON.parse(myCache.get("latest-products")!);
  } else {

    products = await Product.find({}).sort({ createdAt: -1 }).limit(6);
    myCache.set("latest-products", JSON.stringify(products));
    
  }
    return res.status(201).json({
    success: true,
    products,
  });
});

//revalidate on createnew ,update or delete product and new Order
export const getCategories = TryCatch(async (req, res, next) => {
  let categories;
  if (myCache.has("product-categories")) {
    categories = JSON.parse(myCache.get("product-categories")as string);

  } else {
    
    categories = await Product.distinct("category");
    myCache.set("product-categories", JSON.stringify(categories));


  }
  return res.status(201).json({
    success: true,
    categories,
  });
});

//revalidate on createnew ,update or delete product and new Order
export const getAllProduct = TryCatch(async (req, res, next) => {
  let products;
  if (myCache.has("all-products")) {
    products = JSON.parse(myCache.get("all-products") as string);
  } else {
    products = await Product.find({});
    myCache.set("all-products", JSON.stringify(products));
   
    
  }
  
  return res.status(201).json({
    success: true,
    products,
  });
});

export const getSingleProduct = TryCatch(async (req, res, next) => {
  const id = req.params.id;
  let product;
  if (myCache.has(`product-${id}`)) product=JSON.parse(myCache.get(`product-${id}`) as string);
  else {
    product = await Product.findById(id);
    if (!product) return next(new ErrorHandler("Product not found ", 404));
    myCache.set(`product-${id}`, JSON.stringify(product));

  }
 

  return res.status(201).json({
    success: true,
    product,
  });
});

export const newProduct = TryCatch(
  async (req: Request<{}, {}, NewProductRequestBody>, res, next) => {
    const { name, stock, price, category } = req.body;
    const photo = req.file;

    if (!photo) return next(new ErrorHandler("please add  a photo", 400));
    if (!name || !stock || !price || !category) {
      rm(photo.path, () => {
        console.log("file deleted successfully because other fields are empty");
      });

      return next(new ErrorHandler("please add all Fields", 400));
    }

   const product= await Product.create({
      name,
      stock,
      price,
      category: category.toLowerCase(),
      photo: photo.path,
    });
    invalidateCache({ products: true ,admin :true,productId:String(product._id)});
    return res.status(201).json({
      success: true,
      message: "Product created successfully ok",
    });
  }
);

export const updateProduct = TryCatch(
    async (req, res, next) => {
      const { name, stock, price  , category } = req.body;
      const photo = req.file;
      const id= req.params.id;
      const product = await Product.findById(id);

      if (!product) return next(new ErrorHandler("Invalid product id", 404));
      if (photo) {
        rm(product.photo!, () => {
          console.log("old photo deleted successfully");
        });
        product.photo = photo.path;
      }
  
        if (name) product.name = name;

        if (stock) product.stock = stock;

        if (price) product.price = price;

    if (category) product.category = category;
    
    await product.save();
    
          invalidateCache({ products: true ,admin :true,productId:String(product._id)});

      return res.status(201).json({
        success: true,
        message: "Product updated successfully done",
      });
    }
  );

  export const deleteroduct = TryCatch(async (req, res, next) => {

      const product = await Product.findById(req.params.id);
    if (!product) return next(new ErrorHandler("Product not found ", 404));
    rm(product.photo, () => {
        console.log("product  photo deleted successfully");
      });

    await product.deleteOne();
    invalidateCache({ products: true ,admin :true,productId:String(product._id)});
    return res.status(201).json({
    success: true,
    message:"product deleted successfully thik"
  });
  });

export const searchAllProducts = TryCatch(async (req: Request<{}, {}, {}, SearchRequestQuery>, res, next) => {
    const { search, category, price, sort } = req.query
    const page = Number(req.query.page) || 1;
      const limit = Number(process.env.PRODUCT_PER_PAGE) || 8;
      const skip = limit * (page - 1);
      const baseQuery:BaseQuery={
       
      }
//       name: {
            
//         $regex: search,//it is for  serching the data in db using regex
//         $options: "i",//it is for  case insensitive
//     }, price: {
//   $lte:Number(price)//price less then  or equal to
//       },
//       category:category
//     , 
      if (search) {
          baseQuery.name = {
            
                    $regex: search,//it is for  serching the data in db using regex
                    $options: "i",//it is for  case insensitive
          }
              
      }
      if (category) baseQuery.category = category;
      if (price) {
          baseQuery.price={
              $lte:Number(price)//price less then  or equal to
                  }
    }
    const productPromise = Product.find(baseQuery )
    .sort((sort) && { price: sort === "asc" ? 1 : -1 })
    .limit(limit)
        .skip(skip);
    
    
    const [products, filterOnlyProducts] = await Promise.all([
        productPromise,
         Product.find(baseQuery)
])
    //two await will be unoptimal so we wil use Promeise all
    // const products = await Product.find({ baseQuery }).sort((sort) && { price: sort === "asc" ? 1 : -1 })
    //     .limit(limit)
    //     .skip(skip);
    
    // const filterOnlyProducts = await Product.find(baseQuery);

    const totalPage= Math.ceil(filterOnlyProducts.length / limit);

  return res.status(201).json({
    success: true,
      products,
    totalPage
  });
    //in url for query parameter ok ?category=iejwiefjioejfijeioj&&sort=asc 
});

