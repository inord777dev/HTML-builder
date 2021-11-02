const fs = require('fs');
const path = require('path');
const { readdir, mkdir, copyFile, access, rmdir } = require('fs/promises');

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
  });
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

async function createBundle(to, from) {
  try {
    await createEmptyFile(to);
    await bundleFrom(to, from);
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

async function copyDirectory(srcDir, destDir) {
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
  }
  catch (err) {
    console.log(err);
  }
}

async function build() {
  try {
    const root = path.join(__dirname, 'project-dist');
    if (await fileExists(root)) {
      await rmdir(root, { maxRetries: 10, recursive: true, retryDelay: 200 });
    } 

    await mkdir(root, { recursive: true });
    await createBundle(path.join(root, 'style.css'), path.join(__dirname, 'styles'));
    await copyDirectory(path.join(__dirname, 'assets'), path.join(root, 'assets'));

    const index = path.join(root, 'index.html');
    await createEmptyFile(index);

    let template = await readFile(path.join(__dirname, 'template.html'));
    const match = template.match(/{{.+}}/g);
    await Promise.all(match.map(async (x) => {
      let data = await readFile(path.join(__dirname, 'components', x.slice(2, x.length - 2) + '.html'));
      template = template.replace(new RegExp(x, 'g'), data);
    }));
    await appendFile(index, template);
    console.log('Build completed successfully.');
  }
  catch (err) {
    console.log(err);
  }
}

build();
