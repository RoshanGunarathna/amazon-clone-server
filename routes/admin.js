const express = require('express');
const adminRouter = express.Router();
const admin = require("../middlewares/admin");
const {Product} = require("../models/product");
const Order = require ("../models/order");

//Add product
adminRouter.post("/admin/add-product",admin, async (req, res)=>{
    try {
        const {name,description, quantity, images, category, price}= req.body;

        let product = new Product({
            name, 
            description,
            images,
            quantity,
            price,
            category,
        });

        product = await product.save();
        res.json(product);


    } catch (error) {
        res.status(500).json({error: error.message})
    }
});

//Get all your products

adminRouter.get("/admin/get-products",admin, async(req,res)=>{
try {
    const products = await Product.find({});
    res.json(products);

} catch (error) {
    res.status(500).json({error: error.message});
}
} );

//Delete the product
adminRouter.post("/admin/delete-product", admin, async(req, res)=>{
    try {
        const {id} = req.body;
        let product = await Product.findByIdAndDelete(id);
        res.json(product);
    } catch (error) {
        
    }
});

adminRouter.get('/admin/get-orders', admin, async (req, res)=>{
    try {

        const orders = await Order.find({});
        res.json(orders);
        
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

adminRouter.post("/admin/change-order-status", admin, async(req, res)=>{
    try {
        const {id, status} = req.body;
        let order = await Order.findById(id);
        order.status = status;
        order = await order.save();
        res.json(order);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

adminRouter.get('/admin/analytics', admin, async(req, res)=>{
    try {
        
        const orders = await Order.find({});
        let totalEarnings = 0;

        for (let index = 0; index < orders.length; index++) {
          
            for (let j = 0; j < orders[index].products.length; j++) {
                totalEarnings += orders[index].products[j].quantity * orders[index].products[j].product.price;
            }  
        }

        //CATEGORY WISE ORDER FETCHING
       let mobileEarnings =  await fetchCategoryWiseProduct('Mobiles');
       let essentialEarnings =  await fetchCategoryWiseProduct('Essentials');
       let applianceEarnings =  await fetchCategoryWiseProduct('Appliances');
       let bookEarnings =  await fetchCategoryWiseProduct('Books');
       let fashionEarnings =  await fetchCategoryWiseProduct('Fashion');

       let earnings = {totalEarnings, 
        mobileEarnings, 
        essentialEarnings, 
        applianceEarnings, 
        bookEarnings, 
        fashionEarnings, };

       
        res.json(earnings);

    } catch (error) {
        res.status(500).json({error: error.message});
    
    }
});

async function fetchCategoryWiseProduct(category){
    let earnings = 0;
    let categoryOrders = await Order.find({
        'products.product.category': category,
    });

    for (let index = 0; index < categoryOrders.length; index++) {
          
        for (let j = 0; j < categoryOrders[index].products.length; j++) {
            earnings += categoryOrders[index].products[j].quantity * categoryOrders[index].products[j].product.price;
        }  
    }
    return earnings;
}

module.exports = adminRouter;
