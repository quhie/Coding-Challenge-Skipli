import React, { useState, useEffect } from 'react';
import { searchUsers } from '../services/githubService';
import UserCard from './UserCard';
import ProfileModal from './ProfileModal';

const Search = () => {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalCount, setTotalCount] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [searchStarted, setSearchStarted] = useState(false);
  const [customPageInput, setCustomPageInput] = useState('');
  const [showCustomPageInput, setShowCustomPageInput] = useState(false);

  useEffect(() => {
    // Animate cards when search results load
    if (searchResults && searchResults.length > 0) {
      const cards = document.querySelectorAll('.user-card');
      cards.forEach((card, index) => {
        setTimeout(() => {
          card.classList.add('animate-slide-up');
          card.style.opacity = 1;
        }, index * 50);
      });
    }
  }, [searchResults]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    
    setLoading(true);
    setError('');
    setSearchStarted(true);
    
    try {
      const data = await searchUsers(query, page, perPage);
      setSearchResults(data.items);
      setTotalCount(data.total_count);
      
      // Use pagination metadata from API if available
      if (data.pagination) {
        setTotalPages(data.pagination.total_pages);
      } else {
        setTotalPages(Math.ceil(data.total_count / perPage));
      }
    } catch (error) {
      console.error('Search error:', error);
      
      // Handle string error message
      const errorMessage = String(error);
      
      if (errorMessage.toLowerCase().includes('rate limit')) {
        setError('GitHub API rate limit exceeded. Please try again later.');
      } else {
        setError(errorMessage);
      }
      setSearchResults(null);
    } finally {
      setLoading(false);
    }
  };

  const handlePageChange = async (newPage) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    // Thêm hiệu ứng fade-out trước khi tải trang mới
    const resultsContainer = document.querySelector('.search-results-container');
    if (resultsContainer) {
      resultsContainer.classList.add('animate-fade-out');
      // Đợi hiệu ứng fade-out hoàn tất trước khi tải trang mới
      await new Promise(resolve => setTimeout(resolve, 300));
    }
    
    if (query.trim()) {
      setLoading(true);
      setError('');
      
      try {
        const data = await searchUsers(query, newPage, perPage);
        setSearchResults(data.items);
        setTotalCount(data.total_count);
        
        // Use pagination metadata from API if available
        if (data.pagination) {
          setTotalPages(data.pagination.total_pages);
        } else {
          setTotalPages(Math.ceil(data.total_count / perPage));
        }
      } catch (error) {
        console.error('Search error on page change:', error);
        
        // Handle string error message
        const errorMessage = String(error);
        
        if (errorMessage.toLowerCase().includes('rate limit')) {
          setError('GitHub API rate limit exceeded. Please try again later.');
        } else {
          setError(errorMessage);
        }
      } finally {
        setLoading(false);
        // Thêm hiệu ứng fade-in sau khi tải trang mới
        setTimeout(() => {
          const newResultsContainer = document.querySelector('.search-results-container');
          if (newResultsContainer) {
            newResultsContainer.classList.remove('animate-fade-out');
          }
        }, 100);
      }
    }
  };

  const handlePerPageChange = (e) => {
    setPerPage(Number(e.target.value));
    setPage(1);
    
    // Re-fetch with new per_page if we have a query
    if (query.trim() && searchResults) {
      handleSearch({preventDefault: () => {}});
    }
  };

  const handleCustomPageInputChange = (e) => {
    const value = e.target.value;
    if (/^[0-9]*$/.test(value)) {
      setCustomPageInput(value);
    }
  };

  const handleCustomPageSubmit = (e) => {
    e.preventDefault();
    const pageNumber = parseInt(customPageInput, 10);
    if (pageNumber >= 1 && pageNumber <= totalPages) {
      handlePageChange(pageNumber);
    }
    setShowCustomPageInput(false);
    setCustomPageInput('');
  };

  // Generate page numbers for pagination
  const getPageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      // Always show first page
      pageNumbers.push(1);
      
      // Calculate range of page numbers to show around current page
      let startPage = Math.max(2, page - Math.floor(maxVisiblePages / 2));
      let endPage = Math.min(totalPages - 1, startPage + maxVisiblePages - 3);
      
      // Adjust if we're near the beginning
      if (startPage === 2) {
        endPage = Math.min(totalPages - 1, maxVisiblePages - 1);
      }
      
      // Adjust if we're near the end
      if (endPage === totalPages - 1 && endPage - startPage < maxVisiblePages - 3) {
        startPage = Math.max(2, totalPages - maxVisiblePages + 2);
      }
      
      // Add ellipsis after first page if needed
      if (startPage > 2) {
        pageNumbers.push('...');
      }
      
      // Add page numbers
      for (let i = startPage; i <= endPage; i++) {
        pageNumbers.push(i);
      }
      
      // Add ellipsis before last page if needed
      if (endPage < totalPages - 1) {
        pageNumbers.push('...');
      }
      
      // Always show last page
      if (totalPages > 1) {
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-900 to-indigo-950 text-white">
      <header className="bg-gray-800/50 backdrop-blur-sm shadow-lg sticky top-0 z-10 border-b border-gray-700/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <div className="flex items-center">
            <svg className="w-8 h-8 text-blue-400 mr-2" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
            <h1 className="text-xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-indigo-300">GitHub Search</h1>
          </div>
          
          <button 
            onClick={() => setShowProfileModal(true)}
            className="flex items-center justify-center w-10 h-10 rounded-full bg-blue-600/20 hover:bg-blue-600/30 transition-all transform hover:scale-105 shadow-sm"
            aria-label="View profile"
          >
            <svg className="w-6 h-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
            </svg>
          </button>
        </div>
      </header>
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="max-w-3xl mx-auto mb-12 text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-4">Find GitHub Users</h2>
          <p className="text-gray-300 mb-8">Search for GitHub users by username, name, or email</p>
          
          <form onSubmit={handleSearch} className="relative">
            <div className="flex w-full max-w-xl mx-auto shadow-md rounded-lg overflow-hidden transition-all focus-within:shadow-lg">
              <input
                type="text"
                placeholder="Search GitHub users..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="flex-grow px-6 py-4 border-0 focus:ring-0 focus:outline-none text-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
                autoFocus
              />
              <button
                type="submit"
                disabled={loading || !query.trim()}
                className="px-6 py-4 bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-medium hover:from-blue-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-70 transition-all"
              >
                {loading ? (
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : (
                  <span className="flex items-center">
                    <svg className="w-5 h-5 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    Search
                  </span>
                )}
              </button>
            </div>
          </form>
        </div>
        
        {error && (
          <div className="animate-fade-in max-w-2xl mx-auto mb-8 flex items-center p-4 border-l-4 border-red-500 bg-red-900/20 rounded-r-md shadow-sm">
            <svg className="h-5 w-5 text-red-400 mr-3 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-red-300">{error}</span>
          </div>
        )}
        
        {searchResults && (
          <div className="mb-8 text-center animate-fade-in">
            <span className="inline-flex items-center px-4 py-2 rounded-full bg-blue-900/30 text-blue-300 text-sm font-medium border border-blue-700/30">
              Found {totalCount.toLocaleString()} users for "{query}"
            </span>
          </div>
        )}
        
        {loading && !searchResults && (
          <div className="flex flex-col items-center justify-center my-16 animate-fade-in">
            <div className="relative w-16 h-16 mb-4">
              <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-900 rounded-full"></div>
              <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
            </div>
            <p className="text-blue-300 font-medium">Searching GitHub...</p>
          </div>
        )}

        {searchStarted && !loading && (!searchResults || searchResults.length === 0) && (
          <div className="flex flex-col items-center justify-center my-16 animate-fade-in">
            <svg className="w-16 h-16 text-gray-600 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 20h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-300 mb-1">No users found</h3>
            <p className="text-gray-400">Try a different search term</p>
          </div>
        )}
        
        {searchResults && searchResults.length > 0 && (
          <div className="search-results-container animate-fade-in transition-opacity duration-300">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
              {searchResults.map((user, index) => (
                <div key={user.id} className="user-card opacity-0 animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                  <UserCard user={user} />
                </div>
              ))}
            </div>
          </div>
        )}
        
        {searchResults && searchResults.length > 0 && (
          <>
            <div className="mt-12 flex flex-col sm:flex-row justify-between items-center bg-gray-800/50 p-6 rounded-xl shadow-md border border-gray-700/30">
              <div className="mb-4 sm:mb-0 flex items-center">
                <label htmlFor="per-page" className="mr-3 text-gray-300 text-sm font-medium">Show:</label>
                <div className="relative">
                  <select
                    id="per-page"
                    value={perPage}
                    onChange={handlePerPageChange}
                    className="appearance-none border border-gray-600 rounded-md px-4 py-2.5 bg-gray-700 text-gray-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  >
                    {[10, 20, 30, 50].map(value => (
                      <option key={value} value={value}>
                        {value} user{value !== 1 ? 's' : ''}
                      </option>
                    ))}
                  </select>
                  <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {totalPages > 1 && (
                <div className="flex items-center justify-center w-full sm:w-auto my-4 sm:my-0">
                  <nav className="pagination-container flex items-center rounded-lg shadow-sm bg-gray-800 border border-gray-700" aria-label="Pagination">
                    <button
                      onClick={() => handlePageChange(1)}
                      disabled={page === 1 || loading}
                      className="pagination-button pagination-edge rounded-l-lg"
                      aria-label="First page"
                      title="First page"
                    >
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handlePageChange(page - 1)}
                      disabled={page === 1 || loading}
                      className="pagination-button"
                      aria-label="Previous page"
                      title="Previous page"
                    >
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                      </svg>
                    </button>
                    
                    <div className="pagination-numbers">
                      {getPageNumbers().map((pageNum, idx) => (
                        <button
                          key={idx}
                          onClick={() => typeof pageNum === 'number' && handlePageChange(pageNum)}
                          disabled={pageNum === '...' || pageNum === page || loading}
                          className={`pagination-number ${
                            pageNum === page
                              ? 'pagination-current'
                              : pageNum === '...'
                              ? 'pagination-ellipsis'
                              : ''
                          }`}
                          aria-current={pageNum === page ? "page" : undefined}
                          aria-label={pageNum === '...' ? "More pages" : `Page ${pageNum}`}
                          title={pageNum === '...' ? "More pages" : `Page ${pageNum}`}
                        >
                          {pageNum}
                        </button>
                      ))}
                    </div>
                    
                    {showCustomPageInput ? (
                      <form onSubmit={handleCustomPageSubmit} className="flex">
                        <input
                          type="text"
                          value={customPageInput}
                          onChange={handleCustomPageInputChange}
                          placeholder={`1-${totalPages}`}
                          className="pagination-page-input"
                          autoFocus
                          aria-label="Go to page"
                        />
                        <button 
                          type="submit" 
                          className="pagination-button pagination-go-button"
                          disabled={!customPageInput || parseInt(customPageInput, 10) < 1 || parseInt(customPageInput, 10) > totalPages}
                        >
                          Go
                        </button>
                        <button 
                          type="button" 
                          className="pagination-button"
                          onClick={() => setShowCustomPageInput(false)}
                        >
                          <svg className="w-4 h-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </form>
                    ) : (
                      <button 
                        className="pagination-button" 
                        onClick={() => setShowCustomPageInput(true)}
                        title="Go to page"
                        aria-label="Go to page"
                      >
                        <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                        </svg>
                      </button>
                    )}
                    
                    <button
                      onClick={() => handlePageChange(page + 1)}
                      disabled={page === totalPages || loading}
                      className="pagination-button"
                      aria-label="Next page"
                      title="Next page"
                    >
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </button>
                    
                    <button
                      onClick={() => handlePageChange(totalPages)}
                      disabled={page === totalPages || loading}
                      className="pagination-button pagination-edge rounded-r-lg"
                      aria-label="Last page"
                      title="Last page"
                    >
                      <svg className="w-5 h-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                      </svg>
                    </button>
                  </nav>
                </div>
              )}
              
              <div className="flex items-center justify-end text-sm text-gray-300">
                {totalCount > 0 && (
                  <div className="page-info bg-gray-800/80 px-4 py-2 rounded-lg shadow-sm border border-gray-700/50">
                    <span className="font-medium">Page {page}</span>
                    <span className="mx-2 text-gray-500">|</span>
                    <span>Total {totalPages} pages</span>
                    <span className="mx-2 text-gray-500">|</span>
                    <span>
                      {totalCount.toLocaleString()} results
                      {totalCount > perPage && (
                        <span className="ml-1 text-gray-400">
                          (Showing {((page - 1) * perPage) + 1} - {Math.min(page * perPage, totalCount)})
                        </span>
                      )}
                    </span>
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </main>
      
      {showProfileModal && <ProfileModal onClose={() => setShowProfileModal(false)} />}
    </div>
  );
};

export default Search; 