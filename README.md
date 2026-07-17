# 📖 Vincent's Bookshelf (Vincents Bokhylla)

A cozy, premium digital bookshelf and Progressive Web App (PWA) built for Vincent to read and listen to illustrated children's books created with Google Gemini.

The app is designed to be extremely clean, simple, and child-friendly, with a responsive layout that works beautifully on tablets, mobile viewports, and desktop screens.

👉 **[Click here to visit the bookshelf live!](https://mikaelmalm.github.io/bookshelf/)**

---

## ✨ Features

- **Child-Friendly Interface**: A clean bookshelf styled in dark wood paneling where book covers are displayed large and clear, making it simple to choose a story.
- **Smart Layouts**:
  - *Desktop*: Displays classic double-page spreads side-by-side with generous, airy margins (110px) for an authentic book reading experience.
  - *Mobile*: A clean full-screen layout where the illustration pins to the top and the story text rests underneath.
- **Simple Page Turns**: On mobile, simply tap the right side of the viewport to turn the page forward, and tap the left side to go backward. Bypasses tiny buttons for easier use by small fingers!
- **Instant Page Transitions**: All illustrations are preloaded in the background as soon as a book is selected, ensuring instant page turns without any network lag.
- **Text-to-Speech**: A discrete audio button reads the story text out loud directly inside the browser.
- **Installable PWA**: The application can be saved to the home screen on phones or tablets and runs entirely offline without internet thanks to local service worker caching.

---

## 🛠️ Add More Books

To easily expand Vincent's library, there is a built-in scraper utility. You can run it either using a Gemini share link directly, or with a saved local HTML file if Google requires a login for your link.

### Option 1: Direct via Gemini Link
Run the following command in your terminal:
```bash
bun run add-book <gemini-share-link>
```
*(Or if using npm: `npm run add-book -- <gemini-share-link>`)*

### Option 2: Via Saved HTML File (If Google requires login)
If Google redirects and blocks the automated scraper for a certain link, you can easily bypass it:
1. Open the share link in your standard web browser (where you are logged in).
2. Right-click anywhere on the page and select **Save As...** (Save as **HTML Only**, e.g., name it `book.html`).
3. Run the scraper against your local file:
   ```bash
   bun run add-book ./book.html
   ```

**What the script does:**
1. Loads the page content and extracts the title, pages, and high-res image sources.
2. Downloads all illustrations locally to `public/images/`.
3. Stores the text and image path references in your local database (`src/data/stories.json`).
4. The book instantly appears on a virtual shelf with its cover!

### Save and Publish Your Changes (Commit & Deploy)

Once you've run the scraper to add a new book, you need to save your changes in Git and publish them to make the new book visible on the live website. Run these commands in your terminal:

1. **Save changes locally (Commit):**
   ```bash
   git add .
   git commit -m "feat: add new book to bookshelf"
   ```

2. **Upload to GitHub (Push):**
   ```bash
   git push origin main
   ```

3. **Publish live to GitHub Pages (Deploy):**
   ```bash
   bun run deploy
   ```
   *(This compiles the source code and automatically deploys the updated app live to the web)*

---

## 🚀 Getting Started (Development)

### Local Development
1. Install dependencies:
   ```bash
   bun install
   ```
2. Start the local dev server:
   ```bash
   bun run dev
   ```

### Build & Deploy Manually
1. Compile the production bundle:
   ```bash
   bun run build
   ```
2. Deploy directly to GitHub Pages:
   ```bash
   bun run deploy
   ```

---

Created with ❤️ for Vincent.
