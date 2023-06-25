import  process  from 'node:process';
import  path  from 'node:path';
import { dirname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import  os  from 'node:os';
import { readdir } from 'node:fs/promises';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

let username = '';

// path to directory initialization from the very beginning
let PATH_TO_WORKING_DIRECTORY = dirname(process.argv[1]);

const welcomeUsername = () => {
  const arg = process.argv.slice(2);
  
  arg.forEach((item) => {
    if (item.includes('usernsme')) {
      username = item.slice(11);
    }
  });

  console.log(`Welcome to the File Manager, ${username}!\n`);
  console.log(`You are currently in ${PATH_TO_WORKING_DIRECTORY}`);
    
};

const compareName = (item1, item2) => item1.Name > item2.Name ? 1 : -1;

const compareType = (item1, item2) => {
  if (item1.Type === 'File' && item2.Type === 'Directory' ) { return 1 };
  if (item1.Type === 'Directory' && item2.Type === 'File') { return -1 };
  if (item1.Type === item2.Type ) { return 0 };
};

const list = async () => {

  try {
    let dirEnteties = await readdir(PATH_TO_WORKING_DIRECTORY, {withFileTypes: true});

    let classifiedPathes = 
      dirEnteties
      .map(entety => entety.isFile() ? { Name: entety.name, Type: 'File' } : { Name: entety.name, Type: 'Directory' })
        .sort(compareName)
        .sort(compareType);



      //   let answer = isFile(PATH_TO_WORKING_DIRECTORY, file);

      //     return answer ? [file, 'file'] : [file, 'directory'];
      // });

    console.table(classifiedPathes);

  } catch (err) {
    console.error('FS operation failed');
  }
};

const goUp = () => {
  PATH_TO_WORKING_DIRECTORY = path.dirname(PATH_TO_WORKING_DIRECTORY);
};

const goToDirectory = (chunk) => {
  let path_to_directory = chunk.slice(2).trim();
  
  // check if is it a directory?
  // absolute or relative?
};


const parseInputToAction = async (chunk) => {
  let output = '';

  switch (chunk) {
    case 'ls\n':
      await list();
      console.log(`You are currently in ${PATH_TO_WORKING_DIRECTORY}`);
      break;

    case 'up\n':
      goUp();
      console.log(`You are currently in ${PATH_TO_WORKING_DIRECTORY}`);
      break;

    case 'cd' + chunk.slice(2):
      goToDirectory(chunk);
      console.log(`You are currently in ${PATH_TO_WORKING_DIRECTORY}`);
      break;

    case 'os --EOL\n':
      output = JSON.stringify(os.EOL) + '\n';
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