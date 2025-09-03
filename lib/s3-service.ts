import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

export class S3Service {
    private s3Client: S3Client | null = null;
    private bucketName: string = '';
    private useLocalStorage: boolean = true;
    private uploadsDir: string = path.join(process.cwd(), 'uploads');

    constructor() {
        // Check if we're using local storage or S3
        if (process.env.S3_BUCKET_NAME && !process.env.USE_LOCAL_STORAGE) {
            this.useLocalStorage = false;
            this.bucketName = process.env.S3_BUCKET_NAME;

            this.s3Client = new S3Client({
                region: process.env.AWS_REGION || 'us-east-1',
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
                },
            });
        } else {
            // Ensure uploads directory exists
            if (!fs.existsSync(this.uploadsDir)) {
                fs.mkdirSync(this.uploadsDir, { recursive: true });
            }
            console.log('Using local storage for files in:', this.uploadsDir);
        }
    }

    // Generate a pre-signed URL for uploading a file directly to S3
    async getPresignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
        if (!this.useLocalStorage && this.s3Client) {
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                ContentType: contentType,
            });
            return getSignedUrl(this.s3Client, command, { expiresIn });
        } else {
            // For local storage, generate a token that can be used with a local API endpoint
            const token = this.generateToken(key, expiresIn);
            return `/api/documents/upload?token=${token}`;
        }
    }

    // Generate a pre-signed URL for downloading/viewing a file
    async getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
        if (!this.useLocalStorage && this.s3Client) {
            const command = new GetObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            return getSignedUrl(this.s3Client, command, { expiresIn });
        } else {
            // For local storage, generate a token that can be used with a local API endpoint
            const token = this.generateToken(key, expiresIn);
            return `/api/documents/file?token=${token}`;
        }
    }

    // Delete a file from S3 or local storage
    async deleteFile(key: string): Promise<void> {
        if (!this.useLocalStorage && this.s3Client) {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            await this.s3Client.send(command);
        } else {
            // Delete from local storage
            const filePath = this.getLocalFilePath(key);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }
    }

    // Generate the S3 key for a document
    generateS3Key(userId: string, docType: string, fileName: string): string {
        const timestamp = Date.now();
        const extension = fileName.split('.').pop();
        return `documents/${userId}/${docType}_${timestamp}.${extension}`;
    }

    // Save a file to local storage (used by the upload API endpoint)
    async saveLocalFile(key: string, fileBuffer: Buffer): Promise<void> {
        const filePath = this.getLocalFilePath(key);
        const dirPath = path.dirname(filePath);

        // Ensure directory exists
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }

        // Write file
        fs.writeFileSync(filePath, fileBuffer);
    }

    // Get a file from local storage (used by the file API endpoint)
    getLocalFile(key: string): Buffer | null {
        const filePath = this.getLocalFilePath(key);
        if (fs.existsSync(filePath)) {
            return fs.readFileSync(filePath);
        }
        return null;
    }

    // Verify a token is valid
    verifyToken(token: string): string | null {
        try {
            const [key, timestamp, signature] = token.split('.');
            const keyDecoded = Buffer.from(key, 'base64').toString();
            const timestampNum = parseInt(timestamp, 10);

            // Check if expired
            if (Date.now() > timestampNum) {
                return null;
            }

            // Verify signature
            const expectedSignature = this.generateSignature(keyDecoded, timestamp);
            if (signature !== expectedSignature) {
                return null;
            }

            return keyDecoded;
        } catch (error) {
            return null;
        }
    }

    // Private helper methods
    private getLocalFilePath(key: string): string {
        // Remove 'documents/' prefix if present since we're already in the uploads folder
        const relativePath = key.startsWith('documents/') ? key.substring(10) : key;
        return path.join(this.uploadsDir, relativePath);
    }

    private generateToken(key: string, expiresIn: number): string {
        const keyEncoded = Buffer.from(key).toString('base64');
        const expiryTimestamp = (Date.now() + expiresIn * 1000).toString();
        const signature = this.generateSignature(key, expiryTimestamp);
        return `${keyEncoded}.${expiryTimestamp}.${signature}`;
    }

    private generateSignature(key: string, timestamp: string): string {
        const secret = process.env.JWT_SECRET || 'local-dev-secret';
        return crypto
            .createHmac('sha256', secret)
            .update(`${key}.${timestamp}`)
            .digest('hex');
    }
}
