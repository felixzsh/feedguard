import readline from 'readline';

export async function waitForUserConfirmation(message: string = 'Press any key to continue...'): Promise<void> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });

  return new Promise((resolve) => {
    console.log(`\n${message}`);
    
    // Simple implementation for Bun compatibility
    rl.question('', () => {
      rl.close();
      console.log(); // Add newline after keypress
      resolve();
    });
  });
}