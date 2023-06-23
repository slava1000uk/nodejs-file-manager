import  process  from 'node:process';
import { dirname } from 'node:path';

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

welcomeUsername();

process.stdin.resume();

process.on('SIGINT', function () {
  console.log(`\nThank you for using File Manager, ${username}, goodbye!`);
  process.exit(0);
});


 //Node Js How to display text in the console After program work finished ctrl + c pressed 