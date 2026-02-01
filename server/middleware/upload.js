import multer from 'multer';
import path from 'path';
import fs from 'fs';

// Create uploads directory if it doesn't exist
// IMPORTANT: Files are saved relative to where the server is started (process.cwd())
// Make sure to always start the server from the same directory (project root)
const uploadsDir = path.join(process.cwd(), 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

console.log('📁 Upload directory configured:', uploadsDir);


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    let uploadPath = uploadsDir;

    if (file.fieldname === 'resume') {
      uploadPath = path.join(uploadsDir, 'resumes');
    } else if (file.fieldname === 'logo' || file.fieldname === 'banner') {
      uploadPath = path.join(uploadsDir, 'company');
    } else if (file.fieldname === 'avatar') {
      uploadPath = path.join(uploadsDir, 'avatars');
    } else if (file.fieldname === 'featuredImage') {
      uploadPath = path.join(uploadsDir, 'blog'); // 👈 new folder for blog images
    }

    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  }
});


const fileFilter = (req, file, cb) => {
  //  console.log('Incoming file field:', file.fieldname);
  // Allow different file types based on field
  if (file.fieldname === 'resume') {
    const allowedTypes = /pdf|doc|docx/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = /application\/(pdf|msword|vnd\.openxmlformats-officedocument\.wordprocessingml\.document)/.test(file.mimetype);
    
    if (mimetype && extname) {
      // Add file size limit for resumes (5MB)
      if (file.size > 5 * 1024 * 1024) { // 5MB
        return cb(new Error('Resume file size cannot exceed 5MB'));
      }
      return cb(null, true);
    } else {
      cb(new Error('Only PDF, DOC, and DOCX files are allowed for resumes'));
    }
  } else if (['logo', 'banner', 'avatar', 'featuredImage'].includes(file.fieldname)) {
    const allowedTypes = /jpeg|jpg|png|gif/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only JPEG, JPG, PNG, and GIF files are allowed for images'));
    }
  } else {
    cb(new Error('Unknown file field'));
  }
};

export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: fileFilter
});


// const storage = multer.diskStorage({
//   destination: (req, file, cb) => {
//     let uploadPath = uploadsDir;
    
//     // Create subdirectories based on file type
//     if (file.fieldname === 'resume') {
//       uploadPath = path.join(uploadsDir, 'resumes');
//     } else if (file.fieldname === 'logo' || file.fieldname === 'banner') {
//       uploadPath = path.join(uploadsDir, 'company');
//     } else if (file.fieldname === 'avatar') {
//       uploadPath = path.join(uploadsDir, 'avatars');
//     }
    
//     if (!fs.existsSync(uploadPath)) {
//       fs.mkdirSync(uploadPath, { recursive: true });
//     }
    
//     cb(null, uploadPath);
//   },
//   filename: (req, file, cb) => {
//     const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//     cb(null, `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`);
//   }
// });
