const express = require('express');
const userRouter = express.Router();
const auth = require('../middlewares/auth');
const Order = require('../models/order');
const { Product } = require('../models/product');
const User = require('../models/user');

userRouter.post("/api/add-to-cart",auth, async (req, res)=>{
    try {
        
        const {productId} = req.body;
        const product = await Product.findById(productId);
        let user = await User.findById(req.user);
       

        if (user.cart.length ==0 ) {
            user.cart.push({product, quantity:1});
        } else {
            let isProductFound = false;

            for (let index = 0; index < user.cart.length; index++) {
               
                if (user.cart[index].product._id.equals(product._id)) {
                    isProductFound = true;
                }
            }

            if (isProductFound) {
                
                let producttt = user.cart.find((productt)=>
                     productt.product._id.equals(product._id)
                );
                producttt.quantity += 1;
            } else {
                user.cart.push({product, quantity:1});
            }
        }
       

        user = await user.save();
        res.json(user);

    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

//remove product from cart
userRouter.delete("/api/remove-from-cart/:productId",auth, async (req, res)=>{
    try {
        const {productId} = req.params;
        const product = await Product.findById(productId);
        let user = await User.findById(req.user);
            for (let index = 0; index < user.cart.length; index++) {
               
                if (user.cart[index].product._id.equals(product._id)) {
                    if(user.cart[index].quantity ==1){
                        user.cart.splice(index,1);
                    } else {
                    user.cart[index].quantity -=1;
                    }
                }
        }
        user = await user.save();
        res.json(user);

    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

//save user address
userRouter.post("/api/save-user-address",auth, async (req, res)=>{
    try {
        const {address} = req.body;
        let user = await User.findById(req.user);

        user.address = address;
        user = await user.save();
        res.json(user);


    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

//order product
userRouter.post("/api/order",auth, async (req, res)=>{
    try {
        const {cart, totalPrice, address } = req.body;
        let products =[];

        for (let index = 0; index < cart.length; index++) {
         let product = await Product.findById(cart[index].product._id); 
            if (product.quantity>= cart[index].quantity) {
                product.quantity -= cart[index].quantity;
                products.push({product, quantity: cart[index].quantity});
                await product.save();
            } else {
                return res.status(400).json({msg: `${product.name} is out of stock!`});
            }   
        }

        let user = await User.findById(req.user);
        user.cart = [];
        user = await user.save();

        let order = new Order({
          products,
          totalPrice,
          address,
          userId: req.user,
          orderedAt: new Date().getTime(),
        });
        order = await order.save();
        res.json(user);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

userRouter.get('/api/orders/me', auth, async(req, res)=>{
    try {
        const orders = await Order.find({userId: req.user});
        res.json(orders);
    } catch (error) {
        res.status(500).json({error: error.message});
    }
});

module.exports = userRouter;