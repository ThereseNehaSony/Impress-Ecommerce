const Product = require('../models/product');
const Category = require('../models/category');
const { uploadSingle, uploadMultiple }  = require('../util/multer');
const User = require('../models/user');


const categoryController = {

    adminCategoryPage:(req,res)=>{
        res.render('admin/category', { title: "Category List " });
      },
    displayCategoryList: async (req, res) => {
        try {
          const categories = await Category.find({}); 
          res.render('admin/category', { categories }); 
        } catch (error) {
          console.error('Error displaying category list:', error);
          res.status(500).send('Error displaying category list');
        }
      },
    adminAddCategoryPage:(req,res)=>{
        const errorMessage = null;
        res.render('admin/addcategory', { title: "Category Add", errorMessage:errorMessage });
      },
      addCategory: async (req, res) => {
        try {
            uploadSingle(req, res, async (err) => {
                if (err) {
                    console.error('Multer error:', err);
                    return res.status(400).send('Error uploading file');
                }
      
                const { name } = req.body;
                const image = req.file ? req.file.filename : null;
      
              const existingCategory= await Category.findOne({ name: { $regex: new RegExp(`^${name}$`, 'i') } });
              if(existingCategory){
                const errorMessage = 'Category with this name already exists';
              return res.render('admin/addcategory', { errorMessage });
              }
                const newCategory = new Category({ name, image });
      
                await newCategory.save();
      
                res.redirect('/admin/category'); 
            });
        } catch (error) {
            console.error('Error adding category:', error);
            res.status(500).send('Error adding category');
        }
      },
      
      
        toggleCategoryStatus: async (req, res) => {
          const { categoryId } = req.params;
          try {
              const category = await Category.findById(categoryId);
              if (!category) {
                  return res.status(404).send('Category not found');
              }
      
              category.isBlocked = !category.isBlocked;
              await category.save();
      
              res.redirect('/admin/category'); 
          } catch (err) {
              res.status(500).send('Error toggling the category status');
          }
      },
    adminSaveCategory:(req, res) => {
        res.redirect('admin/category');
      },    
      
    adminEditCategoryPage: async (req, res) => {
        try {
          const categoryId = req.params.id;
          const category = await Category.findById(categoryId);
          res.render('admin/editcategory', { category });
        } catch (error) {
          console.error('Error fetching category for editing:', error);
          res.status(500).send('Error fetching category for editing');
        }
      },
    
    adminUpdateCategory : async (req, res) => {
    try {
      const categoryId = req.params.id;
  
      uploadSingle(req, res, async (err) => {
        if (err) {
          console.error('Multer error:', err);
          return res.status(400).send('Error uploading file');
        }
  
        const category = await Category.findById(categoryId);
  
        if (!category) {
          return res.status(404).send('Category not found');
        }
  
        console.log('Old Image:', category.image); 
  
        if (req.body.name) {
          category.name = req.body.name;
        }
  
        if (req.file) {
          console.log('New Image:', req.file.filename); 
          category.image = req.file.filename; 
        }else{
          console.log('No new image uploaded.');
        
        }
  
        await category.save(); 
  
        res.redirect('/admin/category'); 
      });
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(500).send('Error updating category');
    }
  },
    

}
module.exports=categoryController