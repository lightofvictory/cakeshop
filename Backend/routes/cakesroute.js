import express from 'express';
import { addCakeItems, cakelist, removecake } from '../controllers/CakesController.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';

const cakeRouter = express.Router();

// Ensure 'uploads/' folder exists
const uploadDir = "uploads/";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

// Multer storage config
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir); // Save files in uploads/
  },
  filename: function (req, file, cb) {
    const uniqueName = `${Date.now()}_${file.originalname}`;
    cb(null, uniqueName);
  },
});

// File filter (optional, but good for image validation)
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.jpg', '.jpeg', '.png', '.gif'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!'), false);
  }
};

const upload = multer({ storage, fileFilter });

// ROUTES
cakeRouter.post('/addcake', upload.single('image'), addCakeItems); // FormData image upload
cakeRouter.get('/list', cakelist);
cakeRouter.post('/remove', removecake);

export default cakeRouter;
