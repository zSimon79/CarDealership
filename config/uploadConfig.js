import { fileURLToPath } from 'url';
import path from 'path';

export function getUploadDir(relativePath) {
  const filename = fileURLToPath(import.meta.url);
  const dirname = path.dirname(filename);
  return path.join(dirname, relativePath);
}
