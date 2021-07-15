// @ts-nocheck
import './bootstrap';
import * as commands from './commands';
import {default as chalk} from 'chalk';

const command = process.argv[2] || null;
if (!command) {
  showAvailableCommands();
}

const commandKey = Object.keys(commands).find(
  c => commands[c].command === command,
);
if (!commandKey) {
  showAvailableCommands();
}

const commandInstance = new commands[commandKey]();
commandInstance.run().catch(console.error);

function showAvailableCommands() {
  console.log(chalk.magenta('Loopback Console'));
  console.log('');
  console.log(chalk.green('Available Commands'));
  console.log('');
  for (const c of Object.keys(commands)) {
    console.log(
      `- ${chalk.blue(commands[c].command)} - ${commands[c].description}`,
    );
  }
  console.log('');
  process.exit();
}
