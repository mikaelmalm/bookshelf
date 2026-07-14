import React, { useState, useEffect, useRef, useCallback } from 'react';

function BookReader({ book, onBack }) {
  // pageIndex 0 is Cover Page. Page index 1 to book.pages.length are story pages.
  const [pageIndex, setPageIndex] = useState(0);
  const [isNarrating, setIsNarrating] = useState(false);
  const touchStartX = useRef(0);
  const touchEndX = useRef(0);

  const totalPages = book.pages.length; // Number of story pages

  // Navigation handlers
  const nextPage = useCallback(() => {
    if (pageIndex < totalPages) {
      setPageIndex(prev => prev + 1);
    }
  }, [pageIndex, totalPages]);

  const prevPage = useCallback(() => {
    if (pageIndex > 0) {
      setPageIndex(prev => prev - 1);
    }
  }, [pageIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowRight') {
        nextPage();
      } else if (e.key === 'ArrowLeft') {
        prevPage();
      } else if (e.key === 'Escape') {
        onBack();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [nextPage, prevPage, onBack]);

  const readCurrentPage = useCallback(() => {
    window.speechSynthesis.cancel(); // Stop any current speech

    let textToSpeak = "";
    if (pageIndex === 0) {
      textToSpeak = `${book.title}. En bok om Vincent. Tryck på nästa för att starta.`;
    } else {
      textToSpeak = book.pages[pageIndex - 1].text;
    }

    if (!textToSpeak) return;

    const utterance = new SpeechSynthesisUtterance(textToSpeak);

    // Find a Swedish voice if available
    const voices = window.speechSynthesis.getVoices();
    const swedishVoice = voices.find(voice => voice.lang.includes('sv'));
    if (swedishVoice) {
      utterance.voice = swedishVoice;
    }

    utterance.lang = 'sv-SE';
    utterance.rate = 0.95; // Slightly slower for children reading along
    utterance.pitch = 1.0;

    utterance.onend = () => {
      // Keep state in sync if speech finishes naturally
      if (pageIndex === totalPages) {
        setIsNarrating(false);
      }
    };

    utterance.onerror = (e) => {
      console.error("SpeechSynthesis error:", e);
      setIsNarrating(false);
    };

    window.speechSynthesis.speak(utterance);
  }, [pageIndex, book.title, book.pages, totalPages]);

  // Speech Narration (Web Speech API)
  useEffect(() => {
    if (isNarrating) {
      readCurrentPage();
    } else {
      window.speechSynthesis.cancel();
    }
  }, [isNarrating, readCurrentPage]);

  // Clean up speech synthesis when component unmounts
  useEffect(() => {
    return () => {
      window.speechSynthesis.cancel();
    };
  }, []);

  const toggleNarration = () => {
    // Web Speech API requires voices to be loaded. Trigger a dummy call to load voices.
    if (window.speechSynthesis.getVoices().length === 0) {
      window.speechSynthesis.getVoices();
    }
    setIsNarrating(prev => !prev);
  };

  // Touch handlers for swipe gestures (mobile friendly)
  const handleTouchStart = (e) => {
    touchStartX.current = e.changedTouches[0].screenX;
  };

  const handleTouchEnd = (e) => {
    touchEndX.current = e.changedTouches[0].screenX;
    handleSwipeGesture();
  };

  const handleSwipeGesture = () => {
    const swipeThreshold = 50; // Minimum distance to register as swipe
    const difference = touchStartX.current - touchEndX.current;

    if (Math.abs(difference) > swipeThreshold) {
      if (difference > 0) {
        // Swiped left -> Next page
        nextPage();
      } else {
        // Swiped right -> Previous page
        prevPage();
      }
    }
  };

  // Mobile viewport tap navigation handler
  const handleContainerClick = (e) => {
    // Only enable side tap navigation on mobile viewports
    if (window.innerWidth > 768) return;

    // Ignore clicks on buttons or links
    if (e.target.closest('button') || e.target.closest('a')) return;

    const clickX = e.clientX;
    const width = window.innerWidth;

    if (clickX < width * 0.35) {
      prevPage();
    } else if (clickX > width * 0.65) {
      nextPage();
    }
  };

  // Get active layout content
  const isCover = pageIndex === 0;
  const currentImage = isCover ? book.coverImage : book.pages[pageIndex - 1].imageUrl;
  const currentText = isCover ? "" : book.pages[pageIndex - 1].text;

  // Calculate progress percentage
  const progressPercent = (pageIndex / totalPages) * 100;

  return (
    <div
      className="reader-container"
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      onClick={handleContainerClick}
    >
      {/* Floating navigation header */}
      <header className="reader-header">
        <button className="btn-back" onClick={onBack} aria-label="Tillbaka till bokhyllan">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="12" x2="5" y2="12"></line>
            <polyline points="12 19 5 12 12 5"></polyline>
          </svg>
          <span>Bokhylla</span>
        </button>

        {/* Audio reader trigger button */}
        <button
          className={`btn-audio ${isNarrating ? 'playing' : ''}`}
          onClick={toggleNarration}
          title={isNarrating ? "Stoppa uppläsning" : "Läs upp boken"}
          aria-label={isNarrating ? "Stoppa uppläsning" : "Läs upp boken"}
        >
          {isNarrating ? (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="4" width="16" height="16" rx="2" ry="2"></rect>
            </svg>
          ) : (
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
            </svg>
          )}
        </button>
      </header>

      {/* Book Spread Layout */}
      <main className="book-spread">
        <div className="book-spread-shadows"></div>

        {/* Left Side: Illustration */}
        <div className="page-left">
          {currentImage && (
            <img
              src={currentImage}
              alt={isCover ? `Omslag för ${book.title}` : `Illustration för sida ${pageIndex}`}
              className="page-image"
              key={currentImage} // Force remount for slide transition
            />
          )}
        </div>

        {/* Right Side: Text details */}
        <div className="page-right">
          {isCover ? (
            // Cover Page Text Spread
            <div className="story-text-body" style={{ flexDirection: 'column', justifyContent: 'center', alignItems: 'center', textAlign: 'center', flexGrow: 1 }}>
              <h1 style={{ fontFamily: 'var(--font-serif)', fontSize: '2.2rem', color: 'var(--color-text-dark)', marginBottom: '20px', lineHeight: 1.25 }}>
                {book.title}
              </h1>
              <button
                className="btn-open-book"
                onClick={nextPage}
                style={{ background: 'var(--color-wood-dark)', color: '#fff', padding: '12px 28px', borderRadius: '30px', border: 'none', fontSize: '1.05rem', fontWeight: '500', marginTop: '15px', display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}
              >
                Öppna boken
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                  <polyline points="12 5 19 12 12 19"></polyline>
                </svg>
              </button>
            </div>
          ) : (
            // Standard Page Text details
            <div className="story-text-body has-drop-cap" key={pageIndex}>
              {currentText}
            </div>
          )}

          {/* Page indicator footer */}
          <footer className="page-footer">
            <span className="book-title-footer">{book.title}</span>
            <span className="page-number">
              {isCover ? "Omslag" : `Sida ${pageIndex} av ${totalPages}`}
            </span>
          </footer>
        </div>

        {/* Desktop Side Arrows Overlay */}
        <button
          className="nav-arrow prev"
          onClick={prevPage}
          disabled={pageIndex === 0}
          aria-label="Föregående sida"
        >
          &#8249;
        </button>
        <button
          className="nav-arrow next"
          onClick={nextPage}
          disabled={pageIndex === totalPages}
          aria-label="Nästa sida"
        >
          &#8250;
        </button>
      </main>

      {/* Thin Bottom Progress Indicator */}
      <div className="reading-progress-container">
        <div className="progress-track">
          <div className="progress-bar" style={{ width: `${progressPercent}%` }}></div>
        </div>
      </div>
    </div>
  );
}

export default BookReader;
