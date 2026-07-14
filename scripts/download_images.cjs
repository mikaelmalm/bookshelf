const fs = require('fs');
const path = require('path');
const http = require('https');

const inputJsonPath = "/home/malm/.gemini/antigravity/brain/2fef9add-8eec-488b-902d-0fec3bda19d1/scratch/stories.json";
const outputJsonDir = path.join(__dirname, '../src/data');
const outputJsonPath = path.join(outputJsonDir, 'stories.json');
const imagesDir = path.join(__dirname, '../public/images');

// Ensure directories exist
if (!fs.existsSync(outputJsonDir)) {
  fs.mkdirSync(outputJsonDir, { recursive: true });
}
if (!fs.existsSync(imagesDir)) {
  fs.mkdirSync(imagesDir, { recursive: true });
}

// Read scraped JSON
const stories = JSON.parse(fs.readFileSync(inputJsonPath, 'utf8'));

// Helper to download an image
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve(null);
      return;
    }
    
    const file = fs.createWriteStream(destPath);
    http.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`Failed to download image: ${response.statusCode} for ${url}`));
        return;
      }
      response.pipe(file);
      file.on('finish', () => {
        file.close();
        resolve(destPath);
      });
    }).on('error', (err) => {
      fs.unlink(destPath, () => {});
      reject(err);
    });
  });
}

async function run() {
  console.log(`Starting to download images for ${stories.length} stories...`);
  
  for (let i = 0; i < stories.length; i++) {
    const book = stories[i];
    console.log(`\nDownloading images for: ${book.title}`);
    
    // Download Cover Image
    if (book.coverImage) {
      const coverFileName = `${book.id}_cover.jpg`;
      const coverDest = path.join(imagesDir, coverFileName);
      try {
        console.log(`  Downloading cover image...`);
        await downloadImage(book.coverImage, coverDest);
        book.coverImage = `images/${coverFileName}`;
      } catch (err) {
        console.error(`  Error downloading cover image for ${book.title}:`, err.message);
      }
    }
    
    // Download Page Images
    for (let j = 0; j < book.pages.length; j++) {
      const page = book.pages[j];
      if (page.imageUrl) {
        const pageFileName = `${book.id}_page_${page.pageNumber}.jpg`;
        const pageDest = path.join(imagesDir, pageFileName);
        try {
          console.log(`  Downloading page ${page.pageNumber} image...`);
          await downloadImage(page.imageUrl, pageDest);
          page.imageUrl = `images/${pageFileName}`;
        } catch (err) {
          console.error(`  Error downloading page ${page.pageNumber} image:`, err.message);
        }
      }
    }
  }
  
  // Write the updated JSON
  fs.writeFileSync(outputJsonPath, JSON.stringify(stories, null, 2));
  console.log(`\nSuccessfully downloaded all images and updated JSON!`);
  console.log(`Data saved to: ${outputJsonPath}`);
}

run().catch(console.error);
