
const multer = require('multer');
const path = require('path');

const storageSingle = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const uploadSingle = multer({ storage: storageSingle }).single('image');



  

const storageMultiple = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'public/uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const uploadMultiple = multer({ storage: storageMultiple }).array('photos', 10); 

module.exports = { uploadSingle, uploadMultiple };


// const multer = require('multer');
// const path = require('path');

// const storageSingle = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });


// const fileFilterSingle = (req, file, cb) => {
  
//   if (file.mimetype.startsWith('image/')) {
//     cb(null, true); 
//   } else {
//     cb(new Error('File type not supported. Only image files are allowed.'), false); 
//   }
// };

// const uploadSingle = multer({
//   storage: storageSingle,
//   fileFilter: fileFilterSingle
// }).single('image');


// const storageMultiple = multer.diskStorage({
//   destination: function (req, file, cb) {
//     cb(null, 'public/uploads/');
//   },
//   filename: function (req, file, cb) {
//     cb(null, Date.now() + '-' + file.originalname);
//   }
// });

// const fileFilterMultiple = (req, file, cb) => {
//   const allowedMimeTypes = ['image/jpeg', 'image/png', 'application/pdf', /* Add other allowed MIME types here */];

//   if (allowedMimeTypes.includes(file.mimetype)) {
//     cb(null, true); 
//   } else {
//     cb(new Error('File type not supported. Only image files, PDFs, etc., are allowed.'), false);
//   }
// };

// const uploadMultiple = multer({
//   storage: storageMultiple,
//   fileFilter: fileFilterMultiple,
//   limits: { files: 4 } 
// }).array('photos', 4);

// module.exports = { uploadSingle, uploadMultiple };
