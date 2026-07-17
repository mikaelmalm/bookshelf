import React from 'react';

// Ribbon color list to assign beautiful, playful bookmark colors
const RIBBON_COLORS = ['#e53935', '#ffa000', '#00acc1', '#43a047', '#1e88e5', '#8e24aa'];

function Bookshelf({ books, onSelectBook }) {
  const booksPerShelf = 2;
  const shelves = [];
  for (let i = 0; i < books.length; i += booksPerShelf) {
    shelves.push(books.slice(i, i + booksPerShelf));
  }

  return (
    <div className="library-container">
      <header className="library-header">
        <h1>Vincents böcker</h1>
      </header>

      <div className="shelves-container">
        {shelves.map((shelfBooks, shelfIndex) => (
          <div className="shelf-row" key={shelfIndex}>
            {shelfBooks.map((book, bookIndex) => {
              const ribbonColor = RIBBON_COLORS[(shelfIndex * booksPerShelf + bookIndex) % RIBBON_COLORS.length];
              
              return (
                <div 
                  className="book-wrapper" 
                  key={book.id} 
                  onClick={() => onSelectBook(book.id)}
                  aria-label={`Läs boken: ${book.title}`}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      onSelectBook(book.id);
                    }
                  }}
                >
                  <div className="book-card">
                    {/* Spine crease shading */}
                    <div className="book-spine-crease"></div>

                    <div 
                      className="book-cover-front" 
                      style={{ backgroundImage: `url(${book.coverImage})` }}
                    >
                      <div className="book-cover-overlay"></div>
                      <div className="book-cover-title-container">
                        <h2 className="book-cover-title">{book.title}</h2>
                        <span className="book-cover-author">Vincent</span>
                      </div>
                    </div>
                    {/* Page edges depth decoration */}
                    <div className="book-pages-stack"></div>
                    {/* Colorful Ribbon bookmark */}
                    <div className="book-ribbon" style={{ background: `linear-gradient(to right, ${ribbonColor}, #00000022)` }}></div>
                  </div>
                </div>
              );
            })}
            
            {/* Warm pine wood board shelf */}
            <div className="shelf-board"></div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Bookshelf;
