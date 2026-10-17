import { Injectable } from '@nestjs/common';
import { v2 as cloudinary } from 'cloudinary';
import * as fs from 'fs';

@Injectable()
export class CloudinaryService {
  constructor() {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_CLOUD_NAME || 'demo',
      api_key: process.env.CLOUDINARY_API_KEY || '',
      api_secret: process.env.CLOUDINARY_API_SECRET || '',
    });
  }

  /**
   * Uploads an image file or local file path to Cloudinary and returns the secure Cloudinary URL.
   * If input is already a valid remote URL, it returns it directly.
   */
  async uploadImage(fileOrPath: Express.Multer.File | string, folder = 'cakeshop_items'): Promise<string> {
    if (!fileOrPath) {
      return '';
    }

    // 1. If it's already a full HTTP / HTTPS URL, store & return the URL directly
    if (typeof fileOrPath === 'string' && (fileOrPath.startsWith('http://') || fileOrPath.startsWith('https://'))) {
      return fileOrPath;
    }

    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    // Check if Cloudinary credentials are configured
    const isCloudinaryConfigured = Boolean(cloudName && apiKey && apiSecret && cloudName !== 'demo');

    let filePathToUpload = '';

    if (typeof fileOrPath === 'string') {
      filePathToUpload = fileOrPath;
    } else if (fileOrPath && fileOrPath.path) {
      filePathToUpload = fileOrPath.path;
    }

    if (isCloudinaryConfigured && filePathToUpload && fs.existsSync(filePathToUpload)) {
      try {
        const result = await cloudinary.uploader.upload(filePathToUpload, {
          folder: folder,
          resource_type: 'image',
        });
        return result.secure_url;
      } catch (err) {
        console.error('Cloudinary upload error:', err);
      }
    }

    // Fallback: If local file exists, serve standard URL path or return filename
    if (typeof fileOrPath !== 'string' && fileOrPath.filename) {
      return fileOrPath.filename;
    }
    if (typeof fileOrPath === 'string') {
      return fileOrPath;
    }

    return '';
  }
}
