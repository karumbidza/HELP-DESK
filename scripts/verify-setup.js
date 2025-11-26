#!/usr/bin/env node

/**
 * Setup Verification Script
 * Run this to check if your environment is properly configured
 * Usage: node scripts/verify-setup.js
 */

const fs = require('fs');
const path = require('path');

const RED = '\x1b[31m';
const GREEN = '\x1b[32m';
const YELLOW = '\x1b[33m';
const BLUE = '\x1b[34m';
const RESET = '\x1b[0m';

console.log(`${BLUE}
╔═══════════════════════════════════════════╗
║   SaaS Platform - Setup Verification     ║
╚═══════════════════════════════════════════╝
${RESET}`);

let allChecksPass = true;

function check(label, condition, message) {
  if (condition) {
    console.log(`${GREEN}✓${RESET} ${label}`);
    return true;
  } else {
    console.log(`${RED}✗${RESET} ${label}`);
    if (message) console.log(`  ${YELLOW}→${RESET} ${message}`);
    allChecksPass = false;
    return false;
  }
}

console.log(`\n${BLUE}Checking environment...${RESET}\n`);

// Check Node.js version
const nodeVersion = process.version;
const majorVersion = parseInt(nodeVersion.slice(1).split('.')[0]);
check(
  'Node.js version (18+)',
  majorVersion >= 18,
  `Current: ${nodeVersion}. Please upgrade to Node.js 18 or higher.`
);

// Check if .env.local exists
const envExists = fs.existsSync('.env.local');
check(
  '.env.local file exists',
  envExists,
  'Create .env.local file: cp .env.local.example .env.local'
);

// Check if environment variables are set
if (envExists) {
  const envContent = fs.readFileSync('.env.local', 'utf8');
  
  check(
    'NEXT_PUBLIC_SUPABASE_URL configured',
    envContent.includes('NEXT_PUBLIC_SUPABASE_URL=') && 
    !envContent.includes('NEXT_PUBLIC_SUPABASE_URL=your_supabase') &&
    !envContent.includes('NEXT_PUBLIC_SUPABASE_URL=\n') &&
    !envContent.includes('NEXT_PUBLIC_SUPABASE_URL= \n'),
    'Add your Supabase Project URL to .env.local'
  );
  
  check(
    'NEXT_PUBLIC_SUPABASE_ANON_KEY configured',
    envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=') && 
    !envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase') &&
    !envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY=\n') &&
    !envContent.includes('NEXT_PUBLIC_SUPABASE_ANON_KEY= \n'),
    'Add your Supabase Anon Key to .env.local'
  );
}

// Check if node_modules exists
check(
  'Dependencies installed',
  fs.existsSync('node_modules'),
  'Run: npm install'
);

// Check if key source files exist
console.log(`\n${BLUE}Checking project structure...${RESET}\n`);

const requiredFiles = [
  ['src/app/page.tsx', 'Landing page'],
  ['src/app/(auth)/login/page.tsx', 'Login page'],
  ['src/app/(auth)/signup/page.tsx', 'Signup page'],
  ['src/app/(dashboard)/layout.tsx', 'Dashboard layout'],
  ['src/app/(dashboard)/dashboard/page.tsx', 'Dashboard page'],
  ['src/lib/supabase/client.ts', 'Supabase client'],
  ['src/lib/supabase/server.ts', 'Supabase server'],
  ['src/middleware.ts', 'Auth middleware'],
  ['supabase/migrations/001_initial_schema.sql', 'Database migration'],
];

requiredFiles.forEach(([file, description]) => {
  check(`${description} (${file})`, fs.existsSync(file));
});

// Check if shadcn/ui is configured
console.log(`\n${BLUE}Checking UI components...${RESET}\n`);

const componentsPath = 'src/components/ui';
const uiComponents = fs.existsSync(componentsPath) 
  ? fs.readdirSync(componentsPath).filter(f => f.endsWith('.tsx'))
  : [];

check(
  'shadcn/ui components installed',
  uiComponents.length >= 5,
  `Found ${uiComponents.length} components. Expected at least 5.`
);

// Summary
console.log(`\n${BLUE}═══════════════════════════════════════════${RESET}\n`);

if (allChecksPass) {
  console.log(`${GREEN}✓ All checks passed!${RESET}`);
  console.log(`\n${BLUE}Next steps:${RESET}`);
  console.log('1. Create a Supabase project at https://supabase.com');
  console.log('2. Run the database migration (supabase/migrations/001_initial_schema.sql)');
  console.log('3. Start the dev server: npm run dev');
  console.log(`\n${GREEN}See QUICKSTART.md for detailed instructions.${RESET}\n`);
} else {
  console.log(`${RED}✗ Some checks failed.${RESET}`);
  console.log(`\n${YELLOW}Please fix the issues above and run this script again.${RESET}\n`);
  process.exit(1);
}
