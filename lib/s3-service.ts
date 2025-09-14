import { S3Client, PutObjectCommand, GetObjectCommand, DeleteObjectCommand, ListObjectsV2Command, ListObjectsV2CommandOutput } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

export class S3Service {
    private s3Client: S3Client;
    private bucketName: string;
    private region: string;

    constructor() {
        try {
            // Validate required environment variables
            if (!process.env.AWS_S3_BUCKET_NAME) {
                throw new Error('AWS_S3_BUCKET_NAME environment variable is required');
            }
            
            if (!process.env.AWS_ACCESS_KEY_ID || !process.env.AWS_SECRET_ACCESS_KEY) {
                throw new Error('AWS credentials not found. Please set AWS_ACCESS_KEY_ID and AWS_SECRET_ACCESS_KEY environment variables.');
            }
            
            this.bucketName = process.env.AWS_S3_BUCKET_NAME;
            this.region = process.env.AWS_REGION || 'us-east-1';
            
            this.s3Client = new S3Client({
                region: this.region,
                credentials: {
                    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
                    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
                },
            });
            
            console.log(`Initialized S3 client for bucket: ${this.bucketName} in region: ${this.region}`);
        } catch (error) {
            console.error('Error initializing S3Service:', error);
            throw error; // Re-throw to prevent usage of an improperly initialized service
        }
    }

    // Generate a pre-signed URL for uploading a file directly to S3
    async getPresignedUploadUrl(key: string, contentType: string, expiresIn = 3600): Promise<string> {
        const command = new PutObjectCommand({
            Bucket: this.bucketName,
            Key: key,
            ContentType: contentType,
        });

        return await getSignedUrl(this.s3Client, command, { expiresIn });
    }

    // Generate a pre-signed URL for downloading a file from S3
    async getPresignedDownloadUrl(key: string, expiresIn = 3600): Promise<string> {
        const command = new GetObjectCommand({
            Bucket: this.bucketName,
            Key: key,
        });

        return await getSignedUrl(this.s3Client, command, { expiresIn });
    }

    // Delete a file from S3
    async deleteFile(key: string): Promise<void> {
        try {
            const command = new DeleteObjectCommand({
                Bucket: this.bucketName,
                Key: key,
            });
            await this.s3Client.send(command);
        } catch (error) {
            console.error(`Error deleting file ${key} from S3:`, error);
            throw new Error(`Failed to delete file: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    
    // Upload a file directly to S3 from the backend
    async uploadFile(key: string, fileBuffer: Buffer, contentType: string): Promise<void> {
        try {
            console.log(`Uploading file to S3: ${key}, content type: ${contentType}`);
            
            const command = new PutObjectCommand({
                Bucket: this.bucketName,
                Key: key,
                Body: fileBuffer,
                ContentType: contentType,
            });
            
            await this.s3Client.send(command);
            console.log(`Successfully uploaded file to S3: ${key}`);
        } catch (error) {
            console.error(`Error uploading file ${key} to S3:`, error);
            throw new Error(`Failed to upload file to S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }

    // Generate the S3 key for a document
    generateS3Key(userId: string, docType: string, fileName: string): string {
        const timestamp = Date.now();
        const extension = fileName.split('.').pop();
        return `documents/${userId}/${docType}_${timestamp}.${extension}`;
    }

    // List all objects in the S3 bucket with optional prefix
    async listObjects(prefix?: string): Promise<{ Key: string, Size: number, LastModified?: Date }[]> {
        try {
            console.log(`Listing objects from bucket: ${this.bucketName} with prefix: ${prefix || 'none'}`);
            
            const command = new ListObjectsV2Command({
                Bucket: this.bucketName,
                Prefix: prefix,
                MaxKeys: 1000,
            });
            
            const response: ListObjectsV2CommandOutput = await this.s3Client.send(command);
            
            const objects = (response.Contents || []).map(item => ({
                Key: item.Key || '',
                Size: item.Size || 0,
                LastModified: item.LastModified,
            }));
            
            console.log(`Successfully listed ${objects.length} objects from S3`);
            return objects;
        } catch (error) {
            // Log detailed error information
            if (error instanceof Error) {
                console.error(`Error listing objects from S3 bucket ${this.bucketName}:`, {
                    message: error.message,
                    name: error.name,
                    stack: error.stack,
                });
            } else {
                console.error('Unknown error listing objects from S3:', error);
            }
            throw new Error(`Failed to list objects from S3: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    }
    
    // Delete multiple objects from S3 bucket
    async deleteObjects(keys: string[]): Promise<{ Deleted: string[], Errors: string[] }> {
        const deleted: string[] = [];
        const errors: string[] = [];
        
        // Delete from S3
        for (const key of keys) {
            try {
                const command = new DeleteObjectCommand({
                    Bucket: this.bucketName,
                    Key: key,
                });
                await this.s3Client.send(command);
                deleted.push(key);
            } catch (error) {
                console.error(`Error deleting object ${key} from S3:`, error);
                errors.push(key);
            }
        }
        
        return {
            Deleted: deleted,
            Errors: errors,
        };
    }
    
    // Get bucket information
    getBucketInfo(): { bucketName: string, region: string } {
        return {
            bucketName: this.bucketName,
            region: this.region,
        };
    }
}
