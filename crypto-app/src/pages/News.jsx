import React, { useEffect, useState } from 'react';
import Spinner from '../components/Spinner';

const News = () => {
  const [newsData, setNewsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          'https://newsapi.org/v2/everything?q=cryptocurrency&apiKey=9144889b89aa4c72adbbfa4f88c92f7d'
        );
        const data = await response.json();
        setNewsData(data.articles);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching news:', error);
        setLoading(false);
      }
    };

    fetchNews();
  }, []);

  if (loading) {
    return <div className="text-center py-12 text-xl"><Spinner /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <h1 className="text-4xl font-bold text-center mb-10 bg-gradient-to-r from-yellow-400 to-pink-500 text-transparent bg-clip-text">
        🚀 Latest Cryptocurrency News
      </h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        {newsData.map((article, index) => (
          <a
            key={index}
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-white dark:bg-gray-800 rounded-xl shadow-lg hover:shadow-2xl transition-shadow duration-300 transform hover:-translate-y-1 group"
          >
            <img
              src={article.urlToImage || 'https://via.placeholder.com/400x200'}
              alt={article.title}
              className="w-full h-48 object-cover rounded-t-xl"
            />
            <div className="p-5">
              <h3 className="text-xl font-semibold text-gray-800 dark:text-white mb-2 line-clamp-2">
                {article.title}
              </h3>
              <p className="text-sm text-gray-600 dark:text-gray-300 mb-4 line-clamp-3">
                {article.description || 'No description available.'}
              </p>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {new Date(article.publishedAt).toLocaleDateString()}
              </span>
            </div>
          </a>
        ))}
      </div>
    </div>
  );
};

export default News;

