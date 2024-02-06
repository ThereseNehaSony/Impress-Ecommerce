const Product = require('../models/product');
const Category = require('../models/category');
// const { uploadSingle, uploadMultiple }  = require('../util/multer');
const User = require('../models/user')
const Coupon=require("../models/coupon")
const Order = require('../models/order')
const productOffer = require('../models/productoffer')
const categoryOffer = require('../models/categoryoffer')

const offerController = {
   
    getProductOfferPage:async (req,res)=>{
        try{
        const productOffers = await productOffer.find().populate('product');

        res.render('admin/productoffer',{productOffers})
        } catch {
            console.error('Error fetching product offers:', error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    },
    
    getCategoryOfferPage: async (req,res)=>{
     try{
      const categoryOffers = await categoryOffer.find().populate('category')

      
        res.render('admin/categoryoffer',{categoryOffers})
    } catch{
        console.error('error fetching offers', error);
        res.status(500).json({error: ' Internal Server Error'});
    }
    },
    getCategory:async(req,res)=>{
     
            try {
                const categories = await Category.find(); 
               
                res.json(categories);
            } catch (error) {
                console.error('Error fetching categories:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        },
    getProduct:async(req,res)=>{
     
            try {
                const products = await Product.find(); 
         
                res.json(products);
            } catch (error) {
                console.error('Error fetching products:', error);
                res.status(500).json({ error: 'Internal Server Error' });
            }
        },
        addProductOffer: async (req, res) => {
            const { product, discountPercentage, startDate, endDate } = req.body;
        console.log(product,"product")
            if (!product || isNaN(discountPercentage)) {
                return res.status(400).json({ success: false, error: 'Invalid request data' });
            }
        
            try {
                // Calculate discounted price based on discount percentage
                const productDetails = await Product.findById(product);
                if (!productDetails) {
                    return res.status(404).json({ success: false, error: 'Product not found' });
                }
        
                const originalPrice = productDetails.price;
                const productDiscountedPrice = originalPrice - (originalPrice * discountPercentage) / 100;
        
                // Create and save the product offer
                const newProductOffer = new productOffer({
                    product,
                    discountPercentage,
                    startDate,
                    endDate
                });
        
                const savedProductOffer = await newProductOffer.save();
        
                // Update the product with offer and discounted price details
                const updatedProduct = await Product.findOneAndUpdate(
                    { _id: product },
                    {
                        $set: {
                            productOffer: discountPercentage,
                            productDiscountedPrice,
                        }
                    },
                    { new: true }
                );
        
                if (!updatedProduct) {
                    return res.status(404).json({ success: false, error: 'Product not found' });
                }
        
                res.status(201).json({ success: true, productOffer: savedProductOffer, updatedProduct });
            } catch (error) {
                console.error('Error adding product offer:', error);
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        },
        
        addCategoryOffer: async (req, res) => {
            const { category, offerDetails, discountPercentage, startDate, endDate } = req.body;
        
            if (!category || !offerDetails || !discountPercentage || !startDate || !endDate) {
                return res.status(400).json({ success: false, error: 'Invalid request data' });
            }
        
            try {
                const newCategoryOffer = new categoryOffer({
                    category,
                    offerDetails,
                    discountPercentage,
                    startDate,
                    endDate,
                });
        
                const savedCategoryOffer = await newCategoryOffer.save();
        
                // Update Category model with the new offer discount percentage
                await Category.findOneAndUpdate(
                    { _id: category },
                    { $set: { offer: savedCategoryOffer.discountPercentage } },
                    { new: true }
                );
        
                // Fetch all products in the category
                const productsInCategory = await Product.find({ category: category });
        
                // Calculate and update discounted price for each product manually
                for (const product of productsInCategory) {
                    const originalPrice = product.price;
                    const discountedPrice = originalPrice - (originalPrice * discountPercentage) / 100;
        
                    // Update product with the new offer and discounted price
                    await Product.findByIdAndUpdate(
                        product._id,
                        {
                            $set: {
                                categoryOffer: savedCategoryOffer.discountPercentage,
                                categoryDiscountedPrice: discountedPrice,
                            },
                        },
                        { new: true }
                    );
                }
        
                res.status(201).json({ success: true, categoryOffer: savedCategoryOffer });
            } catch (error) {
                console.error('Error adding category offer:', error);
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        },
        
    getProductOffers: async(req,res)=>{
        const offerId = req.params.offerId;
        const offerDetails = await productOffer.find({_id:offerId})
        console.log(offerDetails,"offerdetails")
        if (!offerDetails) {
            return res.status(404).json({ error: 'Offer not found' });
        }
    
        res.json(offerDetails);
    },
    getCategoryOffers: async (req, res) => {
        const offerId = req.params.id;
    
        const offerDetails = await categoryOffer.find({_id:offerId})
        console.log(offerDetails,"offerdetails")
    
        if (!offerDetails) {
            return res.status(404).json({ error: 'Offer not found' });
        }
    
    
        res.json(offerDetails);
    },
    editCategoryOffer: async (req, res) => {
        const offerId = req.params.id;
        const updatedOfferDetails = req.body;
    
        try {
            // Update category offer
            const updatedOffer = await categoryOffer.findByIdAndUpdate(
                offerId,
                updatedOfferDetails,
                { new: true }
            );
    
            if (!updatedOffer) {
                return res.status(404).json({ success: false, message: 'Offer not found' });
            }
    
            // Fetch all products in the category
            const productsInCategory = await Product.find({ category: updatedOffer.category });
    
            // Calculate and update discounted price for each product manually
            for (const product of productsInCategory) {
                const originalPrice = product.price;
                const discountedPrice = originalPrice - (originalPrice * updatedOffer.discountPercentage) / 100;
    
                // Update product with the new offer and discounted price
                await Product.findByIdAndUpdate(
                    product._id,
                    {
                        $set: {
                            categoryOffer: updatedOffer.discountPercentage,
                           
                            categoryDiscountedPrice: discountedPrice,
                        },
                    },
                    { new: true }
                );
            }
    
            // Update Category
            const updatedCategory = await Category.findOneAndUpdate(
                { _id: updatedOffer.category },
                { $set: { offer: updatedOffer.discountPercentage } },
                { new: true }
            );
    
            res.json({ success: true, updatedOffer, updatedCategory });
        } catch (error) {
            console.error('Error updating category offer:', error);
            res.status(500).json({ success: false, error: 'Failed to update category offer' });
        }
    },
    
    
    editProductOffer: async (req, res) => {
        const offerId = req.params.id;
        console.log(offerId);
        const updatedOfferDetails = req.body;
        console.log(updatedOfferDetails, "details...................");
    
        try {
            // Update product offer
            const updatedOffer = await productOffer.findByIdAndUpdate(
                offerId,
                updatedOfferDetails,
                { new: true }
            );
    
            if (!updatedOffer) {
                return res.status(404).json({ success: false, message: 'Offer not found' });
            }
    
            // Calculate discounted price manually
            const originalProduct = await Product.findById(updatedOffer.product);
            if (!originalProduct) {
                return res.status(404).json({ success: false, message: 'Product not found' });
            }
    
            const originalPrice = originalProduct.price;
            const discountedPrice = originalPrice - (originalPrice * updatedOffer.discountPercentage) / 100;
           

            const updatedCategory = await Category.findOneAndUpdate({

            })
            // Update Product with the new offer and discounted price
            const updatedProduct = await Product.findOneAndUpdate(
                { _id: updatedOffer.product },
                {
                    $set: {
                        productOffer: updatedOffer.discountPercentage,
                        productDiscountedPrice: discountedPrice, 
                    }
                },
                { new: true }
            );
    
            console.log(updatedProduct, "updateddddddddddddddddddd");
    
            res.json({ success: true, updatedOffer, updatedProduct });
        } catch (error) {
            console.error('Error updating offer:', error);
            res.status(500).json({ success: false, error: 'Failed to update offer' });
        }
    },
    
    deleteCategoryOffer: async (req, res) => {
        const offerId = req.params.id;
    
        try {
            const deletedOffer = await categoryOffer.findByIdAndDelete(offerId);
    
            if (deletedOffer) {
                console.log('Offer deleted:', deletedOffer);
                
                // Fetch all products in the category
                const productsInCategory = await Product.find({ category: deletedOffer.category });
    
                // Update products to remove category offer and discounted price
                for (const product of productsInCategory) {
                    await Product.findByIdAndUpdate(
                        product._id,
                        {
                            $set: {
                                categoryOffer: null,
                                categoryDiscountedPrice: null,
                            },
                        },
                        { new: true }
                    );
                }
    
                // Update Category
                const updatedCategory = await Category.findOneAndUpdate(
                    { _id: deletedOffer.category },
                    { $set: { offer: null } },
                    { new: true }
                );
                console.log(updatedCategory);
    
                res.json({ success: true, coupon: deletedOffer, updatedCategory });
            } else {
                console.log('Offer not found with ID:', offerId);
                res.status(404).json({ success: false, message: 'Offer not found' });
            }
        } catch (error) {
            console.error('Error deleting offer:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },
    
    deleteProductOffer: async (req, res) => {
        const offerId = req.params.id;
    
        try {
           
            const deletedOffer = await productOffer.findByIdAndDelete(offerId);
    
            if (deletedOffer) {
                const updatedProduct = await Product.findOneAndUpdate(
                    { _id: deletedOffer.product }, 
                    { $set: { productOffer: null, productDiscountedPrice: null, } }, 
                    { new: true }
                );
                console.log(updatedProduct)
                console.log('Offer deleted:', deletedOffer);
                res.json({ success: true, coupon: deletedOffer });
            } else {
                console.log('Offer not found with ID:', offerId);
                res.status(404).json({ success: false, message: 'offer not found' });
            }
        } catch (error) {
            console.error('Error deleting offer:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },
    }

module.exports = offerController