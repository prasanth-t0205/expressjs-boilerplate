const fs = require('fs');
const path = require('path');
const readline = require('readline');

const codeFiles = [
  'src/controllers/user.controller.ts',
  'src/services/user.service.ts',
  'src/routes/user.route.ts',
  'src/models/user.model.ts',
  'src/validators/user.validator.ts',
  'src/dto/user.dto.ts',
];

const mdFiles = [
  'CODE_OF_CONDUCT.md',
  'CONTRIBUTING.md',
  'README.md',
  'PATTERNS.md',
  'SECURITY.md',
  '.github/ISSUE_TEMPLATE/bug_report.md',
  '.github/ISSUE_TEMPLATE/feature_request.md',
  '.github/PULL_REQUEST_TEMPLATE.md',
];

const appTsPath = path.join(__dirname, '../src/app.ts');

const options = [
  'Delete ONLY the Boilerplate Community Files (CODE_OF_CONDUCT, CONTRIBUTING, SECURITY)',
  'Delete BOTH the Example Code files AND Boilerplate Community Files',
  'Move Example Code to "example/" folder AND delete Boilerplate Community Files',
  'Cancel',
];

let selectedIndex = 0;

const printMenu = () => {
  console.clear();
  console.log('How would you like to reset the boilerplate?\n');
  options.forEach((option, index) => {
    if (index === selectedIndex) {
      console.log(`> \x1b[36m${option}\x1b[0m`);
    } else {
      console.log(`  ${option}`);
    }
  });
  console.log('\n(Use arrow keys to navigate and Enter to select)');
};

const deleteMdFiles = () => {
  mdFiles.forEach((file) => {
    const p = path.join(__dirname, '..', file);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log(`Deleted: ${file}`);
    }
  });
};

const deleteCodeFiles = () => {
  codeFiles.forEach((file) => {
    const p = path.join(__dirname, '..', file);
    if (fs.existsSync(p)) {
      fs.unlinkSync(p);
      console.log(`Deleted: ${file}`);
    }
  });
};

const moveCodeFiles = () => {
  const exampleDir = path.join(__dirname, '../example');
  if (!fs.existsSync(exampleDir)) {
    fs.mkdirSync(exampleDir);
  }

  codeFiles.forEach((file) => {
    const srcPath = path.join(__dirname, '..', file);
    if (fs.existsSync(srcPath)) {
      const destPath = path.join(exampleDir, file);
      const destDir = path.dirname(destPath);
      if (!fs.existsSync(destDir)) {
        fs.mkdirSync(destDir, { recursive: true });
      }
      fs.renameSync(srcPath, destPath);
      console.log(`Moved: ${file} -> example/${file}`);
    }
  });
};

const updateAppTs = () => {
  if (fs.existsSync(appTsPath)) {
    let appTsContent = fs.readFileSync(appTsPath, 'utf8');

    // Remove the import statement
    appTsContent = appTsContent.replace(
      /import userRoutes from ['"]@\/routes\/user\.route['"];\n?/g,
      '',
    );

    // Remove the app.use statement
    appTsContent = appTsContent.replace(
      /\/\/ Mount Routes\napp\.use\(['"]\/api\/users['"], userRoutes\);\n?/g,
      '// Mount Routes\n// app.use("/api/your-route", yourRoute);\n',
    );

    fs.writeFileSync(appTsPath, appTsContent);
    console.log('Updated: src/app.ts (Removed example routes)');
  }
};

const handleSelection = () => {
  console.clear();
  switch (selectedIndex) {
    case 0:
      deleteMdFiles();
      console.log('\n✅ Successfully deleted Boilerplate Community Files!');
      break;
    case 1:
      deleteMdFiles();
      deleteCodeFiles();
      updateAppTs();
      console.log('\n✅ Successfully deleted Code Examples & Community Files, and updated app.ts!');
      break;
    case 2:
      deleteMdFiles();
      moveCodeFiles();
      updateAppTs();
      console.log('\n✅ Successfully moved Code files to example/ and deleted Community Files!');
      break;
    case 3:
      console.log('\nOperation cancelled. No files were changed.');
      break;
  }
  process.exit(0);
};

// Setup raw mode for arrow keys
readline.emitKeypressEvents(process.stdin);
if (process.stdin.isTTY) {
  process.stdin.setRawMode(true);
}

process.stdin.on('keypress', (str, key) => {
  if (key.name === 'up') {
    selectedIndex = selectedIndex > 0 ? selectedIndex - 1 : options.length - 1;
    printMenu();
  } else if (key.name === 'down') {
    selectedIndex = selectedIndex < options.length - 1 ? selectedIndex + 1 : 0;
    printMenu();
  } else if (key.name === 'return') {
    handleSelection();
  } else if (key.ctrl && key.name === 'c') {
    process.exit();
  }
});

printMenu();
