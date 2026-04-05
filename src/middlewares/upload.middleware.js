import multer from 'multer';
import sharp from 'sharp';
import path from 'path';
import fs from 'fs';
import { BadRequestError } from '../utils/errors.js';

const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new BadRequestError('Only image files are allowed'), false);
  }
};

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
});

export const processImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) return next();

  try {
    const uploadPath = path.join(process.cwd(), 'uploads', 'requests');
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }

    req.processedImages = [];

    const processingPromises = req.files.map(async (file, index) => {
      const fileName = `req-${req.params.id || 'new'}-${Date.now()}-${index}.webp`;
      const filePath = path.join(uploadPath, fileName);

      // Compress and convert to webp
      await sharp(file.buffer)
        .resize(1200, 1200, { fit: 'inside', withoutEnlargement: true })
        .webp({ quality: 70 })
        .toFile(filePath);

      req.processedImages.push(`/uploads/requests/${fileName}`);
    });

    await Promise.all(processingPromises);
    next();
  } catch (error) {
    next(error);
  }
};
