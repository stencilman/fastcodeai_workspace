import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;

    constructor() {
        if (!process.env.S3_BUCKET_NAME) {
            throw new Error('S3_BUCKET_NAME environment variable is not set');
        }

        this.bucketName = process.env.S3_BUCKET_NAME;

        this.s3Client = new S3Client({
            region: process.env.AWS_REGION || 'us-east-1',
            credentials: {
                accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
                secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
            },
        });
    }

    // Generate a pre-signed URL for uploading a file directly to S3
    async getPresignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: contentType,
        });

        return getSignedUrl(this.s3Client, command, { expiresIn });
    }

    // Generate a pre-signed URL for downloading/viewing a file
    async getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        return getSignedUrl(this.s3Client, command, { expiresIn });
    }

    // Delete a file from S3
    async deleteFile(key: string): Promise<void> {
        const command = new DeleteObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        await this.s3Client.send(command);
    }

    // Generate the S3 key for a document
    generateS3Key(userId: string, docType: string, fileName: string): string {
        const timestamp = Date.now();
        const extension = fileName.split('.').pop();
        return `documents/${userId}/${docType}_${timestamp}.${extension}`;
    }
}
