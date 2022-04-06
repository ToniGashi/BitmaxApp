import axios from "../axios/axios";

export const getTickerById = async (tickerId) => {
  try {
    const ticker = await axios.get('/ticker-management/ticker', { params: { tickerId: tickerId } });
    return ticker.data.message;
  } catch (err) {
    console.log(err.message);
  }
}

export const getTickerDataByDate = async (tickerId, selectBoxValue) => {
  try {
    const ticker = await axios.get('/ticker-management/tickerDataByDate', { params: { tickerId: tickerId, selectBoxValue: selectBoxValue } });
    return ticker.data.message;
  } catch (err) {
    console.log(err.message);
  }
}

export const getTicker = async (tickerId) => {
  try {
    const ticker = await axios.get('/ticker-management/tickers', {
      tickerId: tickerId
    })
    return ticker.data.message;
  } catch (err) {
    console.log(err.message);
  }
}

export const createTicker = async (newData) => {
  const { price, name, symbol } = newData;
  try {
    await axios.post('/ticker-management/tickers', {
      price, 
      symbol,
      name
    })
  } catch (err) {
    console.log(err.message);
  }
}

export const updateTicker = async (newData) => {
  const { id:newId, price:newPrice, name:newName, symbol:newSymbol } = newData;
  try {
    await axios.put('/ticker-management/tickers', {
      id:newId, 
      price: newPrice,
      name: newName,
      symbol: newSymbol
    })
  } catch (err) {
    console.log(err.message);
  }
}

export const updateTickerFromCSV = async (id, name, symbol, arrayOfData) => { //newData includes the price and Date for the ticker
  try {
    const result = await axios.post('/ticker-management/tickerDataFromCSV', { 
      id,
      name,
      symbol,
      arrayOfData
    });
    return result.data.message;
  } catch (err) {
    console.log(err.message);
    throw new Error('Error fetching ticker data');
  }
}

export const deleteTicker = async (oldData) => {
  const { id } = oldData;
  try {
    await axios.delete('/ticker-management/tickers', {
      data: {
        id: id
      }
    })
  } catch (err) {
    console.log(err.message);
  }
}

export const getTickerData = async (tickerId) => {
  try {
    const result = await axios.get('/ticker-management/tickerData', { params: { tickerId: tickerId } });
    return result.data.message;
  } catch (err) {
    console.log(err.message);
    throw new Error('Error fetching ticker data');
  }
}
