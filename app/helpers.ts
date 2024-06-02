import * as fs from 'fs';

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
