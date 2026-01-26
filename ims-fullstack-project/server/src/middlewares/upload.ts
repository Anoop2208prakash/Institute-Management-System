// server/src/middlewares/upload.ts
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { Request } from 'express';

// 1. Configure Cloudinary
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
    public_id: (req: Request, file: Express.Multer.File): string => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
      return `profile-${uniqueSuffix}`;
    },
  } as any,
});

// 3. File Filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed!') as any, false);
  }
};

// 4. Utility: Delete from Cloudinary
// This function extracts the public ID from the stored URL and destroys the image
export const deleteFromCloudinary = async (fileUrl: string | null | undefined): Promise<void> => {
  if (!fileUrl || !fileUrl.includes('cloudinary')) return;

  try {
    // URL format: https://res.cloudinary.com/[cloud_name]/image/upload/v[version]/[folder]/[public_id].jpg
    // We need "[folder]/[public_id]"
    const urlParts = fileUrl.split('/');
    const folder = 'school_management_profiles';
    const fileNameWithExtension = urlParts[urlParts.length - 1];
    const publicId = fileNameWithExtension.split('.')[0];
    
    const fullPublicPath = `${folder}/${publicId}`;
    
    await cloudinary.uploader.destroy(fullPublicPath);
    console.log(`Cloudinary Cleanup: Deleted ${fullPublicPath}`);
  } catch (error) {
    console.error("Cloudinary Deletion Error:", error);
  }
};

// 5. Export the middleware and the cloudinary instance
export const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }
});

export { cloudinary };