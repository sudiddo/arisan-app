#!/usr/bin/env node

/**
 * Prisma Client Diagnostic and Fix Script
 *
 * This script helps diagnose and fix common Prisma client issues:
 * 1. Checks if the Prisma client is properly generated
 * 2. Verifies schema matches client
 * 3. Regenerates Prisma client if needed
 *
 * Usage: node src/scripts/fix-prisma.js
 */

const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  red: "\x1b[31m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

console.log(
  `${colors.blue}====== Prisma Client Diagnostic Tool ======${colors.reset}`
);

// Function to run a command and handle errors
function runCommand(command, errorMessage) {
  try {
    console.log(`${colors.cyan}Running: ${command}${colors.reset}`);
    return execSync(command, { stdio: "inherit" });
  } catch (error) {
    console.error(
      `${colors.red}${errorMessage || "Command failed"}: ${error.message}${
        colors.reset
      }`
    );
    return false;
  }
}

// Step 1: Check if schema.prisma exists
const schemaPath = path.join(process.cwd(), "prisma", "schema.prisma");
if (!fs.existsSync(schemaPath)) {
  console.error(
    `${colors.red}Error: schema.prisma not found at ${schemaPath}${colors.reset}`
  );
  process.exit(1);
}

console.log(`${colors.green}✓ Found schema.prisma${colors.reset}`);

// Step 2: Check for Payment model in schema
const schemaContent = fs.readFileSync(schemaPath, "utf8");
if (!schemaContent.includes("model Payment {")) {
  console.error(
    `${colors.red}Error: Payment model not found in schema.prisma${colors.reset}`
  );
  console.log("Please add the Payment model to your schema.prisma file.");
  process.exit(1);
}

console.log(`${colors.green}✓ Payment model found in schema${colors.reset}`);

// Step 3: Clean Prisma cache
console.log(`${colors.yellow}Cleaning Prisma cache...${colors.reset}`);
if (fs.existsSync(path.join(process.cwd(), "node_modules", ".prisma"))) {
  try {
    fs.rmSync(path.join(process.cwd(), "node_modules", ".prisma"), {
      recursive: true,
      force: true,
    });
    console.log(`${colors.green}✓ Cleaned Prisma cache${colors.reset}`);
  } catch (error) {
    console.warn(
      `${colors.yellow}Warning: Couldn't remove Prisma cache: ${error.message}${colors.reset}`
    );
  }
}

// Step 4: Regenerate Prisma client
console.log(`${colors.yellow}Regenerating Prisma client...${colors.reset}`);
if (!runCommand("npx prisma generate", "Failed to generate Prisma client")) {
  process.exit(1);
}

console.log(`${colors.green}✓ Prisma client regenerated${colors.reset}`);

// Step 5: Test Prisma client
console.log(`${colors.yellow}Testing Prisma client...${colors.reset}`);
const testScript = `
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Log available models
console.log('Available models:', Object.keys(prisma));

// Check if Payment model exists
if (!prisma.payment) {
  console.error('Payment model is missing from Prisma client!');
  process.exit(1);
}

console.log('Payment model is available in Prisma client.');
process.exit(0);
`;

const testFilePath = path.join(process.cwd(), "prisma-test.js");
fs.writeFileSync(testFilePath, testScript);

try {
  execSync("node prisma-test.js", { stdio: "inherit" });
  console.log(`${colors.green}✓ Prisma client test successful${colors.reset}`);
} catch (error) {
  console.error(`${colors.red}Prisma client test failed${colors.reset}`);
  console.log(
    `${colors.yellow}Try running 'npm install' to complete the fix${colors.reset}`
  );
} finally {
  // Clean up test file
  fs.unlinkSync(testFilePath);
}

console.log(`${colors.blue}====== Diagnostic Complete ======${colors.reset}`);
console.log(`If you're still experiencing issues, try running:`);
console.log(`${colors.cyan}npm run prisma:reset${colors.reset}`);
