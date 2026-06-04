const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

const exampleFiles = [
  'src/controllers/user.controller.ts',
  'src/services/user.service.ts',
  'src/routes/user.route.ts',
  'src/models/user.model.ts',
  'src/validators/user.validator.ts',
  'src/dto/user.dto.ts'
];

const appTsPath = path.join(__dirname, '../src/app.ts');

const question = () => {
  return new Promise((resolve) => {
    rl.question('Do you want to move the example files to an "example" folder or delete them completely? (move/delete/cancel): ', (answer) => {
      resolve(answer.trim().toLowerCase());
    });
  });
};

const moveFiles = () => {
  const exampleDir = path.join(__dirname, '../example');
  if (!fs.existsSync(exampleDir)) {
    fs.mkdirSync(exampleDir);
  }

  exampleFiles.forEach(file => {
    const srcPath = path.join(__dirname, '..', file);
    if (fs.existsSync(srcPath)) {
      // Recreate directory structure inside example/
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

const deleteFiles = () => {
  exampleFiles.forEach(file => {
    const srcPath = path.join(__dirname, '..', file);
    if (fs.existsSync(srcPath)) {
      fs.unlinkSync(srcPath);
      console.log(`Deleted: ${file}`);
    }
  });
};

const updateAppTs = () => {
  if (fs.existsSync(appTsPath)) {
    let appTsContent = fs.readFileSync(appTsPath, 'utf8');
    
    // Remove the import statement
    appTsContent = appTsContent.replace(/import userRoutes from ['"]@\/routes\/user\.route['"];\n?/g, '');
    
    // Remove the app.use statement
    appTsContent = appTsContent.replace(/\/\/ Mount Routes\napp\.use\(['"]\/api\/users['"], userRoutes\);\n?/g, '// Mount Routes\n// app.use("/api/your-route", yourRoute);\n');
    
    fs.writeFileSync(appTsPath, appTsContent);
    console.log('Updated: src/app.ts (Removed example routes)');
  }
};

const run = async () => {
  const answer = await question();
  
  if (answer === 'move') {
    moveFiles();
    updateAppTs();
    console.log('✅ Successfully moved example files and updated app.ts!');
  } else if (answer === 'delete') {
    deleteFiles();
    updateAppTs();
    console.log('✅ Successfully deleted example files and updated app.ts!');
  } else {
    console.log('Operation cancelled. No files were changed.');
  }
  
  rl.close();
};

run();
