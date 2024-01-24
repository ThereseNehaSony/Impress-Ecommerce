

const Cart = require('../models/cart');


const Coupon= require('../models/coupon')


const couponController = {

  validateCoupon: async (req, res) => {
    const { code } = req.query;
    const userId = req.session.userId;

    try {
       
        const coupon = await Coupon.findOne({ code });

        if (coupon) {
         
            const cart = await Cart.findOne({ userId }).populate('items.productId');

            let totalPrice = 0;

            if (cart && cart.items.length > 0) {
                for (const item of cart.items) {
                    
                    const productPrice = item.productId.price || 0;
                    totalPrice += productPrice * item.quantity;
                }
            }

         
            const finalPrice = Math.max(0, totalPrice - coupon.discountAmount);

       
            req.session.discount = coupon.discountAmount;

            res.json({
                valid: true,
                discountAmount: coupon.discountAmount,
                totalPrice,
                finalPrice,
            });
        } else {
          
            res.json({ valid: false });
        }
    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({ error: 'Internal server error' });
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
        newDiscountAmount,
        newStartDate,
        newExpirationDate,
        newMaxUsage
    } = req.body;

    try {
        // Find the coupon by ID and update all details
        const updatedCoupon = await Coupon.findByIdAndUpdate(couponId, {
            name: newName,
            code: newCouponCode,
            discountAmount: newDiscountAmount,
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