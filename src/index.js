import  process  from 'node:process';
import  path  from 'node:path';
import { dirname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import  os  from 'node:os';
import { readdir, readFile, writeFile, rm } from 'node:fs/promises';
import { statSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

let username = '';

// path to directory initialization from the very beginning
let PATH_TO_WORKING_DIRECTORY = dirname(process.argv[1]);




const welcomeUsername = () => {
  const arg = process.argv.slice(2);
  
  arg.forEach((item) => {
    if (item.includes('username')) {
      username = item.slice(11);
    }
  });

  console.log(`Welcome to the File Manager, ${username}!\n`);
  console.log(`You are currently in ${PATH_TO_WORKING_DIRECTORY}`);
    
};




const compareName = (item1, item2) => item1.Name.toLowerCase() > item2.Name.toLowerCase() ? 1 : -1;

const compareType = (item1, item2) => {
  if (item1.Type === 'file' && item2.Type === 'directory' ) { return 1 };
  if (item1.Type === 'directory' && item2.Type === 'file') { return -1 };
  if (item1.Type === item2.Type ) { return 0 };
};

const list = async () => {

  try {
    let dirEnteties = await readdir(PATH_TO_WORKING_DIRECTORY, {withFileTypes: true});

    let sortedPathes = 
      dirEnteties
      .map(entety => entety.isFile() ? { Name: entety.name, Type: 'file' } : { Name: entety.name, Type: 'directory' })
      .sort(compareName)
      .sort(compareType);

    console.table(sortedPathes);

  } catch (err) {
    console.error(err);
  }
};

const goUp = () => {
  PATH_TO_WORKING_DIRECTORY = path.dirname(PATH_TO_WORKING_DIRECTORY);
  process.chdir(PATH_TO_WORKING_DIRECTORY);
};

const goToDirectory = (chunk) => {
  let path_to_directory = chunk.slice(2).trim();
  
  PATH_TO_WORKING_DIRECTORY = path.resolve(PATH_TO_WORKING_DIRECTORY, path_to_directory);
  process.chdir(PATH_TO_WORKING_DIRECTORY);

};



const printFileToConsole = async (chunk) => {
  const path_to_file = chunk.slice(3).trim();
  const absolute_path_to_file = path.resolve(PATH_TO_WORKING_DIRECTORY, path_to_file);

  PATH_TO_WORKING_DIRECTORY = path.dirname(absolute_path_to_file);
  process.chdir(PATH_TO_WORKING_DIRECTORY);

  try {
    const content = await readFile(absolute_path_to_file);
    console.log(content.toString() + '\n');
  } catch (err) {
    console.error(err);
  }

};





const addFile = async (chunk) => {
  const data = '';
  
  const fileName = chunk.slice(3).trim();
  const filePath = join(PATH_TO_WORKING_DIRECTORY, fileName);

  try {
    await writeFile(filePath, data, { flag: 'wx' });
  } catch (err) {
    console.error('Add new file operation failed!');
  }
};



const deleteFile = async (chunk) => {
  const path_to_file = chunk.slice(2).trim();

  const absolute_path_to_file = path.resolve(PATH_TO_WORKING_DIRECTORY, path_to_file);

  PATH_TO_WORKING_DIRECTORY = path.dirname(absolute_path_to_file);
  process.chdir(PATH_TO_WORKING_DIRECTORY);

  try {
    await rm(absolute_path_to_file);

  } catch (err) {
    console.error('Delete file operation failed!');
  }
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

    case 'cat' + chunk.slice(3):
      await printFileToConsole(chunk);
      console.log(`You are currently in ${PATH_TO_WORKING_DIRECTORY}`);
      break;

    case 'add' + chunk.slice(3):
      await addFile(chunk);
      console.log(`You are currently in ${PATH_TO_WORKING_DIRECTORY}`);
      break;

    case 'rm' + chunk.slice(2):
      await deleteFile(chunk);
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