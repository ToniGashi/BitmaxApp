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

function App() {
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
        setTickers(await fetchData());
      })
    }
  }, [socket])

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
      const res = await axios.post('/user', {
        email, 
        password
      })
      if (createErr) {
        createErr.innerHTML = '';
      }
      notify('success');
      await clearForm();
    } catch (err) {
      console.log(err.response);
      if (createErr) {
        createErr.innerHTML = err.response.data.message || err.response.data.error.message;
      }
      notify('failure');
      console.log(err);
    }
  }
  
  const loginUser = async() => {
    const logErr = logError.current;
    const newSocket = io("http://localhost:3005", {
      pingInterval: 200000,
      pingTimeout: 100000
    });
    setSocket(newSocket);
    try {
      await axios.post('/login', {
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
      await clearForm();
    } catch (err) {
      console.log(err);
      if (logErr) {
        logErr.innerHTML = err.response.data.message || err.response.data.error.message;
      }
      notify('failure');
      console.log(err);
    }
  }

  const logOut = async() => {
    setIsLoggedIn(false);
    setCookies('isLoggedIn', 'no', { path: '/'});
    setCookies('accessToken', '', { path: '/'});
    await clearForm();
  }

  const createTicker = async (newData) => {
    const { price, name, symbol } = newData;
    try {
      await axios.post('/ticker', {
        price, 
        symbol,
        name
      })
      setTickers(await fetchData());
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
      await axios.put('/ticker', {
        id:newId, 
        price: newPrice,
        name: newName,
        symbol: newSymbol
      })
      setTickers(await fetchData());
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
      await axios.delete('/ticker', {
        data: {
          id: id
        }
      })
      setTickers(await fetchData());
      notify('success');
    } catch (err) {
      console.log(err.message);
      notify('failure');
    }
    clearForm()
  }

  const fetchData = async () => {
    const result = await axios.get('/ticker');
    setTickers([result.data.message]);
    return result.data.message.rows;
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
                  isEditable: rowData => true,
                  isDeletable: rowData => true,
                  onRowAddCancelled: rowData => console.log('Row adding cancelled'),
                  onRowUpdateCancelled: rowData => console.log('Row editing cancelled'),
                  onRowDeleteCancelled: rowData => console.log('Row deliting cancelled'),
                  onRowAdd: (newData) => {
                    return new Promise((resolve, reject) => {
                      setTimeout(() => {
                        createTicker(newData);
                        resolve();
                      },1000);
                    })
                  },
                  onRowUpdate: (newData, oldData) => {
                    return new Promise((resolve, reject) => {
                      setTimeout(() => {
                        updateTicker(oldData, newData);
                        resolve();
                      },1000)
                    });
                  },
                  onRowDelete: (oldData) =>{
                    return new Promise((resolve, reject) => {
                      setTimeout(() => {
                      deleteTicker(oldData);
                      resolve();
                      },1000);
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
