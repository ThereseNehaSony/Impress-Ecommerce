const Cart = require('../models/cart');
const Coupon= require('../models/coupon')



    const couponController = {

        getCouponPage: async (req,res) => {
            const coupon = await Coupon.find()
            res.render('admin/coupon',{coupon})
          },

        addCoupon: async (req, res) => {
            try {
                const { name,code, discountPercentage,startDate, expirationDate, maxUsage } = req.body;
                console.log('Received data:', req.body);
                const existingCoupon = await Coupon.findOne({ code });
          
                if (existingCoupon) {
                   
                    return res.status(400).json({ message: 'Coupon with this code already exists.' });
                }
          
                const newCoupon = new Coupon({
                    name,
                    code,
                    discountPercentage,
                    startDate,
                    expirationDate,
                 
                });
          
                await newCoupon.save();
          
                res.status(201).json({ message: 'Coupon added successfully' });
            } catch (error) {
                console.error(error);
          
                
                if (error.name === 'MongoServerError' && error.code === 11000) {
                    return res.status(400).json({ message: 'Coupon with this name already exists.' });
                }
          
                res.status(500).json({ message: 'Internal Server Error' });
            }
          },
            
        validateCoupon: async (req, res) => {
            const { code } = req.body;
            console.log(code, "code...............");
            const userId = req.session.userId;
    
            try {
                const coupon = await Coupon.findOne({ code });
                console.log(coupon, "coupon..................");
    
                if (coupon) {
                    const isCouponUsedByUser = coupon.users.includes(userId);
    
                    if (isCouponUsedByUser) {
                        return res.json({ success: false, error: 'Coupon already used by the user' });
                    }
    
                    const cart = await Cart.findOne({ userId }).populate('items.productId');
    
                    const maxDiscountAmount = 200;
                    const minimumPurchaseLimit = 500;
    
                    let totalPrice = 0;
    
                    if (cart && cart.items.length > 0) {
                        for (const item of cart.items) {
                            const productPrice = item.productId.productDiscountedPrice || item.productId.categoryDiscountedPrice || item.productId.price || 0;
                            totalPrice += productPrice * item.quantity;
                        }
                    }
    
                    if (totalPrice < minimumPurchaseLimit) {
                        return res.json({ success: false, error: `Minimum purchase limit not reached. You need to spend ₹${minimumPurchaseLimit} to apply this coupon.` });
                    }
    
                    let discountPercentage = coupon && typeof coupon.discountPercentage === 'number' ? coupon.discountPercentage : 0;
    
                    discountPercentage = Math.min(discountPercentage, (maxDiscountAmount / totalPrice) * 100);
    
                    const discountAmount = Math.min((totalPrice * discountPercentage) / 100, maxDiscountAmount);
                    const discountedTotalPrice = Math.max(0, totalPrice - discountAmount);
    
                    console.log(discountedTotalPrice, "final price...............");
    
                    req.session.discount = discountAmount;
                    req.session.couponCode = code;
                    res.json({
                        success: true,
                        discountAmount,
                        totalPrice,
                        discountedTotalPrice,
                    });
                } else {
                    res.json({ success: false, error: 'Invalid coupon code' });
                }
            } catch (error) {
                console.error('Error validating coupon:', error);
                res.status(500).json({ success: false, error: 'Internal server error' });
            }
        },
    
    
     editCoupon:async (req, res) => {
        const couponId = req.params.id;
         console.log(couponId, "couponid............");


         Coupon.findById(couponId, (err, coupon) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: 'Internal Server Error' });
        } else if (!coupon) {
            console.error('Coupon not found'); 
            res.status(404).json({ error: 'Coupon not found' });
        } else {
            console.log('Coupon found:', coupon); 
            res.json(coupon);
        }
    });
   },

    postEditCoupon:async (req, res) => {
        const couponId = req.params.id;
        const {
        newName,
        newCouponCode,
        newDiscountPercentage,
        newStartDate,
        newExpirationDate,
        newMaxUsage
    } = req.body;

    try {
       
        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, {
            name: newName,
            code: newCouponCode,
            discountPercentage: newDiscountPercentage,
            startDate: newStartDate,
            expirationDate: newExpirationDate,
            maxUsage: newMaxUsage
        }, { new: true });

        if (updatedCoupon) {
            console.log('Coupon updated:', updatedCoupon);
            res.json({ success: true, coupon: updatedCoupon });
        } else {
            console.log('Coupon not found with ID:', couponId);
            res.status(404).json({ success: false, message: 'Coupon not found' });
        }
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
  },

  deleteCoupon: async (req, res) => {
    const couponId = req.params.id;

    try {
       
        const deletedCoupon = await Coupon.findByIdAndDelete(couponId);

        if (deletedCoupon) {
            console.log('Coupon deleted:', deletedCoupon);
            res.json({ success: true, coupon: deletedCoupon });
        } else {
            console.log('Coupon not found with ID:', couponId);
            res.status(404).json({ success: false, message: 'Coupon not found' });
        }
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
},

}

module.exports = couponController