// server/src/middlewares/upload.ts
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request } from 'express'; // Required to fix implicit 'any' type

// 1. Configure Cloudinary using credentials from your updated .env file
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// 2. Configure Cloudinary Storage Engine
const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'school_management_profiles',
    allowed_formats: ['jpg', 'png', 'jpeg', 'webp'],
    transformation: [{ width: 500, height: 500, crop: 'limit' }],
    // FIXED: Explicit types resolve the "Parameter 'req' implicitly has an 'any' type" error
    public_id: (req: Request, file: Express.Multer.File): string => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      // Files will be named profile-[timestamp]-[random].ext in Cloudinary
      return `profile-${uniqueSuffix}`;
    },
  } as any,
});

// 3. File Filter (Redundant check for extra security)
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    // Rejects non-image files before they reach Cloudinary
    cb(new Error('Only image files are allowed!') as any, false);
  }
};

// 4. Export the middleware
export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB limit to prevent server timeouts
});