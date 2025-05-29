import React, { useState, useEffect, Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { useAuth } from '../context/AuthContext';
import { getLikedProfiles } from '../services/likeService';
import UserCard from './UserCard';

const ProfileModal = ({ onClose }) => {
  const [likedProfiles, setLikedProfiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { currentUser, logout } = useAuth();
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProfiles, setTotalProfiles] = useState(0);
  const profilesPerPage = 4; // Number of profiles to display per page

  useEffect(() => {
    const fetchLikedProfiles = async () => {
      setLoading(true);
      setError('');
      try {
        // First, get basic info to know the total number of profiles
        const basicResponse = await getLikedProfiles(currentUser.phoneNumber, { basic: true });
        
        if (Array.isArray(basicResponse)) {
          setTotalProfiles(basicResponse.length);
          
          if (basicResponse.length > 0) {
            // Then get detailed info only for the first page
            const detailedProfiles = await getLikedProfiles(currentUser.phoneNumber, {
              page: currentPage,
              limit: profilesPerPage
            });
            
            setLikedProfiles(basicResponse); // Store all basic info
            
            // Update detailed information for current profiles
            if (Array.isArray(detailedProfiles)) {
              const updatedProfiles = [...basicResponse];
              const detailsMap = new Map(detailedProfiles.map(p => [p.login, p]));
              
              // Update detailed info in the basic profiles array
              for (let i = 0; i < updatedProfiles.length; i++) {
                const detailedInfo = detailsMap.get(updatedProfiles[i].login);
                if (detailedInfo) {
                  updatedProfiles[i] = detailedInfo;
                }
              }
              
              setLikedProfiles(updatedProfiles);
            }
          }
        } else {
          setError('Could not load favorite GitHub users');
          console.error('Expected array of profiles but got:', basicResponse);
        }
      } catch (error) {
        console.error('Error fetching liked profiles:', error);
        setError(String(error));
      } finally {
        setLoading(false);
      }
    };

    fetchLikedProfiles();
  }, [currentUser, currentPage, profilesPerPage]);

  // Calculate profiles to display for current page
  const indexOfLastProfile = currentPage * profilesPerPage;
  const indexOfFirstProfile = indexOfLastProfile - profilesPerPage;
  const currentProfiles = likedProfiles.slice(indexOfFirstProfile, indexOfLastProfile);

  // Override paginate method to load data when changing pages
  const paginate = async (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo(0, 0);
    
    setLoading(true);
    try {
      // Get detailed info for new page
      const detailedProfiles = await getLikedProfiles(currentUser.phoneNumber, {
        page: pageNumber,
        limit: profilesPerPage
      });
      
      if (Array.isArray(detailedProfiles)) {
        // Update detailed info for profiles on current page
        const updatedProfiles = [...likedProfiles];
        const startIndex = (pageNumber - 1) * profilesPerPage;
        
        for (let i = 0; i < detailedProfiles.length; i++) {
          if (startIndex + i < updatedProfiles.length) {
            updatedProfiles[startIndex + i] = detailedProfiles[i];
          }
        }
        
        setLikedProfiles(updatedProfiles);
      }
    } catch (error) {
      console.error('Error fetching profiles for page:', error);
      setError(`Could not load data for page ${pageNumber}`);
    } finally {
      setLoading(false);
    }
  };

  // Create page numbers to display
  const pageNumbers = [];
  for (let i = 1; i <= Math.ceil(totalProfiles / profilesPerPage); i++) {
    pageNumbers.push(i);
  }

  // Handle sign out
  const handleSignOut = () => {
    logout();
    onClose();
  };

  return (
    <Transition appear show={true} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm" />
        </Transition.Child>

        <div className="fixed inset-0 overflow-y-auto">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="w-full max-w-3xl transform overflow-hidden rounded-2xl bg-gray-800 p-6 text-left align-middle shadow-xl transition-all border border-gray-700/30">
                <div className="flex justify-between items-center mb-6 border-b border-gray-700 pb-4">
                  <div className="flex items-center">
                    <div className="bg-blue-600 rounded-full p-2 mr-3">
                      <svg className="w-6 h-6 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                      </svg>
                    </div>
                    <Dialog.Title
                      as="h3"
                      className="text-xl font-semibold leading-6 text-gray-200"
                    >
                      Your Profile
                    </Dialog.Title>
                  </div>
                  <button
                    type="button"
                    onClick={onClose}
                    className="rounded-full p-1.5 bg-gray-700 text-gray-400 hover:text-gray-200 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all"
                    aria-label="Close"
                  >
                    <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                <div className="bg-gradient-to-r from-blue-900/30 to-indigo-900/30 p-4 rounded-xl mb-6 animate-fade-in border border-blue-800/30">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm text-gray-400 mb-1">Phone Number</p>
                      <p className="font-semibold text-gray-200">{currentUser?.phoneNumber}</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleSignOut}
                      className="px-4 py-2 flex items-center rounded-lg text-sm font-medium text-red-400 hover:text-white hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 focus:ring-offset-gray-800 transition-all"
                    >
                      <svg className="h-4 w-4 mr-1.5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>

                <div className="mb-4 animate-slide-up">
                  <div className="flex items-center mb-5">
                    <h4 className="text-md font-semibold text-gray-200">
                      Favorite GitHub Profiles 
                    </h4>
                    {totalProfiles > 0 && 
                      <span className="ml-2 text-xs text-white font-medium bg-blue-600 rounded-full px-2 py-0.5">
                        {totalProfiles}
                      </span>
                    }
                  </div>
                  
                  {loading ? (
                    <div className="flex flex-col items-center justify-center py-10">
                      <div className="relative w-14 h-14">
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-indigo-900 rounded-full"></div>
                        <div className="absolute top-0 left-0 w-full h-full border-4 border-t-blue-400 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
                      </div>
                      <p className="mt-4 text-sm text-gray-400">Loading your favorite profiles...</p>
                    </div>
                  ) : error ? (
                    <div className="text-center p-6 bg-red-900/20 text-red-300 rounded-xl border border-red-800/30">
                      <svg className="w-10 h-10 mx-auto text-red-400 mb-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                      </svg>
                      <p className="font-medium">{error}</p>
                    </div>
                  ) : likedProfiles.length > 0 ? (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                        {currentProfiles.map((profile, index) => (
                          <div 
                            key={profile.id} 
                            className="transform transition-all duration-300" 
                            style={{ animationDelay: `${index * 100}ms` }}
                          >
                            <UserCard 
                              user={profile} 
                              showLikeButton={false} 
                            />
                          </div>
                        ))}
                      </div>
                      
                      {/* Pagination with dark theme */}
                      {totalProfiles > profilesPerPage && (
                        <div className="flex justify-center mt-8">
                          <nav className="flex items-center justify-between bg-gray-800 px-4 py-3 rounded-xl shadow-sm border border-gray-700">
                            <button
                              onClick={() => paginate(Math.max(1, currentPage - 1))}
                              disabled={currentPage === 1}
                              className={`flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                                currentPage === 1 
                                  ? 'text-gray-600 cursor-not-allowed' 
                                  : 'text-gray-300 hover:bg-gray-700'
                              }`}
                            >
                              <svg className="h-4 w-4 mr-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                              </svg>
                              Previous
                            </button>
                            
                            <div className="hidden md:flex space-x-1">
                              {pageNumbers.map(number => (
                                <button
                                  key={number}
                                  onClick={() => paginate(number)}
                                  className={`px-3 py-1 rounded-md text-sm font-medium ${
                                    currentPage === number
                                      ? 'bg-blue-600 text-white' 
                                      : 'text-gray-300 hover:bg-gray-700'
                                  }`}
                                >
                                  {number}
                                </button>
                              ))}
                            </div>
                            
                            <button
                              onClick={() => paginate(Math.min(pageNumbers.length, currentPage + 1))}
                              disabled={currentPage === pageNumbers.length}
                              className={`flex items-center px-3 py-1 rounded-md text-sm font-medium ${
                                currentPage === pageNumbers.length 
                                  ? 'text-gray-600 cursor-not-allowed' 
                                  : 'text-gray-300 hover:bg-gray-700'
                              }`}
                            >
                              Next
                              <svg className="h-4 w-4 ml-1" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          </nav>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="text-center p-10 bg-gray-700/30 rounded-xl border border-gray-700">
                      <svg className="w-12 h-12 mx-auto text-gray-500 mb-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                      <p className="text-gray-300 font-medium mb-2">No favorite profiles yet</p>
                      <p className="text-gray-400 text-sm">Search and like GitHub profiles to add them here</p>
                    </div>
                  )}
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

export default ProfileModal; 