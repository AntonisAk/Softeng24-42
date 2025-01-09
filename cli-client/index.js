#!/usr/bin/env node

const { Command } = require('commander');
const program = new Command();

// CLI version and description
program.version('1.0.0').description('CLI for Toll Management System');

// Import commands
program
  .command('healthcheck')
  .description('Check system health and database connectivity')
  .action(require('./commands/healthcheck'));

program
  .command('resetpasses')
  .description('Reset all toll station passes')
  .action(require('./commands/resetpasses'));

program
  .command('resetstations')
  .description('Reset all toll stations')
  .action(require('./commands/resetstations'));

program
  .command('login')
  .description('Login a user')
  .requiredOption('--username <username>', 'Username')
  .requiredOption('--passw <password>', 'Password')
  .action(require('./commands/login'));

program
  .command('logout')
  .description('Logout the current user')
  .action(require('./commands/logout'));

program
  .command('tollstationpasses')
  .description('Get passes for a specific toll station')
  .requiredOption('--station <station>', 'Station ID')
  .requiredOption('--from <from>', 'Start date (YYYYMMDD)')
  .requiredOption('--to <to>', 'End date (YYYYMMDD)')
  .option('--format <format>', 'Output format (json or csv)', 'csv')
  .action(require('./commands/tollstationpasses'));

program
  .command('passanalysis')
  .description('Analyze toll passes between operators')
  .requiredOption('--stationop <stationop>', 'Station operator ID')
  .requiredOption('--tagop <tagop>', 'Tag operator ID')
  .requiredOption('--from <from>', 'Start date (YYYYMMDD)')
  .requiredOption('--to <to>', 'End date (YYYYMMDD)')
  .option('--format <format>', 'Output format (json or csv)', 'csv')
  .action(require('./commands/passanalysis'));

program
  .command('passescost')
  .description('Calculate cost of toll passes between operators')
  .requiredOption('--stationop <stationop>', 'Station operator ID')
  .requiredOption('--tagop <tagop>', 'Tag operator ID')
  .requiredOption('--from <from>', 'Start date (YYYYMMDD)')
  .requiredOption('--to <to>', 'End date (YYYYMMDD)')
  .option('--format <format>', 'Output format (json or csv)', 'csv')
  .action(require('./commands/passescost'));

program
  .command('chargesby')
  .description('Calculate charges by operators')
  .requiredOption('--opid <opid>', 'Operator ID')
  .requiredOption('--from <from>', 'Start date (YYYYMMDD)')
  .requiredOption('--to <to>', 'End date (YYYYMMDD)')
  .option('--format <format>', 'Output format (json or csv)', 'csv')
  .action(require('./commands/chargesby'));

  program
  .command('admin')
  .description('Administrative commands')
  .requiredOption('--addpasses <addpasses>', 'Function')
  .requiredOption('--source <source>', 'Path to the CSV file')
  .action(require('./commands/addpasses'));

program
  .command('usermod')
  .description('Create or modify a user')
  .requiredOption('--username <username>', 'Username of the user')
  .requiredOption('--passw <password>', 'New password for the user')
  .action(require('./commands/usermod'));

program
  .command('users')
  .description('List all users')
  .action(require('./commands/users'));

  // Parse CLI arguments
program.parse(process.argv);
