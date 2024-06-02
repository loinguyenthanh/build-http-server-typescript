import * as fs from 'fs';
import { promisify } from 'util';
import { gzip } from 'zlib';

const gzipPromise = promisify(gzip);


export const saveDataToFile = (pathFile: string, data: string) => {
  return new Promise<boolean>((resolve, reject) => {
    fs.open(pathFile, 'wx', (err, fd) => {
      console.log('open pathFile', pathFile, err);
      if (err) {
        return reject(err);
      }

      fs.write(fd, data, (err: NodeJS.ErrnoException | null, written: number, str: string) => {
        console.log('err', err, written);
        if (err) {
          return fs.close(fd, (closeErr) => {
            if (closeErr) {
              return reject(closeErr);
            }
            reject(err);
          });
        }

        fs.close(fd, (closeErr) => {
          if (closeErr) {
            return reject(closeErr);
          }
          resolve(true);
        });
      });
    });
  });
};


export const encodeToHex = (data: string): string => {
  const buffer = Buffer.from(data, 'utf-8');
  return buffer.toString('hex');
};

export const decodeFromHex = (hexData: string): string => {
  const buffer = Buffer.from(hexData, 'hex');
  return buffer.toString('utf-8');
};

export const encodeToGzip = async (data: string): Promise<Buffer> => {
  try {
    const buffer = Buffer.from(data, 'utf-8');
    const compressed = await gzipPromise(buffer);
    return compressed;
  } catch (error: any) {
    throw new Error(`Error encoding data to gzip: ${error.message}`);
  }
};