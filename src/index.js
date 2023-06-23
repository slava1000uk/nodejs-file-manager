import  process  from 'node:process';


const welcomeUsername = () => {
  const arg = process.argv.slice(2);
  let username = '';
  
  arg.forEach((item, index, array) => {
    if (item.includes('usernsme')) {
      username = item.slice(11);
    }
  });

  console.log(`Welcome to the File Manager, ${username}!`);
    
};

welcomeUsername();