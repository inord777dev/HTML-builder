const { stdout } = process;
const fs = require('fs')
const path = require('path');
const { readdir } = require('fs/promises');

async function getFiles() {
  try {
    const dirents = await readdir(path.join(__dirname, 'secret-folder'), { withFileTypes: true });
    dirents.forEach(dirent => {
      if (dirent.isFile()) {
        let stat = fs.stat(path.join(__dirname, 'secret-folder', dirent.name), (err, stats) => {
          stdout.write(`${dirent.name} - ${path.extname(dirent.name).slice(1)} - ${formatSize(stats.size)}\n`);
        });
      }
    })
  } catch (err) {
    console.error(err);
  }
}

function formatSize(size) {
  const marker = 1024;
  const decimal = 3;
  const kilo = marker; 
  const mega = marker * marker; 
  const giga = marker * marker * marker;
  const tera = marker * marker * marker * marker;

  if (size < kilo) return size + " b";
  else if(size < mega) return (size / kilo).toFixed(decimal) + " kb";
  else if(size < giga) return (size / mega).toFixed(decimal) + " mb";
  else if(size < tera) return (size / giga).toFixed(decimal) + " gb";
  else return (size / tera).toFixed(decimal) + " tb";
}

getFiles();
