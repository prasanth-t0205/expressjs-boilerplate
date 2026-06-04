const fs = require("fs");
const path = require("path");

const newName = process.argv[2];

if (!newName) {
  console.error(
    "Please provide a new project name. Example: npm run rename my-cool-api",
  );
  process.exit(1);
}

console.log(`Renaming project to: ${newName}...`);

const packageJsonPath = path.join(__dirname, "../package.json");
const dockerComposePath = path.join(__dirname, "../docker-compose.yml");

try {
  const packageData = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
  packageData.name = newName;
  packageData.description = `${newName} API`;
  fs.writeFileSync(
    packageJsonPath,
    JSON.stringify(packageData, null, 2) + "\n",
  );
  console.log("Updated package.json");
} catch (err) {
  console.error("Could not update package.json", err);
}

try {
  if (fs.existsSync(dockerComposePath)) {
    let dockerData = fs.readFileSync(dockerComposePath, "utf8");
    dockerData = dockerData.replace(/expressjs_api/g, `${newName}_api`);
    dockerData = dockerData.replace(/expressjs_mongo/g, `${newName}_mongo`);
    fs.writeFileSync(dockerComposePath, dockerData);
    console.log("Updated docker-compose.yml");
  }
} catch (err) {
  console.error("Could not update docker-compose.yml", err);
}

console.log(`\nSuccess! Your project is now named '${newName}'.`);
console.log(
  `You can now safely delete the 'scripts/rename.js' file if you wish.`,
);
