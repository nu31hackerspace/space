import { Db, Stream } from 'mongodb'
import { defineNitroPlugin } from '#imports'
import { GridFSBucket, GridFSBucketReadStream } from 'mongodb'

export enum FileStoreType {
    UserAvatar = "user_avatar",
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

        const uploadStream = this.bucket.openUploadStream(filename);

        return new Promise((resolve, reject) => {
            stream.pipeTo(new WritableStream({
                write(chunk) {
                    uploadStream.write(chunk);
                },
                close() {
                    uploadStream.end();
                    resolve(uploadStream.id);
                },
                abort(err) {
                    uploadStream.destroy(err);
                    reject(err);
                }
            })).catch(reject);
        });
    }

    public async openDownloadStreamByName(filename: string): Promise<NodeJS.ReadableStream> {
        return this.bucket.openDownloadStreamByName(filename);
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
