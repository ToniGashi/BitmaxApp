import { useParams } from 'react-router-dom';
import { getTickerById, getTickerDataByDate } from "../common/tickerFunctions";
import { LineChart } from "../components/Chart"
import { useState, useEffect, useRef} from "react";

const Ticker = () => {
  let { tickerId } = useParams();
  const [tickerData, setTickerData] = useState([])
  const [ticker, setTicker] = useState([]);
  const selectBox = useRef('');

  useEffect(() => {
    changeSelect();
  }, [])

  useEffect(() => {
    if(ticker.length < 1) {
      async function setTick () {
        const data = await getTickerById(tickerId);
        setTicker(data[0]);
      }
      setTick();
    }
  }, []);

  const preparePoints = (tickers, nrOfPoints) => { // array of tickers and number of points we would like to show.
    const newArray = [];
    const jumpDistance = Math.floor(tickers.length/nrOfPoints);
    let i = 0;
    while(i<nrOfPoints-1) {
      newArray.push(tickers[i*jumpDistance]);
      i++;
    }
    newArray.push(tickers[tickers.length-1]);
    return newArray;
  }

  const changeSelect = async () => {
    var days=selectBox.current.value || 0.04; // Days you want to subtract. 0.04 is 1/24.
    var date = new Date();
    var last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
    setTickerData(preparePoints(await getTickerDataByDate(tickerId, last), 20));
    console.log(tickerData);
  }

  return (
    <div style={{display: 'flex'}}>
      <div style={{textAlign: 'center'}}>
        {
          (
            ticker.name==='XBTUSD' || ticker.name==='ETHUSD' || ticker.name==='LTCUSD'
          )
          ?
          <div>
            <h2>{ticker.symbol}</h2>
            <h3>{ticker.name}</h3>
            <select ref={selectBox} onChange={changeSelect}>
              <option value="0.04">Last Hour</option>
              <option value="1">Last Day</option>
              <option value="7">Last Week</option>
              <option value="31">Last Month</option>
              <option value="365">Last Year</option>
            </select>
            <div>
              {(tickerData && tickerData.length > 0) && <LineChart historicalData={tickerData} ticker={ticker}/> }
            </div>
          </div>
          :
          <h1> This ticker was created by you and we can not display it's data at the moment</h1>
        }
      </div>
    </div>
  )
}
export default Ticker;
