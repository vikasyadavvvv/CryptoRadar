import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
  fetchCoins,
  setCurrency,
  setSearchTerm,
  selectFilteredCoins
} from '../features/cryptoSlice';
import { Link } from 'react-router-dom';
import Spinner from '../components/Spinner';

const Home = () => {
  const dispatch = useDispatch();
  const { status, error, currency } = useSelector((state) => state.crypto);
  const filteredCoins = useSelector(selectFilteredCoins);

  useEffect(() => {
    dispatch(fetchCoins());
  }, [dispatch]);

  const handleSearchChange = (e) => {
    dispatch(setSearchTerm(e.target.value));
  };

  const handleCurrencyChange = (e) => {
    dispatch(setCurrency(e.target.value));
  };

  const getPriceInSelectedCurrency = (coin) => {
    switch (currency) {
      case 'inr':
        return coin.price_inr;
      case 'eur':
        return coin.price_eur;
      case 'usd':
      default:
        return coin.current_price;
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-4xl font-extrabold text-center text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-500 mb-8">
        🚀 Explore the Crypto World
      </h1>

      {/* Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        {/* Currency Selector */}
        <div className="flex items-center gap-2">
          <label htmlFor="currency" className="font-semibold text-lg text-gray-700">Currency:</label>
          <select
            id="currency"
            value={currency}
            onChange={handleCurrencyChange}
            className="p-2 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-yellow-400"
          >
            <option value="usd">USD</option>
            <option value="inr">INR</option>
            <option value="eur">EUR</option>
          </select>
        </div>

        {/* Search */}
        <input
          type="text"
          placeholder="🔍 Search a coin..."
          onChange={handleSearchChange}
          className="w-full md:w-80 p-2 rounded-md border shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        />
      </div>

      {/* Loading / Error / Data */}
      {status === 'loading' && <Spinner />}
      {status === 'failed' && <p className="text-red-500 text-center font-semibold">{error}</p>}

      {status === 'succeeded' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {filteredCoins.map((coin) => (
            <Link
              to={`/coin/${coin.id}`}
              key={coin.id}
              className="bg-white rounded-2xl shadow-md hover:shadow-xl p-5 transition-transform duration-300 hover:-translate-y-1 flex flex-col items-center text-center"
            >
              <img src={coin.image} alt={coin.name} className="w-16 h-16 mb-3" />
              <h2 className="text-lg font-bold text-gray-800 mb-1">{coin.name}</h2>
              <p className="text-sm text-gray-500 mb-2">({coin.symbol.toUpperCase()})</p>
              <span className="text-green-600 font-semibold text-lg">
                {getPriceInSelectedCurrency(coin).toLocaleString()} {currency.toUpperCase()}
              </span>
              {coin.price_change_percentage_24h && (
                <span className={`mt-2 text-xs font-semibold px-2 py-1 rounded-full ${coin.price_change_percentage_24h >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-600'}`}>
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </span>
              )}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

export default Home;
