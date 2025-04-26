import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { Line } from 'react-chartjs-2';
import Spinner from '../components/Spinner';
import {
  Chart as ChartJS,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement,
  Tooltip,
  Legend,
  Filler   // 🛠️ Added Filler here
} from 'chart.js';
import { fetchCoinDetails, fetchMarketChart, setCurrency } from '../features/cryptoSlice';

// 🛠️ Register Filler plugin along with others
ChartJS.register(LineElement, CategoryScale, LinearScale, PointElement, Tooltip, Legend, Filler);

const CoinDetail = () => {
  const dispatch = useDispatch();
  const { coinId } = useParams();
  const { selectedCoin, marketChart, status, error, currency } = useSelector((state) => state.crypto);

  useEffect(() => {
    if (coinId) {
      dispatch(fetchCoinDetails(coinId));
      dispatch(fetchMarketChart({ coinId, currency }));
    }
  }, [dispatch, coinId, currency]);

  const conversionRates = { usd: 1, inr: 83, eur: 0.93 };

  const getConvertedPrice = (usdValue) => {
    if (!usdValue) return 'N/A';
    const rate = conversionRates[currency] || 1;
    const converted = usdValue * rate;
    return `${converted.toLocaleString(undefined, { maximumFractionDigits: 2 })} ${currency.toUpperCase()}`;
  };

  const handleCurrencyChange = (e) => {
    dispatch(setCurrency(e.target.value));
  };

  if (status === 'loading') return <div className="flex justify-center items-center h-64"><Spinner /></div>;
  if (status === 'failed') return <p className="text-center text-red-500">{error}</p>;
  if (!selectedCoin) return <div className="text-center"><Spinner /></div>;

  const { name, symbol, market_data, image } = selectedCoin;

  const chartData = {
    labels: marketChart.map(([timestamp]) => new Date(timestamp).toLocaleDateString()),
    datasets: [
      {
        label: `Price (${currency.toUpperCase()})`,
        data: marketChart.map(([_, price]) => (price * (conversionRates[currency] || 1)).toFixed(2)),
        fill: true, // 🛠️ this needs Filler plugin
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        borderColor: '#3b82f6',
        pointBackgroundColor: '#2563eb',
        tension: 0.3,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#4b5563',
          font: {
            weight: 'bold',
          },
        },
      },
    },
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      {/* Currency Selector */}
      <div className="mb-6 text-center">
        <label htmlFor="currency" className="text-lg font-medium mr-3">Select Currency:</label>
        <select
          id="currency"
          value={currency}
          onChange={handleCurrencyChange}
          className="p-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
        >
          <option value="usd">USD</option>
          <option value="inr">INR</option>
          <option value="eur">EUR</option>
        </select>
      </div>

      {/* Header */}
      <div className="flex items-center justify-center mb-8 space-x-4">
        <img src={image?.large} alt={name} className="w-20 h-20 rounded-full shadow-md" />
        <div>
          <h1 className="text-4xl font-bold text-gray-800">{name}</h1>
          <span className="inline-block mt-1 px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full uppercase tracking-wide">
            {symbol}
          </span>
        </div>
      </div>

      {/* Info & Chart Section */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Info Block */}
        <div className="bg-white rounded-xl shadow-md p-5 space-y-3">
          <h2 className="text-2xl font-semibold mb-4 text-blue-700">Coin Statistics</h2>
          <p><strong>Current Price:</strong> {getConvertedPrice(market_data?.current_price?.usd)}</p>
          <p><strong>1h %:</strong> {market_data?.price_change_percentage_1h_in_currency?.[currency]?.toFixed(2)}%</p>
          <p><strong>24h %:</strong> {market_data?.price_change_percentage_24h_in_currency?.[currency]?.toFixed(2)}%</p>
          <p><strong>7d %:</strong> {market_data?.price_change_percentage_7d_in_currency?.[currency]?.toFixed(2)}%</p>
          <p><strong>30d %:</strong> {market_data?.price_change_percentage_30d_in_currency?.[currency]?.toFixed(2)}%</p>
          <p><strong>1y %:</strong> {market_data?.price_change_percentage_1y_in_currency?.[currency]?.toFixed(2)}%</p>
          <hr />
          <p><strong>Market Cap:</strong> {getConvertedPrice(market_data?.market_cap?.usd)}</p>
          <p><strong>24h Volume:</strong> {getConvertedPrice(market_data?.total_volume?.usd)}</p>
          <p><strong>Circulating Supply:</strong> {market_data?.circulating_supply?.toLocaleString()}</p>
          <p><strong>Total Supply:</strong> {market_data?.total_supply?.toLocaleString() || 'N/A'}</p>
          <p><strong>Max Supply:</strong> {market_data?.max_supply?.toLocaleString() || 'N/A'}</p>
          <p><strong>All-Time High:</strong> {getConvertedPrice(market_data?.ath?.usd)} ({new Date(market_data?.ath_date?.usd).toLocaleDateString()})</p>
          <p><strong>All-Time Low:</strong> {getConvertedPrice(market_data?.atl?.usd)} ({new Date(market_data?.atl_date?.usd).toLocaleDateString()})</p>
        </div>

        {/* Chart Block */}
        <div className="bg-white rounded-xl shadow-md p-5">
          <h3 className="text-2xl font-semibold mb-4 text-blue-700">7-Day Price Chart</h3>
          <Line data={chartData} options={chartOptions} />
        </div>
      </div>
    </div>
  );
};

export default CoinDetail;


