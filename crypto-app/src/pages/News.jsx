import React, { useEffect, useState } from "react";

const News = () => {
  const [articles, setArticles] = useState([]);
  const [expanded, setExpanded] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const response = await fetch(
          "https://content.guardianapis.com/search?section=technology&q=cryptocurrency%20OR%20bitcoin%20OR%20blockchain&show-fields=thumbnail,trailText&order-by=newest&page-size=30&api-key=6471680b-d8b3-43e9-b642-cf4090d96da4"
        );
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

        const data = await response.json();
        setArticles(data.response.results);
      } catch (error) {
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  const handleToggle = (index) => {
    setExpanded(expanded === index ? null : index);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-4xl font-extrabold text-center text-gray-800 mb-10 underline decoration-blue-500 underline-offset-8">
        Latest Crypto News
      </h2>

      {loading && <div className="text-center text-gray-500">Loading...</div>}
      {error && <div className="text-center text-red-500">{`Error: ${error}`}</div>}
      {articles.length === 0 && !loading && !error ? (
        <p className="text-center text-gray-500">No news available</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
          {articles.map((article, index) => (
            <div
              key={index}
              className="bg-white p-6 rounded-2xl shadow-xl hover:shadow-2xl transform hover:-translate-y-1 transition duration-300 border border-gray-100"
            >
              <a
                href={article.webUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="block mb-4"
              >
                <img
                  src={article.fields?.thumbnail || 'https://via.placeholder.com/300'}
                  alt={article.webTitle}
                  className="w-full h-52 object-cover rounded-xl hover:scale-105 transition-transform duration-300"
                  onError={(e) => (e.target.src = 'https://via.placeholder.com/300')}
                />
              </a>

              <h3 className="text-lg font-semibold text-gray-800 line-clamp-2 mb-2">{article.webTitle}</h3>

              <p className="text-sm text-gray-600 transition-all ease-in-out duration-300">
                {expanded === index ? (
                  <span>{article.fields?.trailText}</span>
                ) : (
                  <span>
                    {article.fields?.trailText?.length > 150
                      ? `${article.fields.trailText.slice(0, 150)}...`
                      : article.fields?.trailText}
                  </span>
                )}
              </p>

              <button
                className="text-sm text-blue-600 mt-2 hover:underline font-medium"
                onClick={() => handleToggle(index)}
              >
                {expanded === index ? "Read Less" : "Read More"}
              </button>

              <div className="mt-4 text-xs text-right text-gray-400">
                {new Date(article.webPublicationDate).toLocaleString("en-US", {
                  dateStyle: "medium",
                  timeStyle: "short",
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default News;
