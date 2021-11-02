const { stdout } = process;
const fs = require('fs')
const path = require('path');
const { readdir } = require('fs/promises');

async function getFiles() {
  try {
    const dirents = await readdir(path.join(__dirname, 'secret-folder'), { withFileTypes: true });
    dirents.forEach( dirent => {
      if (dirent.isFile()) {
        let stat = fs.stat(path.join(__dirname, 'secret-folder', dirent.name), (err, stats) => {
          stdout.write(`${dirent.name} - ${path.extname(dirent.name).slice(1)} - ${(stats.size / 1024)} kb\n`);
        });
      }
    })
  } catch (err) {
    console.error(err);
  }
}

getFiles();
