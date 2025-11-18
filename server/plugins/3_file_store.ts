import { Db } from 'mongodb'
import { defineNitroPlugin, useNitroApp } from '#imports'
import { GridFSBucket } from 'mongodb'

export enum FileStoreType {
    UserAvatar = "user_avatar",
    MediaPostImage = "media_post_image",
    LandingGalleryImage = "landing_gallery_image",
    Other = "other"
}

export class FileStores {
    private db: Db;

    constructor(db: Db) {
        this.db = db;

        Object.values(FileStoreType).forEach(type => {
            new GridFSBucket(this.db, { bucketName: type });
        });
    }

    public getFileStore(type: FileStoreType) {
        return new FileStore(this.db, type);
    }
}

export class FileStore {
    private bucket: GridFSBucket;

    constructor(db: Db, type: FileStoreType) {
        this.bucket = new GridFSBucket(db, { bucketName: type });
    }

    public async saveFileByUrl(url: string, filename: string): Promise<any> {
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error(`Failed to fetch file from URL: ${url}`);
        }

        const stream = response.body;
        if (!stream) {
            throw new Error(`No body found when fetching file from URL: ${url}`);
        }

        const existingFiles = await this.bucket.find({ filename }).toArray();
        if (existingFiles.length > 0) {
            const deletionPromises = existingFiles.map(async (file) => {
                try {
                    await this.bucket.delete(file._id);
                } catch (error) {
                    useNitroApp().logger.error('Error deleting existing file:', error);
                }
            });
            await Promise.all(deletionPromises);
        }

        const uploadStream = this.bucket.openUploadStream(filename);

        const logger = useNitroApp().logger;
        logger.info(`Starting to save file to GridFS from URL: ${url} with filename: ${filename}`);

        return new Promise((resolve, reject) => {
            stream.pipeTo(new WritableStream({
                write(chunk) {
                    logger.debug(`Writing chunk for file: ${filename}`);
                    uploadStream.write(chunk);
                },
                close() {
                    uploadStream.end();
                    logger.info(`Finished uploading file: ${filename}. GridFS id: ${uploadStream.id}`);
                    resolve(uploadStream.id);
                },
                abort(err) {
                    uploadStream.destroy(err);
                    logger.error(`Upload aborted for file: ${filename}`, err);
                    reject(err);
                }
            })).catch((err) => {
                logger.error(`Error during stream.pipeTo for file: ${filename}`, err);
                reject(err);
            });
        });
    }

    public async openDownloadStreamByName(filename: string): Promise<NodeJS.ReadableStream> {
        return this.bucket.openDownloadStreamByName(filename);
    }

    public async deleteFileByName(filename: string): Promise<void> {
        const existingFiles = await this.bucket.find({ filename }).toArray();
        if (existingFiles.length > 0) {
            const deletionPromises = existingFiles.map(async (file) => {
                try {
                    await this.bucket.delete(file._id);
                } catch (error) {
                    useNitroApp().logger.error('Error deleting file:', error);
                    throw error;
                }
            });
            await Promise.all(deletionPromises);
        }
    }

    public async saveFileFromBuffer(buffer: Buffer, filename: string): Promise<any> {
        const existingFiles = await this.bucket.find({ filename }).toArray();
        if (existingFiles.length > 0) {
            const deletionPromises = existingFiles.map(async (file) => {
                try {
                    await this.bucket.delete(file._id);
                } catch (error) {
                    useNitroApp().logger.error('Error deleting existing file:', error);
                }
            });
            await Promise.all(deletionPromises);
        }

        const uploadStream = this.bucket.openUploadStream(filename);
        const logger = useNitroApp().logger;
        logger.info(`Starting to save file to GridFS from buffer with filename: ${filename}`);

        return new Promise((resolve, reject) => {
            uploadStream.on('finish', () => {
                logger.info(`Finished uploading file: ${filename}. GridFS id: ${uploadStream.id}`);
                resolve(uploadStream.id);
            });
            uploadStream.on('error', (err) => {
                logger.error(`Error uploading file: ${filename}`, err);
                reject(err);
            });
            uploadStream.end(buffer);
        });
    }
}

export default defineNitroPlugin(async (nitroApp) => {
    nitroApp.logger.info('Waiting for database to be ready...')

    // Wait for MongoDB to be available (with timeout)
    const maxWaitTime = 10000; // 10 seconds
    const checkInterval = 50; // 50ms
    const startTime = Date.now();

    while (!nitroApp.db) {
        if (Date.now() - startTime > maxWaitTime) {
            nitroApp.logger.error('Timeout waiting for database to initialize')
            throw new Error('Database initialization timeout')
        }
        await new Promise(resolve => setTimeout(resolve, checkInterval));
    }

    nitroApp.logger.info('Connecting to file store...')
    try {
        nitroApp.fileStores = new FileStores(nitroApp.db)
        nitroApp.logger.info('File store connected successfully')
    } catch (error) {
        nitroApp.logger.error('Failed to connect to file store:', error)
        throw error
    }
})

declare module 'nitropack' {
    interface NitroApp {
        fileStores: FileStores
    }
}
