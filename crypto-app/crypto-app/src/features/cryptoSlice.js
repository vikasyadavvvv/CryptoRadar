import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';

// Fetching list of coins (Direct from CoinGecko & ExchangeRate API)
export const fetchCoins = createAsyncThunk('crypto/fetchCoins', async () => {
  const [coinsRes, ratesRes] = await Promise.all([
    fetch('https://api.coingecko.com/api/v3/coins/markets?vs_currency=usd&order=market_cap_desc&per_page=500&page=1&sparkline=false'),
    fetch('https://api.exchangerate-api.com/v4/latest/USD')
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

  return coinsWithConvertedPrices;
});

// Fetching coin details (still uses CoinGecko directly)
export const fetchCoinDetails = createAsyncThunk('crypto/fetchCoinDetails', async (coinId) => {
  const response = await fetch(
    `https://api.coingecko.com/api/v3/coins/${coinId}?localization=false`
  );
  if (!response.ok) {
    throw new Error('Failed to fetch coin details');
  }
  const data = await response.json();
  return data;
});

// Market chart (still uses CoinGecko directly)
export const fetchMarketChart = createAsyncThunk(
  'crypto/fetchMarketChart',
  async ({ coinId, currency = 'usd' }) => {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=${currency}&days=7`
    );
    const data = await response.json();
    return data.prices;
  }
);

// Redux slice for managing the state of crypto data
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
    // Action to update coin prices (for other manual updates, if needed)
    updateCoinPrice: (state, action) => {
      const updatedCoin = action.payload;
      const coinIndex = state.coins.findIndex(coin => coin.id === updatedCoin.id);
      if (coinIndex >= 0) {
        state.coins[coinIndex] = { ...state.coins[coinIndex], ...updatedCoin };
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

// Utility function to convert prices
export const convertPrice = (price, fromCurrency, toCurrency, exchangeRates) => {
  if (fromCurrency === toCurrency) return price;
  const usdPrice = price / exchangeRates[fromCurrency.toUpperCase()];
  const convertedPrice = usdPrice * exchangeRates[toCurrency.toUpperCase()];
  return convertedPrice;
};

export const { setCurrency, setSearchTerm, updateCoinPrice } = cryptoSlice.actions;

export default cryptoSlice.reducer;
