import React, { useState, useRef, useEffect } from "react";
import MaterialTable from "@material-table/core";
import tableIcons from "./MaterialTableIcons";
import { useCookies } from "react-cookie";
import './App.css';
import { io } from "socket.io-client";

const axiosLib = require('axios');

const axios = axiosLib.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

const App = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [socket, setSocket] = useState(null);
  const [tickers, setTickers] = useState([]);
  const [cookies, setCookies] = useCookies(['isLoggedIn']);
  const [columns, setColumns] = useState([
    {title: "symbol", field: "symbol"},
    {title: "name", field: "name"},
    {title: "price", field: "price", type:'numeric'}
  ]);
  const logEmail = useRef(null);
  const logPassword = useRef(null);
  const createEmail = useRef(null);
  const createPassword = useRef(null);
  const notifyContainer = useRef(null);
  const notifyType = useRef(null);
  const logError = useRef(null);
  const createError = useRef(null);

  useEffect(() => {
    if(socket) {
      socket.on('message', async (message) => {
        setTickers(message);
      })
      socket.on('disconnected', async (message) => {
        logOut();
      })
    }
  }, [socket])

  useEffect(() => {
    window.addEventListener("beforeunload", logOut);
    return () => {
      window.removeEventListener("beforeunload", logOut);
    };
  }, []);

  const notify = (notification) => {
    notifyContainer.current.classList.toggle('active')
    notifyType.current.classList.toggle(notification);
    setTimeout(() => {
      notifyType.current.classList.toggle(notification);
      notifyContainer.current.classList.toggle('active')
    },2000)
  }
  
  const createUser = async() => {
    const createErr = createError.current;
    try {
      const res = await axios.post('/user-management/user', {
        email, 
        password
      })
      if (createErr) {
        createErr.innerHTML = '';
      }
      notify('success');
      await clearForm();
    } catch (err) {
      if (createErr) {
        createErr.innerHTML = err.response.data.message || err.response.data.error.message;
      }
      notify('failure');
      console.log(err);
    }
  }
  
  const loginUser = async() => {
    const logErr = logError.current;
    try {
      const resp = await axios.post('/user-management/login', {
        email, 
        password
      })
      setIsLoggedIn(true);
      setTickers(await fetchData());
      setCookies('isLoggedIn', 'yes', { path: '/'});
      if(logErr) {
        logErr.innerHTML = '';
      }
      notify('success');
      const newSocket = io("http://localhost:3007", {
        query: { token: resp.data.accessToken }
      });
      setSocket(newSocket);
      await clearForm();
    } catch (err) {
      console.log(err);
      if (logErr && (err.response?.data?.message || err.response?.data?.error?.message)) {
        logErr.innerHTML = err.response.data.message || err.response.data.error.message;
      }
      notify('failure');
    }
  }

  const logOut = async() => {
    setIsLoggedIn(false);
    setCookies('isLoggedIn', 'no', { path: '/'});
    setCookies('accessToken', '', { path: '/'});
    await socket.disconnect();
    setSocket(null);
    await clearForm();
  }

  const createTicker = async (newData) => {
    const { price, name, symbol } = newData;
    try {
      await axios.post('/ticker-management/tickers', {
        price, 
        symbol,
        name
      })
      notify('success');
    } catch (err) {
      console.log(err.message);
      notify('failure');
    }
    clearForm()
  }

  const updateTicker = async (oldData, newData) => {
    const { id:newId, price:newPrice, name:newName, symbol:newSymbol } = newData;
    try {
      await axios.put('/ticker-management/tickers', {
        id:newId, 
        price: newPrice,
        name: newName,
        symbol: newSymbol
      })
      notify('success');
    } catch (err) {
      console.log(err.message);
      notify('failure');
    }
    clearForm()
  }
  
  const deleteTicker = async (oldData) => {
    const { id } = oldData;
    try {
      await axios.delete('/ticker-management/tickers', {
        data: {
          id: id
        }
      })
      notify('success');
    } catch (err) {
      console.log(err.message);
      notify('failure');
    }
    clearForm()
  }

  const fetchData = async () => {
    try {
      const result = await axios.get('/ticker-management/tickers');
      return result.data.message;
    } catch (err) {
      console.log(err.message);
      throw new Error('Error fetching ticker data');
    }
  }

  const clearForm = async () => {
    setEmail('');
    setPassword('');
  }

  return (
    <div>
      <div ref={notifyContainer} className="notify"><span ref={notifyType} className=""></span></div>
      {
        cookies.isLoggedIn!=="yes"?
        <div className="logBody">
          <div className="form">
            <h1>Sign in</h1>
            <input type="text" ref={logEmail} value={email} autoComplete="off" onChange={(e) => setEmail(e.target.value)} placeholder="Email"></input><br></br>
            <input type="password" ref={logPassword} autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"></input><br></br>
            <pre ref={logError} className="error-message"></pre>
            <button onClick={loginUser}>Log In</button>
          </div>
        </div>
          
        :
          <div className="container">
            <div>
              <MaterialTable
                title="Tickers"
                editable={{
                  isEditable: rowData =>  rowData.symbol!=='XBT' && rowData.symbol!=='LTC' && rowData.symbol!=='ETH',
                  isDeletable: rowData => rowData.symbol!=='XBT' && rowData.symbol!=='LTC' && rowData.symbol!=='ETH',
                  onRowAddCancelled: rowData => console.log('Row adding cancelled'),
                  onRowUpdateCancelled: rowData => console.log('Row editing cancelled'),
                  onRowDeleteCancelled: rowData => console.log('Row deliting cancelled'),
                  onRowAdd: (newData) => {
                    return new Promise((resolve, reject) => {
                      setTimeout(async () => {
                        await createTicker(newData);
                        resolve();
                      });
                    })
                  },
                  onRowUpdate: (newData, oldData) => {
                    return new Promise((resolve, reject) => {
                      setTimeout(async () => {
                        await updateTicker(oldData, newData);
                        resolve();
                      })
                    });
                  },
                  onRowDelete: (oldData) =>{
                    return new Promise((resolve, reject) => {
                      setTimeout(async () => {
                      await deleteTicker(oldData);
                      resolve();
                      });
                    })
                  }
                }}
                columns={columns}
                data={tickers}
                icons={tableIcons}
                options={{
                  search:false,
                  showFirstLastPageButtons:false,
                  showPreviousNextPageButtons:false,
                }}
              />
            </div>
            <div className='form2'>
              <h1 style={{textAlign:'center'}}>Create User</h1>
              <div style={{width: '50%', margin: 'auto'}}>
                <input type="text" ref={createEmail} autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"></input><br></br>
                <input type="password" ref={createPassword} autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"></input><br></br>
              </div>
              <pre ref={createError} className="error-message"></pre>
              <button onClick={createUser}>Create User</button>
              <button onClick={logOut}>Log Out</button>
            </div>
          </div>
      }
  </div>
  );
}

export default App;
