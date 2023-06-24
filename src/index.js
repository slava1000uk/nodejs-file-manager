import  process  from 'node:process';
import { dirname } from 'node:path';
import { Transform, pipeline } from 'node:stream';
import  os  from 'node:os';

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



const parseInputToAction = (chunk) => {
  let output = '';

  switch (chunk) {
    // case 'ls\n':
    //  list();


    //   break;

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
  welcomeUsername();

  const inputTransformToOutput = new Transform({

    transform(chunk, _, callback) {
      let output = parseInputToAction(chunk.toString()); // it's better tu use os.EOL for new line
      this.push(output);
      callback();
    }
  });

  pipeline(
    process.stdin,
    inputTransformToOutput,
    process.stdout,
    (err) => console.error(err.message));


  //display text in the console After program work finished ctrl + c pressed  
  process.on('SIGINT', function () {
    console.log(`\nThank you for using File Manager, ${username}, goodbye!`);
    process.exit(0);
  });
}

await run();