import  process  from 'node:process';
import  path  from 'node:path';
import { dirname, join } from 'node:path';
import { pipeline } from 'node:stream/promises';
import { Transform } from 'node:stream';
import  os  from 'node:os';
import { readdir, readFile, writeFile, rm, rename, copyFile } from 'node:fs/promises';
import { constants } from 'node:fs';
import { createWriteStream, createReadStream } from 'node:fs';
import zlib from 'node:zlib';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';


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
  try {
    PATH_TO_WORKING_DIRECTORY = path.dirname(PATH_TO_WORKING_DIRECTORY);
    process.chdir(PATH_TO_WORKING_DIRECTORY);
    
  } catch (error) {
    console.error('up operation failed!');
  }
};

const goToDirectory = (chunk) => {
  let path_to_directory = chunk.slice(2).trim();

  try {
    const PATH_TO_DIRECTORY = path.resolve(PATH_TO_WORKING_DIRECTORY, path_to_directory);
    
    if (existsSync(PATH_TO_DIRECTORY)) {
      PATH_TO_WORKING_DIRECTORY = PATH_TO_DIRECTORY;
      process.chdir(PATH_TO_WORKING_DIRECTORY);
    } else { throw new Error(); }
    
  } catch (error) {
    console.error('cd operation failed!');
  }

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
    console.error('Print file operation failed!');
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




const renameFile = async (chunk) => {
  const [path_to_oldfile, new_filename] = chunk.slice(2).trim().split(' ');
  
  const absolute_path_to_oldfile = path.resolve(PATH_TO_WORKING_DIRECTORY, path_to_oldfile);

  PATH_TO_WORKING_DIRECTORY = path.dirname(absolute_path_to_oldfile);
  process.chdir(PATH_TO_WORKING_DIRECTORY);

  const absolute_path_to_newfile = path.resolve(PATH_TO_WORKING_DIRECTORY, new_filename);

  try {
    await rename(absolute_path_to_oldfile, absolute_path_to_newfile);

  } catch (error) {
    console.error('Rename file operation failed!');
  }
};


const copyFileTo = async (chunk) => {
  const [path_to_file, path_to_new_directory] = chunk.slice(2).trim().split(' ');
  
  
  const absolute_path_to_file = path.resolve(PATH_TO_WORKING_DIRECTORY, path_to_file);
  const file_name = path.basename(absolute_path_to_file);

  PATH_TO_WORKING_DIRECTORY = path.dirname(absolute_path_to_file);
  process.chdir(PATH_TO_WORKING_DIRECTORY);

  const absolute_path_to_new_directory = path.resolve(PATH_TO_WORKING_DIRECTORY, path_to_new_directory);
  const absolute_path_to_new_file = join(absolute_path_to_new_directory, file_name);

  try {
    // await copyFile(absolute_path_to_file, absolute_path_to_new_file, constants.COPYFILE_EXCL);

    const readStream = createReadStream(absolute_path_to_file);
    const writeStream = createWriteStream(absolute_path_to_new_file);

    readStream.pipe(writeStream);


  } catch {
    console.log('The file could not be copied');
  }

};



const moveFileTo = async (chunk) => {
  const [path_to_file, path_to_new_directory] = chunk.slice(2).trim().split(' ');


  const absolute_path_to_file = path.resolve(PATH_TO_WORKING_DIRECTORY, path_to_file);
  const file_name = path.basename(absolute_path_to_file);

  PATH_TO_WORKING_DIRECTORY = path.dirname(absolute_path_to_file);
  process.chdir(PATH_TO_WORKING_DIRECTORY);

  const absolute_path_to_new_directory = path.resolve(PATH_TO_WORKING_DIRECTORY, path_to_new_directory);
  const absolute_path_to_new_file = join(absolute_path_to_new_directory, file_name);

  try {
    // await copyFile(absolute_path_to_file, absolute_path_to_new_file, constants.COPYFILE_EXCL);

    const readStream = createReadStream(absolute_path_to_file);
    const writeStream = createWriteStream(absolute_path_to_new_file);

    readStream.pipe(writeStream);

    await rm(absolute_path_to_file);

  } catch {
    console.log('The file could not be moved!');
  }

};


const compressFileTo = (chunk) => {
  const [path_to_file, path_to_destination] = chunk.slice(8).trim().split(' ');


  const absolute_path_to_file = path.resolve(PATH_TO_WORKING_DIRECTORY, path_to_file);
  const absolute_path_to_destination = path.resolve(PATH_TO_WORKING_DIRECTORY, path_to_destination);

  PATH_TO_WORKING_DIRECTORY = path.dirname(absolute_path_to_file);
  process.chdir(PATH_TO_WORKING_DIRECTORY);

  
  try {
    const readStream = createReadStream(absolute_path_to_file);
    const brotli = zlib.createBrotliCompress();
    const writeStream = createWriteStream(absolute_path_to_destination);

    readStream.pipe(brotli).pipe(writeStream);


  } catch {
    console.log('The file could not be compressed!');
  }

};


const decompressFileTo = (chunk) => {
  const [path_to_file, path_to_destination] = chunk.slice(10).trim().split(' ');


  const absolute_path_to_file = path.resolve(PATH_TO_WORKING_DIRECTORY, path_to_file);
  const absolute_path_to_destination = path.resolve(PATH_TO_WORKING_DIRECTORY, path_to_destination);

  PATH_TO_WORKING_DIRECTORY = path.dirname(absolute_path_to_file);
  process.chdir(PATH_TO_WORKING_DIRECTORY);


  try {
    const readStream = createReadStream(absolute_path_to_file);
    const brotli = zlib.createBrotliDecompress();
    const writeStream = createWriteStream(absolute_path_to_destination);

    readStream.pipe(brotli).pipe(writeStream);


  } catch {
    console.log('The file could not be decompressed!');
  }

};



const hashFile = async (chunk) => {
  const path_to_file = chunk.slice(4).trim();

  const absolute_path_to_file = path.resolve(PATH_TO_WORKING_DIRECTORY, path_to_file);

  PATH_TO_WORKING_DIRECTORY = path.dirname(absolute_path_to_file);
  process.chdir(PATH_TO_WORKING_DIRECTORY);
  
  
  try {
    const content = await readFile(absolute_path_to_file);

    let hash = createHash('SHA256').update(content);
    console.log(hash.digest('hex') + '\n');

  } catch (err) {
    console.error('Hash file operation failed!');
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

    case 'rn' + chunk.slice(2):
      await renameFile(chunk);
      console.log(`You are currently in ${PATH_TO_WORKING_DIRECTORY}`);
      break;

    case 'cp' + chunk.slice(2):
      await copyFileTo(chunk);
      console.log(`You are currently in ${PATH_TO_WORKING_DIRECTORY}`);
      break;

    case 'mv' + chunk.slice(2):
      await moveFileTo(chunk);
      console.log(`You are currently in ${PATH_TO_WORKING_DIRECTORY}`);
      break;

    case 'compress' + chunk.slice(8):
      compressFileTo(chunk);
      console.log(`You are currently in ${PATH_TO_WORKING_DIRECTORY}`);
      break;

    case 'decompress' + chunk.slice(10):
      decompressFileTo(chunk);
      console.log(`You are currently in ${PATH_TO_WORKING_DIRECTORY}`);
      break;

    case 'hash' + chunk.slice(4):
      await hashFile(chunk);
      console.log(`You are currently in ${PATH_TO_WORKING_DIRECTORY}`);
      break;

    case 'os --EOL\n':
      output = os.EOL + '\n';
      break;

    case 'os --cpus\n':
      console.log('Overall amount of CPUS: ' + os.cpus().length + '\n');
      console.log(os.cpus().map(cpu => { 
        return { model: cpu.model.split(' ').shift(), clockrate: cpu.model.split(' ').pop() }
        })
      );
      break;
    
    case 'os --homedir\n':
      output = os.homedir() + '\n';
      break;

    case 'os --architecture\n':
      output = os.arch() + '\n';
      break;

    case 'os --username\n':
      output = os.hostname() + '\n';
      break;
    
    case '.exit\n':
      console.log(`\nThank you for using File Manager, ${username}, goodbye!`);
      process.exit(0);;
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