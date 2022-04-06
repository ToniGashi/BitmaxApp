import { useParams, useNavigate } from 'react-router-dom';
import { getTickerById, getTickerDataByDate, updateTickerFromCSV } from "../common/tickerFunctions";
import { LineChart } from "../components/Chart"
import { useState, useEffect, useRef} from "react";

const Ticker = () => {
  const MINIMAL_DATA_TO_DISPLAY = 5
  const NUMBER_OF_POINTS_IN_GRAPH = 6
  let { tickerId } = useParams();
  const [tickerData, setTickerData] = useState([])
  const [ticker, setTicker] = useState([]);
  const selectBox = useRef('');
  const filePicker = useRef(null);
  const tickerError = useRef(null);
  const navigate = useNavigate();

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

  const parseAndFormatCSV = (input) => {
    try {
      let isOkay = true;
      const headers = input.slice(0,input.indexOf('\r\n')).split(',');
      const rows = input.slice(input.indexOf('\r\n')+2).split('\r\n');

      const arr = rows.map(function (row) {
        const values = row.split(',');
        const el = headers.reduce(function (object, header, index) {
          if(header === 'name' && values[index]!==ticker.name) {
            isOkay=false;
          }
          object[header] = values[index];
          return object;
        }, {});
        return el;
      });

      if(!isOkay) {
        throw new Error('There was a field with the wrong name in the CSV file.');
      }

      return arr;
    } catch (err) {
      throw err;
    }
  }

  const addDataFromCSV = () => {
    const input = filePicker.current.files[0];
    const reader = new FileReader();
      reader.onload = async function (e) {
        try{
          const arrayOfData = parseAndFormatCSV(e.target.result);
          console.log([ticker.id, ticker.name, ticker.symbol, arrayOfData]);
          await updateTickerFromCSV(tickerId, ticker.name, ticker.symbol, arrayOfData);
          window.location.reload();
        } catch (err) {
          tickerError.current.innerHTML = err.message;
          throw err;
        }
      };
    reader.readAsText(input);
  }

  const changeSelect = async () => {
    var days=selectBox.current.value || 7; // Days you want to subtract. 0.04 is 1/24.
    var date = new Date();
    var last = new Date(date.getTime() - (days * 24 * 60 * 60 * 1000));
    const dataByDate = await getTickerDataByDate(tickerId, last);
    if(dataByDate.length>MINIMAL_DATA_TO_DISPLAY) {
      setTickerData(preparePoints(dataByDate.sort((a,b)=> new Date(a.date)-new Date(b.date)), NUMBER_OF_POINTS_IN_GRAPH));
    } else {
      setTickerData(dataByDate.sort((a,b)=> new Date(a.date)-new Date(b.date)));
    }
  }

  return (
    <div style={{display: 'flex'}}>
      <button onClick={() => {navigate('/', {replace:true})}} 
              style={{maxWidth: "20px"}}>
        <span>&#8249;</span>
      </button>
      <div style={{textAlign: 'center'}}>
        {
          (
            ticker.name==='XBTUSD' || ticker.name==='ETHUSD' || ticker.name==='LTCUSD' || tickerData.length>MINIMAL_DATA_TO_DISPLAY
          )
          ?
          <div>
            <h2>{ticker.symbol}</h2>
            <h3>{ticker.name}</h3>
            <div>
              {(tickerData && tickerData.length > 0) && <LineChart historicalData={tickerData} ticker={ticker}/> }
            </div>
          </div>
          :
          <div>
            <pre>Number of ticker data is: {tickerData.length}</pre>
            <h1> There is not enough data available to display. </h1>
            <input ref={filePicker} type="file" accept=".csv" onChange={addDataFromCSV}></input>
            <pre ref={tickerError} className="error-message"></pre>
          </div>
        }
        <select ref={selectBox} onChange={changeSelect} defaultValue='7'>
          <option value="0.04">Last Hour</option>
          <option value="1">Last Day</option>
          <option value="7">Last Week</option>
          <option value="31">Last Month</option>
          <option value="365">Last Year</option>
        </select>
      </div>
    </div>
  )
}
export default Ticker;
