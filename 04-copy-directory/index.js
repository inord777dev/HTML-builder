const path = require('path');
const fs = require('fs')
const { readdir, mkdir, copyFile, access } = require('fs/promises');

async function copyDirectory(srcDir, destDir, callback) {
  try {
    const dirents = await readdir(srcDir, { withFileTypes: true });
    await Promise.all(dirents.map(async (dirent) => {
      const src = path.resolve(srcDir, dirent.name),
        desc = path.resolve(destDir, dirent.name);
      if (dirent.isDirectory()) {
        await copyDirectory(src, desc)
      } else {
        let isExists = await fileExists(destDir);
        if (!isExists) {
          await mkdir(destDir, { recursive: true });
        }
        await copyFile(src, desc);
      }
    }));
    if (callback) {
      callback();
    }
  }
  catch (err) {
    console.log(err);
  }
}

async function fileExists(file) {
  return access(file, fs.constants.F_OK)
    .then(() => true)
    .catch(() => false)
}

copyDirectory(
  path.join(__dirname, 'files'),
  path.join(__dirname, 'files-copy'),
  () => { console.log('Copy completed successfully!') }
)

