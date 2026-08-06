import AdmZip from 'adm-zip';
import fs from 'fs';
import path from 'path';

async function createProjectZip() {
  console.log('Packaging complete Android Studio project...');
  const zip = new AdmZip();

  const addFolder = (folderPath, zipPath = '') => {
    if (!fs.existsSync(folderPath)) return;
    const items = fs.readdirSync(folderPath);
    for (const item of items) {
      if (
        item === 'node_modules' ||
        item === '.git' ||
        item === '.gradle' ||
        item === 'build' ||
        item === '.DS_Store' ||
        item.endsWith('.zip') ||
        item.endsWith('.tar.gz')
      ) {
        continue;
      }
      const fullPath = path.join(folderPath, item);
      const relativeZipPath = zipPath ? `${zipPath}/${item}` : item;
      const stat = fs.statSync(fullPath);
      if (stat.isDirectory()) {
        addFolder(fullPath, relativeZipPath);
      } else {
        zip.addLocalFile(fullPath, zipPath);
      }
    }
  };

  // Add key top-level folders
  addFolder('android', 'android');
  addFolder('src', 'src');
  addFolder('public', 'public');
  addFolder('dist', 'dist');
  addFolder('assets', 'assets');
  addFolder('scripts', 'scripts');
  addFolder('Animal Vision Simulator', 'Animal Vision Simulator');

  // Add top-level files
  const topFiles = [
    'package.json',
    'package-lock.json',
    'bun.lock',
    'capacitor.config.ts',
    'capacitor.config.json',
    'firebase-applet-config.json',
    'firebase.json',
    'metadata.json',
    '.env.example',
    '.gitignore',
    'tsconfig.json',
    'vite.config.ts',
    'server.ts',
    'index.html',
    'README.md',
  ];

  for (const file of topFiles) {
    if (fs.existsSync(file)) {
      zip.addLocalFile(file, '');
    }
  }

  // Ensure output directory exists
  if (!fs.existsSync('public')) fs.mkdirSync('public', { recursive: true });
  if (!fs.existsSync('dist')) fs.mkdirSync('dist', { recursive: true });

  const zipPathPublic = path.join('public', 'AnimalVisionSimulator_AndroidStudio_Project.zip');
  const zipPathDist = path.join('dist', 'AnimalVisionSimulator_AndroidStudio_Project.zip');
  const zipLatestPublic = path.join('public', 'AnimalVisionSimulator_Latest.zip');
  const zipLatestDist = path.join('dist', 'AnimalVisionSimulator_Latest.zip');

  zip.writeZip(zipPathPublic);
  zip.writeZip(zipPathDist);
  zip.writeZip(zipLatestPublic);
  zip.writeZip(zipLatestDist);

  console.log(`Successfully generated Android Studio project archive:\n- ${zipLatestPublic}\n- ${zipLatestDist}`);
}

createProjectZip();
