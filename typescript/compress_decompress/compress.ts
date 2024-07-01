
import zlib from "zlib";

export default function Compress(data:string):Promise<string> {
    return new Promise((resolve, reject) => {
        zlib.gzip(data, (err, buffer) => {
            if (err) {
              reject(err);
            } else {
              const base64String = buffer.toString('base64');
              resolve(base64String);
            }
        });
    });
}
  