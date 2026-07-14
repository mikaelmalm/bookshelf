import { useState, useEffect } from 'react';
import Bookshelf from './components/Bookshelf';
import BookReader from './components/BookReader';
import storiesData from './data/stories.json';

function App() {
  const [currentBookId, setCurrentBookId] = useState(null);

  // Sync state with URL hash for back-button navigation
  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash;
      if (hash.startsWith('#book-')) {
        const bookId = hash.replace('#book-', '');
        const bookExists = storiesData.some(b => b.id === bookId);
        if (bookExists) {
          setCurrentBookId(bookId);
        } else {
          setCurrentBookId(null);
          window.location.hash = '';
        }
      } else {
        setCurrentBookId(null);
      }
    };

    // Run on initial load
    handleHashChange();

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // Preload all images for the selected book to ensure instant page turns
  useEffect(() => {
    const activeBook = storiesData.find(b => b.id === currentBookId);
    if (activeBook) {
      const urls = [];
      if (activeBook.coverImage) urls.push(activeBook.coverImage);
      activeBook.pages.forEach(p => {
        if (p.imageUrl) urls.push(p.imageUrl);
      });

      // Trigger browser cache preloading
      urls.forEach(url => {
        const img = new Image();
        img.src = url;
      });
    }
  }, [currentBookId]);

  const selectBook = (bookId) => {
    if (bookId) {
      window.location.hash = `#book-${bookId}`;
    } else {
      window.location.hash = '';
    }
  };

  const activeBook = storiesData.find(b => b.id === currentBookId);

  return (
    <>
      {activeBook ? (
        <BookReader book={activeBook} onBack={() => selectBook(null)} />
      ) : (
        <Bookshelf books={storiesData} onSelectBook={selectBook} />
      )}
    </>
  );
}

export default App;
