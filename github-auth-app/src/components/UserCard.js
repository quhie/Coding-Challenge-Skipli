import React, { useState, useEffect, useRef } from 'react';
import { getUserDetails } from '../services/githubService';
import { likeGithubProfile, isProfileLiked } from '../services/likeService';
import { useAuth } from '../context/AuthContext';

const UserCard = ({ user, showLikeButton = true }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [liking, setLiking] = useState(false);
  const [liked, setLiked] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [retryCount, setRetryCount] = useState(0);
  const [shouldLoad, setShouldLoad] = useState(false);
  const cardRef = useRef(null);
  
  const { currentUser } = useAuth();

  useEffect(() => {
    if (details || loading) return;

    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting) {
        setShouldLoad(true);
        observer.disconnect();
      }
    }, { threshold: 0.1 });

    if (cardRef.current) {
      observer.observe(cardRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, [details, loading]);

  useEffect(() => {
    if (user && user.login) {
      setLiked(isProfileLiked(user.login));
    }
  }, [user]);
  
  useEffect(() => {
    if (!shouldLoad) return;
    
    const fetchDetails = async (attempt = 0) => {
      if (attempt > 0) {
        const delay = Math.min(2000 * attempt, 10000);
        setErrorMessage(`Rate limit exceeded. Retrying in ${delay/1000}s...`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
      
      setLoading(true);
      if (attempt === 0) setErrorMessage('');
      
      try {
        const userDetails = await getUserDetails(user.login);
        setDetails(userDetails);
        setLiked(isProfileLiked(userDetails.login));
        setErrorMessage('');
        setRetryCount(0);
      } catch (error) {
        console.error('Error fetching user details:', error);
        
        const errorMessage = String(error);
        
        if (errorMessage.toLowerCase().includes('rate limit')) {
          if (attempt < 2) {
            setRetryCount(attempt + 1);
            fetchDetails(attempt + 1);
            return;
          }
          setErrorMessage('GitHub API rate limit exceeded. Please try again later.');
        } else {
          setErrorMessage(errorMessage);
        }
      } finally {
        setLoading(false);
      }
    };
    
    fetchDetails(0);
  }, [user.login, shouldLoad]);

  const handleLike = async () => {
    if (!currentUser || liking || !details) return;
    
    setLiking(true);
    try {
      await likeGithubProfile(currentUser.phoneNumber, details.login);
      setLiked(true);
    } catch (error) {
      console.error('Error liking profile:', error);
    } finally {
      setLiking(false);
    }
  };

  const displayData = details || user;

  // Function to get a color based on the username
  const getUsernameColor = (username) => {
    const colors = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
    const index = username.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
    return colors[index];
  };

  const usernameColor = getUsernameColor(displayData.login);

  return (
    <div 
      ref={cardRef} 
      className="bg-gray-800 rounded-xl shadow-md overflow-hidden transition-all duration-300 transform hover:shadow-xl hover:-translate-y-1 hover:scale-[1.02] h-[380px] flex flex-col border border-gray-700/30"
      style={{ animationDelay: '0.1s' }}
    >
      {loading ? (
        <div className="p-8 flex flex-col items-center justify-center h-full">
          <div className="relative w-16 h-16">
            <div className="absolute top-0 right-0 bottom-0 left-0 flex items-center justify-center">
              <svg className="animate-spin h-10 w-10 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
            </div>
          </div>
          <p className="mt-4 text-sm text-gray-300 font-medium">Loading profile...</p>
          {retryCount > 0 && (
            <p className="text-sm text-blue-400 mt-2">{errorMessage}</p>
          )}
        </div>
      ) : errorMessage ? (
        <div className="p-6 flex flex-col h-full">
          <div className="flex items-center justify-center mb-4">
            <svg className="h-10 w-10 text-amber-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <p className="text-amber-300 text-center mb-4">{errorMessage}</p>
          <div className="flex-grow flex flex-col items-center">
            <div className="flex justify-center">
              <img 
                src={displayData.avatar_url} 
                alt={`${displayData.login}'s avatar`}
                className="w-20 h-20 rounded-full border-2 border-gray-600 shadow-sm"
              />
            </div>
            <p className="text-center mt-3 font-medium text-gray-200">{displayData.login}</p>
            <div className="flex-grow"></div>
            <a 
              href={displayData.html_url} 
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full mt-4 text-center py-2 px-4 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded-md transition-colors shadow-sm"
            >
              View GitHub Profile
            </a>
          </div>
        </div>
      ) : (
        <>
          <div className="relative h-28">
            <div 
              className="h-full w-full bg-gradient-to-r from-blue-500/90 to-indigo-600/90" 
              style={{ 
                background: `linear-gradient(135deg, ${usernameColor}CC 0%, ${usernameColor}99 100%)`,
                boxShadow: 'inset 0 -10px 20px rgba(0,0,0,0.3)'
              }}
            ></div>
            
            <div className="absolute -bottom-10 left-1/2 transform -translate-x-1/2">
              <div className="rounded-full p-1 bg-gray-800 shadow-lg">
                <img 
                  src={displayData.avatar_url} 
                  alt={`${displayData.login}'s avatar`}
                  className="w-20 h-20 rounded-full object-cover border-2 border-gray-700 transition-transform hover:scale-105"
                  loading="lazy"
                />
              </div>
            </div>
            
            {showLikeButton && (
              <button 
                onClick={handleLike}
                disabled={liking || liked}
                className={`absolute top-3 right-3 p-2.5 rounded-full transition-all shadow-sm 
                  ${liked ? 'bg-red-900/50' : 'bg-gray-800 bg-opacity-90 hover:bg-opacity-100'} 
                  transform hover:scale-110 ${liked ? 'animate-pulse-once' : ''}`}
                aria-label={liked ? "Favorited" : "Add to favorites"}
                title={liked ? "Favorited" : "Add to favorites"}
              >
                {liking ? (
                  <svg className="animate-pulse w-5 h-5 text-red-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                ) : (
                  <svg className={`w-5 h-5 ${liked ? 'text-red-400 fill-current' : 'text-gray-300'}`} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={liked ? 0 : 2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                  </svg>
                )}
              </button>
            )}
          </div>

          <div className="px-4 pt-12 pb-6 flex flex-col flex-grow">
            <div className="flex flex-col items-center mb-3">
              <h3 className="text-xl font-bold text-gray-200 text-center">{displayData.login}</h3>
              {details?.name && (
                <p className="text-gray-400 text-sm mt-0.5 font-medium text-center truncate w-full">{details.name}</p>
              )}
            </div>
            
            {details?.bio ? (
              <div className="bg-gray-700/50 p-3 rounded-lg mb-4 mx-auto max-w-[90%] h-[60px] flex items-center">
                <p className="text-gray-300 text-sm text-center line-clamp-2 w-full">{details.bio}</p>
              </div>
            ) : (
              <div className="h-[60px] flex items-center justify-center">
                <p className="text-sm text-gray-500 italic">No bio available</p>
              </div>
            )}
            
            <div className="flex-grow"></div>
            
            <div className="flex items-center justify-center space-x-8 text-sm text-gray-400 mb-5">
              <div className="flex flex-col items-center">
                <span className="font-bold text-gray-200 text-lg">{details?.public_repos || 0}</span>
                <span className="text-xs uppercase tracking-wide">Repos</span>
              </div>
              
              <div className="w-px h-8 bg-gray-600"></div>
              
              <div className="flex flex-col items-center">
                <span className="font-bold text-gray-200 text-lg">{details?.followers || 0}</span>
                <span className="text-xs uppercase tracking-wide">Followers</span>
              </div>
            </div>
            
            <a 
              href={displayData.html_url} 
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center py-2.5 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white rounded-md transition-all shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transform hover:translate-y-[-1px]"
              style={{ background: `linear-gradient(to right, ${usernameColor}, ${usernameColor}DD)` }}
            >
              View GitHub Profile
            </a>
          </div>
        </>
      )}
    </div>
  );
};

export default UserCard; 