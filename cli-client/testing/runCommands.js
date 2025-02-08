const fs = require('fs');
const { exec } = require('child_process');

// Define the username and password for login
const USERNAME = 'admin';
const PASSWORD = 'freepasses4all';

// Read the '42.sh' file
fs.readFile('42.sh', 'utf8', (err, data) => {
  if (err) {
    // If there's an error reading the file, log it
    console.error('Error reading the file:', err);
    return;
  }

  // Split the content of the file by newlines and filter out empty lines
  const commands = data.split('\n').filter(line => line.trim() !== '');

  // Replace the placeholders for username and password with the actual values
  const processedCommands = commands.map(cmd =>
    cmd
      .replace('[your username]', USERNAME) // Replace the username placeholder
      .replace('[your password]', PASSWORD) // Replace the password placeholder
  );

  // Add 'npx' before each command
  const commandsWithNpx = processedCommands.map(cmd => `npx ${cmd}`);

  // Function to execute commands sequentially
  const runCommandsSequentially = (index) => {
    // If all commands have been executed, stop the process
    if (index >= commandsWithNpx.length) {
      console.log('All commands executed!');
      return;
    }

    // Get the current command to execute
    const command = commandsWithNpx[index];
    console.log(`Executing: ${command}`);

    // Execute the current command using 'exec'
    exec(command, (error, stdout, stderr) => {
      if (error) {
        // If there's an error executing the command, log it
        console.error(`Error executing command "${command}":`, error.message);
      }
      if (stderr) {
        // Log any stderr output
        console.error(`stderr: ${stderr}`);
      }
      if (stdout) {
        // Log the output from the command
        console.log(`stdout: ${stdout}`);
      }

      // Execute the next command in the list
      runCommandsSequentially(index + 1);
    });
  };

  // Start executing commands from the first one
  runCommandsSequentially(0);
});
