const Product = require('../models/product');
const Category = require('../models/category');
const { uploadSingle, uploadMultiple }  = require('../util/multer');
const User = require('../models/user');

const productController = {
    adminProductPage:(req,res)=>{
        res.render('admin/product', { title: "Product List" });
      },
      displayProductList: async (req, res) => {
        try {
          const page = parseInt(req.query.page) || 1;
          const perPage = 10;
      
          const products = await Product.find({})
            .populate('category', 'name')
            .skip((page - 1) * perPage)
            .limit(perPage);
      
          const totalProducts = await Product.countDocuments();
      
          res.render('admin/product', {
            products,
            current: page,
            pages: Math.ceil(totalProducts / perPage),
          });
        } catch (error) {
          console.error('Error displaying product list:', error);
          res.status(500).send('Error displaying product list');
        }
      },
      
      adminAddProductPage: async (req, res) => {
        try {
          const categories = await Category.find({}, 'name'); 
          
          res.render('admin/addproduct', { title: 'Product Add', categories });
        } catch (error) {
          console.error('Error fetching categories:', error);
          res.status(500).send('Error fetching categories');
        }
      },
      addProduct :async (req, res) => {
        try {
          console.log('Received form data:', req.body);
          console.log(req.files,"......................");
         // Multer middleware
          uploadMultiple(req, res, async (err) => {
            if (err) {
              console.error('Multer error:', err);
              return res.status(400).send('Error uploading file');
            }
      
            if (!req.files || req.files.length === 0) {
              return res.render('admin/addproduct', { errorMessage: 'No files uploaded' });
            }
      
            const photos = req.files || [];
        
         
            const { name, category,  material, washcare, price,color,size,stock, specification } = req.body;
            const isNewArrival = req.body.isNewArrival === 'on'; 
            console.log('..........',req.body)

          
           
            const newProduct = new Product({
              name,
              category,
             color,
             size,
             stock,
              material,
              price,
              washcare,
              specification,
              photos: photos.map(photo => photo.filename),
              isNewArrival,
            });
      
            await newProduct.save();
          console.log("new product",newProduct)
          
            res.redirect('/admin/product');
          }); 
        } catch (error) {
          console.error('Error adding product:', error);
          res.status(500).send('Error adding product');
        }
      },
      
      adminSaveProduct:(req, res) => {
        res.redirect('admin/product');
      },
    
      toggleProductStatus: async (req, res) => {
        const { productId } = req.params;
        try {
            const product = await Product.findById(productId);
            if (!product) {
                return res.status(404).send('Product not found');
            }
            
            
            product.isBlocked = !product.isBlocked;
            await product.save();
    
           
            res.redirect('/admin/product');
        } catch (err) {
            res.status(500).send('Error toggling the product status');
        }
    },
    adminEditProductPage: async (req, res) => {
      try {
        const productId = req.params.id;
        const product = await Product.findById(productId).populate('category');
        const categories = await Category.find(); 
    
        res.render('admin/editproduct', { product, categories }); 
      } catch (error) {
        console.error('Error fetching product for editing:', error);
        res.status(500).send('Error fetching product for editing');
      }
    },
    
      adminUpdateProduct: async (req, res) => {
        try {
          const productId = req.params.id;
          const product = await Product.findById(productId);
          const category = await Category.findById(product.category);

          if (!category) {
            return res.status(404).send('Category not found');
          }

          uploadMultiple(req, res, async (err) => {
            try {
              if (err) {
                console.error('Multer error:', err);
                return res.status(400).send('Error uploading files');
              }
           
            const updateFields = {
              name: req.body.name,
              category: category._id,
              color: req.body.color,
              price: req.body.price,
              size: req.body.size,
              material: req.body.material,
              washcare: req.body.washcare,
              stock: req.body.stock,
              specification: req.body.specification
            };
            if (req.body.isNewArrival === 'on') {
              updateFields.isNewArrival = true;
            } else {
              updateFields.isNewArrival = false;
            }
            if (req.files && req.files.length > 0) {
           
            
      
        
              const existingProduct = await Product.findById(productId);
            let existingPhotos = existingProduct.photos || [];
      
              const newPhotos = req.files.map(file => file.filename);

              if (req.body.deletedPhotos && req.body.deletedPhotos.length > 0) {
                const deletedPhotos = req.body.deletedPhotos; 
                
                
                existingPhotos = existingPhotos.filter(photo => !deletedPhotos.includes(photo));
              }
              
           
              const updatedPhotos = [...existingPhotos, ...newPhotos];
              updateFields.photos = updatedPhotos; 
            }
      
           
            await Product.findByIdAndUpdate(productId, updateFields);
      
          
            res.redirect('/admin/product');
          } catch (error) {
            console.error('Error updating product:', error);
            res.status(500).send('Error updating product');
          }
          });
        } catch (error) {
          console.error('Error updating product:', error);
          res.status(500).send('Error updating product');
        }
      },
      displayOutOfStockProductList: async (req, res) => {
        try {
          const page = parseInt(req.query.page) || 1;
          const perPage = 10;
      
          const products = await Product.find({stock:0})
            .populate('category', 'name')
            .skip((page - 1) * perPage)
            .limit(perPage);
      
          const totalProducts = await Product.countDocuments();
      
          res.render('admin/outofstock', {
            products,
            current: page,
            pages: Math.ceil(totalProducts / perPage),
          });
        } catch (error) {
          console.error('Error displaying product list:', error);
          res.status(500).send('Error displaying product list');
        }
      },
      

}
module.exports=productController