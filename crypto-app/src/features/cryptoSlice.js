import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Utility function: fetch with retry + 6-second timeout
const fetchWithRetry = async (url, options = {}, retries = 5, retryDelay = 5000, timeout = 6000) => {
  const fetchWithTimeout = (resource, options = {}) => {
    return Promise.race([
      fetch(resource, options),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Request timed out after ' + timeout + 'ms')), timeout)
      ),
    ]);
  };

  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const response = await fetchWithTimeout(url, options);

      if (response.status === 429) {
        if (attempt < retries - 1) {
          const waitTime = retryDelay * Math.pow(2, attempt); // Exponential backoff
          console.warn(`429 received. Retrying in ${waitTime / 1000} seconds (Attempt ${attempt + 1}/${retries})...`);
          await new Promise((resolve) => setTimeout(resolve, waitTime));
          continue;
        } else {
          throw new Error('Too many requests (429) even after retries');
        }
      }

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      return response; // Successful response

    } catch (error) {
      if (attempt === retries - 1) {
        console.error(`Fetch failed after ${retries} retries:`, error);
        throw error;
      } else {
        const waitTime = retryDelay * Math.pow(2, attempt);
        console.warn(`Fetch error: ${error.message}. Retrying in ${waitTime / 1000} seconds (Attempt ${attempt + 1}/${retries})...`);
        await new Promise((resolve) => setTimeout(resolve, waitTime));
      }
    }
  }
  throw new Error('Failed after multiple retries');
};

// Fetching list of coins (Direct from CoinGecko & ExchangeRate API)
export const fetchCoins = createAsyncThunk('crypto/fetchCoins', async () => {
  const cacheKey = 'cachedCoins';
  const cacheExpiry = 60 * 1000; // Cache for 1 minute

  // Check if there's cached data in localStorage
  const cached = JSON.parse(localStorage.getItem(cacheKey) || '{}');
  if (cached.timestamp && Date.now() - cached.timestamp < cacheExpiry) {
    console.log('Returning cached data');
    return cached.data;
  }

  // Fetch data if no valid cache
  const [coinsRes, ratesRes] = await Promise.all([
    fetchWithRetry('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=100&page=1&sparkline=false'),
    fetchWithRetry('https://api.exchangerate-api.com/v4/latest/USD')
  ]);

  if (!coinsRes.ok || !ratesRes.ok) {
    throw new Error('Failed to fetch crypto data or exchange rates');
  }

  const coins = await coinsRes.json();
  const ratesData = await ratesRes.json();
  const inrRate = ratesData.rates.INR;
  const eurRate = ratesData.rates.EUR;

  const coinsWithConvertedPrices = coins.map((coin) => ({
    ...coin,
    price_inr: coin.current_price * inrRate,
    price_eur: coin.current_price * eurRate,
  }));

  // Save to cache
  localStorage.setItem(cacheKey, JSON.stringify({
    timestamp: Date.now(),
    data: coinsWithConvertedPrices,
  }));

  return coinsWithConvertedPrices;
});

// Fetching coin details (CoinGecko)
export const fetchCoinDetails = createAsyncThunk('crypto/fetchCoinDetails', async (coinId) => {
  const response = await fetchWithRetry(
    `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch coin details');
  }
  const data = await response.json();
  return data;
});

// Fetching market chart (CoinGecko)
export const fetchMarketChart = createAsyncThunk(
  'crypto/fetchMarketChart',
  async ({ coinId, currency = 'usd' }) => {
    const response = await fetchWithRetry(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency}&days=7`
    );
    if (!response.ok) {
      throw new Error('Failed to fetch market chart data');
    }
    const data = await response.json();
    return data.prices;
  }
);

// Redux slice for crypto
const cryptoSlice = createSlice({
  name: 'crypto',
  initialState: {
    coins: [],
    status: 'idle',
    error: null,
    selectedCoin: null,
    currency: 'usd',
    exchangeRates: {},
    searchTerm: '',
    marketChart: [],
  },
  reducers: {
    setCurrency: (state, action) => {
      state.currency = action.payload;
    },
    setSearchTerm: (state, action) => {
      state.searchTerm = action.payload;
    },
    updateCoinPrice: (state, action) => {
      const updatedCoin = action.payload;
      const index = state.coins.findIndex(coin => coin.id === updatedCoin.id);
      if (index !== -1) {
        state.coins[index] = { ...state.coins[index], ...updatedCoin };
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCoins.pending, (state) => {
        state.status = 'loading';
      })
      .addCase(fetchCoins.fulfilled, (state, action) => {
        state.status = 'succeeded';
        state.coins = action.payload;
      })
      .addCase(fetchCoins.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.error.message;
      })
      .addCase(fetchCoinDetails.fulfilled, (state, action) => {
        state.selectedCoin = action.payload;
      })
      .addCase(fetchMarketChart.fulfilled, (state, action) => {
        state.marketChart = action.payload;
      });
  },
});

// Selector to filter coins based on search term
export const selectFilteredCoins = (state) => {
  const { coins, searchTerm } = state.crypto;
  if (!searchTerm) return coins;
  return coins.filter(
    (coin) =>
      coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
  );
};

// Utility to convert prices
export const convertPrice = (price, fromCurrency, toCurrency, exchangeRates) => {
  if (fromCurrency === toCurrency) return price;
  const usdPrice = price / exchangeRates[fromCurrency.toUpperCase()];
  const convertedPrice = usdPrice * exchangeRates[toCurrency.toUpperCase()];
  return convertedPrice;
};

export const { setCurrency, setSearchTerm, updateCoinPrice } = cryptoSlice.actions;

export default cryptoSlice.reducer;
