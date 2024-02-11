const Banner = require('../models/banner')
const { uploadSingle }  = require('../util/multer');
const Category = require('../models/category');

const bannerController = {

   getBannerPage:async(req,res)=>{
     const banners = await Banner.find()
     const categories = await Category.find()
       res.render('admin/banner',{ banners, categories })

    },

    addBanner: async (req, res) => {
        uploadSingle(req, res, async (err) => {
            if (err) {
                console.error('Multer error:', err);
                return res.status(400).send('Error uploading file');
            }
    
            try {
                if (req.file) {
       
                    const { category } = req.body;
                console.log(req.body,"reqqqqqqqqqqqq")
                    
                const categoryObject = await Category.findOne({ _id: category });
                console.log(categoryObject,"catobj")
                    if (!categoryObject) {
                        
                        return res.status(400).json({ success: false, message: 'Category not found' });
                    }
    
                const newBanner = new Banner({
                        image: req.file.filename,
                     
                        category: categoryObject._id,
                    });
                 console.log(newBanner,"new one............")
                    const savedBanner = await newBanner.save();
                    console.log(savedBanner, "saved banner");
                    res.json({ success: true, imageUrl: savedBanner.imageUrl });
                } else {
                    res.json({ success: false, message: 'No file provided' });
                }
            } catch (error) {
                console.error('Error saving to MongoDB:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
        });
    },
    
    deleteBanner: async (req, res) => {
        const bannerId = req.params.bannerId;
        console.log(bannerId,"bannerid")
        try {
            
            const deletedBanner = await Banner.findByIdAndDelete(bannerId);
            console.log(deletedBanner)
            if (deletedBanner) {
                res.json({ success: true, message: 'Banner deleted successfully' });
            } else {
                res.json({ success: false, message: 'Banner not found' });
            }
           } catch (error) {
            console.error('Error deleting banner:', error);
            res.status(500).json({ success: false, message: 'Internal server error' });
        }
    },
    

}

module.exports = bannerController