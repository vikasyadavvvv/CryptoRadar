// src/pages/BottomTen.js
import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';

const BottomTen = () => {
  const coins = useSelector((state) => state.crypto.coins);
  const bottomTen = [...coins]
    .sort((a, b) => a.price_change_percentage_24h - b.price_change_percentage_24h)
    .slice(0, 10);

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold text-center mb-8 text-red-600 tracking-tight">
        📉 Top 10 Losers (24h)
      </h1>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-6">
        {bottomTen.map((coin) => (
          <Link
            to={`/coin/${coin.id}`}
            key={coin.id}
            className="bg-gradient-to-br from-red-100 to-red-200 p-5 rounded-2xl shadow-lg hover:shadow-xl transform hover:-translate-y-1 transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <img
                src={coin.image}
                alt={coin.name}
                className="w-12 h-12 rounded-full shadow-md border border-white"
              />
              <div className="flex-1">
                <p className="text-lg font-semibold text-gray-800">
                  {coin.name} <span className="text-gray-500">({coin.symbol.toUpperCase()})</span>
                </p>
                <p className="text-red-600 font-medium text-sm mt-1">
                  {coin.price_change_percentage_24h.toFixed(2)}%
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};

export default BottomTen;
