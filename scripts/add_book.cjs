const fs = require('fs');
const path = require('path');
const http = require('https');
const puppeteer = require('puppeteer');

// Paths
const outputJsonDir = path.join(__dirname, '../src/data');
const outputJsonPath = path.join(outputJsonDir, 'stories.json');
const imagesDir = path.join(__dirname, '../public/images');

// Helper to slugify book titles for IDs (e.g. "Vincent på simskola" -> "vincent-pa-simskola")
function slugify(text) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/[åä]/g, 'a')
    .replace(/ö/g, 'o')
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

// Helper to download an image from a URL or copy it if it's a local file
function downloadImage(url, destPath) {
  return new Promise((resolve, reject) => {
    if (!url) {
      resolve(null);
      return;
    }
    
    const isLocal = url.startsWith('file://') || (!url.startsWith('http://') && !url.startsWith('https://'));
    
    if (isLocal) {
      try {
        let localPath = url.replace(/^file:\/\//, '');
        if (process.platform === 'win32' && localPath.startsWith('/')) {
          localPath = localPath.substring(1);
        }
        localPath = decodeURIComponent(localPath);
        
        fs.copyFileSync(localPath, destPath);
        resolve(destPath);
      } catch (err) {
        reject(err);
      }
      return;
    }
    
    const file = fs.createWriteStream(destPath);
    http.get(url, (response) => {
      if (response.statusCode !== 200) {
        reject(new Error(`HTTP Code ${response.statusCode}`));
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

async function main() {
  const args = process.argv.slice(2);
  const shareUrl = args[0];
  
  if (!shareUrl) {
    console.error("Error: Please provide a Gemini share link or a local HTML file path.");
    console.log("Usage:\n  bun run add-book <gemini-share-link>\n  bun run add-book <local-html-file-path>\n");
    process.exit(1);
  }

  console.log(`\n========================================`);
  console.log(`Adding Gemini Storybook: ${shareUrl}`);
  console.log(`========================================`);

  // Ensure output directories exist
  if (!fs.existsSync(outputJsonDir)) {
    fs.mkdirSync(outputJsonDir, { recursive: true });
  }
  if (!fs.existsSync(imagesDir)) {
    fs.mkdirSync(imagesDir, { recursive: true });
  }

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  
  const page = await browser.newPage();
  await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");
  
  try {
    const isUrl = shareUrl.startsWith('http://') || shareUrl.startsWith('https://');
    
    if (isUrl) {
      console.log("Navigating to Gemini share link...");
      await page.goto(shareUrl, { waitUntil: 'networkidle2', timeout: 30000 });
      await new Promise(r => setTimeout(r, 4000));
      
      // Check for cookie consent wall
      const currentUrl = page.url();
      if (currentUrl.includes('consent.google.com')) {
        console.log("Accepting Google cookie consent...");
        const accepted = await page.evaluate(() => {
          const btns = Array.from(document.querySelectorAll('button'));
          const acceptBtn = btns.find(b => 
            b.textContent.includes("Godkänn alla") || 
            b.textContent.includes("Accept all") || 
            b.textContent.includes("Jag godkänner") || 
            b.textContent.includes("I agree") ||
            b.textContent.includes("Accept")
          );
          if (acceptBtn) {
            acceptBtn.click();
            return true;
          }
          return false;
        });
        
        if (accepted) {
          await page.waitForNavigation({ waitUntil: 'networkidle2', timeout: 10000 }).catch(() => {});
          await new Promise(r => setTimeout(r, 3000));
        }
      }
    } else {
      const resolvedPath = path.resolve(shareUrl);
      if (!fs.existsSync(resolvedPath)) {
        throw new Error(`Local file not found at: ${resolvedPath}`);
      }
      console.log(`Loading local HTML file: ${resolvedPath}`);
      await page.goto('file://' + resolvedPath, { waitUntil: 'networkidle2' });
      await new Promise(r => setTimeout(r, 2000));
    }
    
    // Parse DOM elements
    console.log("Extracting story content...");
    const data = await page.evaluate(() => {
      const coverTitleEl = document.querySelector('storybook-cover-page-content h1') || 
                           document.querySelector('.cover-title') || 
                           document.querySelector('h1');
      const title = coverTitleEl ? coverTitleEl.textContent.trim() : null;
      
      // Extract unique story texts
      const textEls = Array.from(document.querySelectorAll('.story-text'));
      const texts = [];
      textEls.forEach(el => {
        const txt = el.textContent.replace(/\s+/g, ' ').trim();
        if (txt && !texts.includes(txt)) {
          texts.push(txt);
        }
      });
      
      // Extract unique high-res image sources
      const imgEls = Array.from(document.querySelectorAll('.storybook-image img, img[alt="Storybook page image"]'));
      const images = [];
      imgEls.forEach(el => {
        const src = el.src;
        if (src && !images.includes(src)) {
          images.push(src);
        }
      });
      
      return { title, texts, images };
    });
    
    if (!data.title || data.texts.length === 0) {
      throw new Error("Could not extract title or page text. The page layout may have changed.");
    }
    
    const bookId = slugify(data.title);
    console.log(`\nFound Storybook:`);
    console.log(`- Title: "${data.title}"`);
    console.log(`- Generated ID: "${bookId}"`);
    console.log(`- Pages: ${data.texts.length}`);
    console.log(`- Images found: ${data.images.length}`);
    
    // Download Cover
    const coverUrl = data.images[0];
    let coverLocalPath = "";
    if (coverUrl) {
      console.log(`\nDownloading cover image...`);
      const coverFileName = `${bookId}_cover.jpg`;
      const coverDest = path.join(imagesDir, coverFileName);
      await downloadImage(coverUrl, coverDest);
      coverLocalPath = `images/${coverFileName}`;
      console.log(`  Saved to public/images/${coverFileName}`);
    }
    
    // Download page illustrations
    const pages = [];
    console.log(`\nDownloading page illustrations...`);
    for (let i = 0; i < data.texts.length; i++) {
      const text = data.texts[i];
      const imgUrl = data.images[i + 1] || null; // page images start after cover
      let pageLocalPath = null;
      
      if (imgUrl) {
        const pageFileName = `${bookId}_page_${i + 1}.jpg`;
        const pageDest = path.join(imagesDir, pageFileName);
        try {
          await downloadImage(imgUrl, pageDest);
          pageLocalPath = `images/${pageFileName}`;
          console.log(`  Page ${i + 1}: Saved to public/images/${pageFileName}`);
        } catch (err) {
          console.error(`  Page ${i + 1}: Failed to download image (${err.message})`);
        }
      }
      
      pages.push({
        pageNumber: i + 1,
        text: text,
        imageUrl: pageLocalPath
      });
    }
    
    // Load database
    let stories = [];
    if (fs.existsSync(outputJsonPath)) {
      stories = JSON.parse(fs.readFileSync(outputJsonPath, 'utf8'));
    }
    
    // Check if book already exists, if so overwrite, else append
    const newBook = {
      id: bookId,
      title: data.title,
      shareUrl: shareUrl,
      coverImage: coverLocalPath,
      pages: pages
    };
    
    const existingIndex = stories.findIndex(b => b.id === bookId);
    if (existingIndex !== -1) {
      stories[existingIndex] = newBook;
      console.log(`\nUpdated existing book "${data.title}" in database!`);
    } else {
      stories.push(newBook);
      console.log(`\nAdded new book "${data.title}" to database!`);
    }
    
    // Save database
    fs.writeFileSync(outputJsonPath, JSON.stringify(stories, null, 2));
    console.log(`Saved database to src/data/stories.json`);
    console.log(`\nSuccess! Run 'bun run dev' to see the new book on the shelf.`);

  } catch (err) {
    console.error(`\nError occurred:`, err.message);
  } finally {
    await browser.close();
  }
}

main();
