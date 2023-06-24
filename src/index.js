import  process  from 'node:process';
import { dirname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import  os  from 'node:os';
import { readdir } from 'node:fs/promises';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

let username = '';
let pathToWorkingDirectory = dirname(process.argv[1]);

const welcomeUsername = () => {
  const arg = process.argv.slice(2);
  
  arg.forEach((item) => {
    if (item.includes('usernsme')) {
      username = item.slice(11);
    }
  });

  console.log(`Welcome to the File Manager, ${username}!\n`);
  console.log(`You are currently in ${pathToWorkingDirectory}`);
    
};

const isFile = (path, file) => {
 
  const pathToTargetFile = join(path, file);
  let answer = statSync(pathToTargetFile).isFile();

  return answer;
};

const list = async () => {
  const pathToFile = fileURLToPath(import.meta.url);
  pathToWorkingDirectory = dirname(pathToFile);

  try {
    let files = await readdir(pathToWorkingDirectory);

    let classifiedPathes = 
      files.map(file => {
          let answer = isFile(pathToWorkingDirectory, file);

          return answer ? [file, 'file'] : [file, 'folder'];
      });

    console.table(classifiedPathes);

  } catch (err) {
    console.error('FS operation failed');
  }
};

const parseInputToAction = async (chunk) => {
  let output = '';

  switch (chunk) {
    case 'ls\n':
      await list();
      break;

    case 'os --EOL\n':
      output = os.EOL;
      break;

    case 'os --cpus\n':
      output = JSON.stringify(os.cpus())+'\n';
      break;  
  
    default:
      output = 'Invalid input\n'; 
      break;
  }

  return output;
};





const run = async () => {
  //display text in the console After program work finished ctrl + c pressed  
  process.on('SIGINT', function () {
    console.log(`\nThank you for using File Manager, ${username}, goodbye!`);
    process.exit(0);
  });

  welcomeUsername();

  const inputTransformToOutput = new Transform({

   transform(chunk, _, callback) {
      
      parseInputToAction(chunk.toString()).then(output => this.push(output));
      
      // let output = 
      // this.push(output);
      callback();
    }
  });

  await pipeline(
    process.stdin,
    inputTransformToOutput,
    process.stdout
  );
}

await run();