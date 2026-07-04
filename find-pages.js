import { readdirSync } from 'node:fs';

const ignore = ['node_modules', 'dist', 'public', 'src'];

function findIndexFiles(path) {
  return readdirSync(path, { withFileTypes: true }).reduce((files, next) => {
    if (next.isDirectory() && !ignore.includes(next.name)) {
      return [...files, ...findIndexFiles(`${next.parentPath}/${next.name}`)];
    }

    if (next.isFile() && next.name === 'index.html') {
      return [...files, next];
    }

    return files;
  }, []);
}

export default function (path = import.meta.dirname) {
  const indexes = findIndexFiles(path);

  return indexes.reduce((map, file) => {
    const key = file.parentPath.split('/').slice(-1)[0];
    const fullPath = `${file.parentPath}/${file.name}`;
    return {
      ...map,
      [key]: fullPath,
    };
  }, {});
}
