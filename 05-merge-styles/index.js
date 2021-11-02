const fs = require('fs');
const path = require('path');
const { readdir } = require('fs/promises');

async function createEmptyFile(fileName) {
  return await new Promise((resolve, rejects) => {
    fs.writeFile(fileName, '',
      err => {
        if (err) rejects(err);
        resolve(fileName);
      });
  })
}

async function bundleFrom(dest, dirName) {
  const dirents = await readdir(dirName, { withFileTypes: true });
  await Promise.all(dirents.map(async (dirent) => {
    const src = path.resolve(dirName, dirent.name);
    if (dirent.isDirectory()) {
      await bundleFrom(dest, src);
    } else if (path.extname(dirent.name) == '.css') {
      await appendFile(dest, await readFile(src));
    }
  }))
}

async function readFile(fileName) {
  return await new Promise((resolve, rejects) => {
    fs.readFile(fileName, 'utf-8',
      (err, data) => {
        if (err) rejects(err);
        resolve(data);
      });
  })
}

async function appendFile(fileName, data) {
  return await new Promise((resolve, rejects) => {
    fs.appendFile(fileName, data,
      err => {
        if (err) rejects(err);
        resolve();
      }
    );
  });
}

async function createBundle() {
  try {
    const fileName = path.join(__dirname, 'project-dist', 'bundle.css');
    await createEmptyFile(fileName);
    await bundleFrom(fileName, path.join(__dirname, 'styles'));
    console.log('File bundle.css created successfully.');
  }
  catch (err) {
    console.log(err);
  }
}

createBundle();
