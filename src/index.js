const fs = require('fs');
const path = require('path');
const del = require('del');

const src = path.join(__dirname, process.argv[2] || 'DATA');
const dest = path.join(__dirname, process.argv[3] || 'SORTED');
const isDeleteNeeded = process.argv[4] || false;
const data = [];
let countDir = 0;

console.log('Исходная папка:', src);
console.log('Конечная папка:', dest);
console.log('Удалить исходную папку после сортировки :', isDeleteNeeded, '\n');

const isFile = (currentFile, cb) => {
  let isCurrentFile;
  fs.stat(currentFile, (err, stats) => {
    if (err) {
      console.error('!ОШИБКА', err);
      cb(err, null);
    } else {
      isCurrentFile = stats.isFile();
      cb(err, isCurrentFile);
    }
  });
};

function createFolder(path) {
  if (!fs.existsSync(path)) {
    fs.mkdirSync(path);
  }
}

function readFolder(src) {
  let len = 0;
  countDir++;
  fs.readdir(src, (err, files) => {
    if (err) {
      console.log(err);
      process.exit(1);
    }
    len = files.length;
    files.map((file) => {
      const currentFile = path.join(src, file);
      isFile(currentFile, (err, isCurrentFile) => {
        if (err) console.log(err);
        data.push({ file, isCurrentFile });
        len--;
        if (!isCurrentFile) {
          readFolder(path.join(src, file));
        } else {
          const rename = () => {
            fs.rename(
              path.join(src, file),
              path.join(dest, file[0].toUpperCase(), file),
              (err) => {
                if (err) console.error(err);
              }
            );
          };
          const copy = () => {
            fs.copyFile(
              path.join(src, file),
              path.join(dest, file[0].toUpperCase(), file),
              (err) => {
                if (err) console.error(err);
              }
            );
          };
          createFolder(path.join(dest, file[0].toUpperCase()));
          isDeleteNeeded ? rename() : copy();
        }
        if (len === 0) countDir--;
      });
    });
    if (len === 0) countDir--;
  });
}

createFolder(dest);
readFolder(src);

const interval = setInterval(() => {
  if (countDir === 0) {
    isDeleteNeeded ? del(src) : null;
    console.log('== Сортировка завершена! ==');
    clearInterval(interval);
  }
}, 1000);
