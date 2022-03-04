import { useState, useEffect, forwardRef  } from "react";
import MaterialTable from "material-table";
import tableIcons from "./MaterialTableIcons";
import { alpha } from '@material-ui/core/styles';
import { useCookies } from "react-cookie";
import './App.css';

const axiosLib = require('axios');

const axios = axiosLib.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

const notify = (notification) => {
  const notify = document.getElementsByClassName('notify')[0];
  notify.classList.toggle("active");
  const notifyType = document.getElementById('notifyType');
  notifyType.classList.toggle(notification);
  setTimeout(() => {
    notifyType.classList.toggle(notification);
    notify.classList.toggle("active");
  },2000)
}
const App = () => {
  const [email, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [tickers, setTickers] = useState([]);
  const [cookies, setCookies] = useCookies(['isLoggedIn']);
  const [columns, setColumns] = useState([
    {title: "symbol", field: "symbol"},
    {title: "name", field: "name"},
    {title: "price", field: "price", type:'numeric'}
  ]);

  useEffect(() => {
  }, [tickers]);

  const createUser = async() => {
    try {
      const res = await axios.post('/user', {
        email, 
        password
      })
      const notifyType = document.getElementById('createResponse');
      if (notifyType) {
        notifyType.innerHTML = '';
      }
      notify('success');
      await clearForm('create');
    } catch (err) {
      console.log(err.response);
      const notifyType = document.getElementById('createResponse');
      if (notifyType) {
        notifyType.innerHTML = err.response.data.message || err.response.data.error.message;
      }
      notify('failure');
      console.log(err);
    }
  }
  
  const loginUser = async() => {
    try {
      await axios.post('/login', {
        email, 
        password
      })
      setIsLoggedIn(true);
      setTickers(await fetchData());
      setCookies('isLoggedIn', 'yes', { path: '/'});
      const notifyType = document.getElementById('response');
      if(notifyType) {
        notifyType.innerHTML = '';
      }
      notify('success');
      await clearForm('create');
    } catch (err) {
      const notifyType = document.getElementById('response');
      if (notifyType) {
        notifyType.innerHTML = err.response.data.message || err.response.data.error.message;
      }
      notify('failure');
      console.log(err);
    }
  }

  const logOut = async() => {
    setIsLoggedIn(false);
    setCookies('isLoggedIn', 'no', { path: '/'});
    setCookies('accessToken', '', { path: '/'});
    await clearForm('log');
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
  }

  const fetchData = async () => {
    const result = await axios.get('/ticker');
    setTickers([result.data.message.rows]);
    return result.data.message.rows;
  }

  const clearForm = async (formType) => {
    setTimeout(() => {
    const emailInput = document.getElementById(`${formType}Email`);
    emailInput.value='';
    const passwordInput = document.getElementById(`${formType}Password`);
    passwordInput.value='';
    }, 1)
  }

  return (
    <div>
      {
        cookies.isLoggedIn!=="yes"?
        <div className="logBody">
          <div className="form">
            <div className="notify"><span id="notifyType" className=""></span></div>
            <h1>Sign in</h1>
            <input type="text" id="logEmail" value={email} onChange={(e) => setName(e.target.value)} placeholder="Email"></input><br></br>
            <input type="password" id="logPassword" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"></input><br></br>
            <pre id='response' className="error-message"></pre>
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
              />
            </div>
            <div className='form2'>
              <div className="notify"><span id="notifyType" className=""></span></div>
              <h1 style={{textAlign:'center'}}>Create User</h1>
              <div style={{width: '50%', margin: 'auto'}}>
                <input type="text" id="createEmail" value={email} onChange={(e) => setName(e.target.value)} placeholder="Email"></input><br></br>
                <input type="password" id="createPassword" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"></input><br></br>
              </div>
              <pre id='createResponse' className="error-message"></pre>
              <button onClick={createUser}>Create User</button>
              <button onClick={logOut}>Log Out</button>
            </div>
          </div>
      }
  </div>
  );
}

export default App;
