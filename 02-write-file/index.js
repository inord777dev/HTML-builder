const { stdin, stdout } = process;
const fs = require('fs');
const path = require('path');

stdout.write('Hi! Leave message: ')

let out;

stdin.on('data', data => {
  let message = data.toString();
  if (message.toUpperCase().trim() == 'EXIT') {
    process.exit();
  } else {
    if (!out) {
      out = fs.createWriteStream(path.join(__dirname, 'message.txt'));
    }
    out.write(message);
    stdout.write('Leave yet message or type \'exit\' (press Ctrl + C) for finish: ');
  }
});

process.on('exit', () => { stdout.write('Bay!') });

//Events SIGINT work in Win10
process.on("SIGINT", function () {
  stdout.write('\n');
  process.exit();
});