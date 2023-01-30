const e = require("express");
const express = require("express");
const productRouter = express.Router();
const auth = require ('../middlewares/auth');
const {Product} = require("../models/product");
const ratingSchema = require("../models/rating");


productRouter.get("/api/products",auth, async(req,res)=>{
    try {
        
        const products = await Product.find({category: req.query.category});
        res.json(products);
    
    } catch (error) {
        res.status(500).json({error: error.message});
    }
    } );

//product search
productRouter.get("/api/products/search/:name",auth, async(req,res)=>{
    try {
       
        const products = await Product.find({name: {$regex: req.params.name, $options: "i"},
        
    });
        res.json(products);
    
    } catch (error) {
        res.status(500).json({error: error.message});
    }
    } );

//create a post request route to rate the product.
productRouter.post('/api/rate-product', auth, async(req, res)=>{
    
    
    try {
        const {productId, rating}= req.body;
        
        
        let product = await Product.findById(productId);

        for (let index = 0; index < product.ratings.length; index++) {
            if (product.ratings[index].userId == req.user) {
                product.ratings.splice(index, 1);
                break;
            }
            
        }

        const ratingSchema = {userId: req.user, rating,};

        

        product.ratings.push(ratingSchema);
        product = await product.save();
       
        res.json(product);


        

    } catch (error) {
        res.status(500).json({error: e.message});
    }
})

productRouter.get('/api/deal-of-day', auth, async (req, res)=>{
   try {
 
    let products = await Product.find({});
    products= products.sort((product1, product2)=> {
        let product1Sum=0;
        let product2Sum=0;

       
        

        for (let index = 0; index < product1.ratings.length; index++) {
            product1Sum+= product1.ratings[index].rating;
            
        }

        for (let index = 0; index < product2.ratings.length; index++) {
            product2Sum+= product2.ratings[index].rating;
            
        }
       
        return product1Sum<product2Sum ? 1 : -1;

    });
    
    res.json(products[0]);
    
   } catch (e) {
    res.status(500).json({error: e.message});
   } 
})


module.exports = productRouter;