const path = require('path');
const fs = require('fs')
const { readdir, mkdir, copyFile, access } = require('fs/promises');

async function copyDirectory(srcDir, destDir, callback) {
  try {
    if (callback) {
      if (await fileExists(destDir)) {
        await removeDir(destDir);
      }
      await mkdir(destDir, { recursive: true });
    }
    const dirents = await readdir(srcDir, { withFileTypes: true });
    await Promise.all(dirents.map(async (dirent) => {
      const src = path.join(srcDir, dirent.name),
        desc = path.join(destDir, dirent.name);
      if (dirent.isDirectory()) {
        await copyDirectory(src, desc)
      } else {
        if (!await fileExists(destDir)) {
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

async function removeDir(dest) {
  return await new Promise((resolve, rejects) => {
    fs.rm(dest, { maxRetries: 10, recursive: true, retryDelay: 200 },
      err => {
        if (err) rejects(err);
        resolve();
      });
  })
}

copyDirectory(
  path.join(__dirname, 'files'),
  path.join(__dirname, 'files-copy'),
  () => { console.log('Copy completed successfully!') }
)