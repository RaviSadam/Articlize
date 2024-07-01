import zlib from "zlib";

export default function Decompress(data:string):Promise<string> {
  return new Promise((resolve, reject) => {
    const buffer = Buffer.from(data, 'base64');
    zlib.gunzip(buffer, (err, buffer) => {
      if (err) {
        return reject(err);
      }
      resolve(buffer.toString());
    });
  });
}