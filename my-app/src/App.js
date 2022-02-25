<<<<<<< HEAD

import './App.css';
import { useState } from "react";
=======
import { useState, useEffect, forwardRef  } from "react";
import MaterialTable from "material-table";
import tableIcons from "./MaterialTableIcons";
import { alpha } from '@material-ui/core/styles';
import './App.css';

>>>>>>> c9c0931 (Fixing CSS, CORS, adding functionality to notify and fixing all the comments in the PR)
const axiosLib = require('axios');

const axios = axiosLib.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

function notify(notification) {
  const notify = document.getElementsByClassName('notify')[0];
  notify.classList.toggle("active");
  const notifyType = document.getElementById('notifyType');
  notifyType.classList.toggle(notification);
  setTimeout(function(){
    notifyType.classList.toggle(notification);
    notify.classList.toggle("active");
  },2000)
}
function App() {
  const [email, setName] = useState("");
  const [password, setPassword] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [tickers, setTickers] = useState([]);

  useEffect(() => {
  }, [tickers]);

  const createUser = async() => {
    try {
      const res = await axios.post('/user', {
        email, 
        password
      })
      const notifyType = document.getElementById('response');
      notifyType.innerHTML = '';
      notify('success');
    } catch (err) {
      console.log(err.response);
      const notifyType = document.getElementById('response');
      notifyType.innerHTML = err.response.data.message || err.response.data.error.message;
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
      const notifyType = document.getElementById('response');
      notifyType.innerHTML = '';
      notify('success');
    } catch (err) {
      const notifyType = document.getElementById('response');
      notifyType.innerHTML = err.response.data.error.message;
      notify('failure');
      console.log(err);
    }
  }

  async function createTicker(newData) {
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

  async function updateTicker(oldData, newData) {
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
  
  async function deleteTicker(oldData) {
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

  async function fetchData() {
    const result = await axios.get('/ticker');
    setTickers([result.data.message.rows]);
    return result.data.message.rows;
  }

  var columns = [
    {title: "symbol", field: "symbol"},
    {title: "name", field: "name"},
    {title: "price", field: "price"}
  ];

  return (
    <div>
      {
        !isLoggedIn?
          <div className="form">
            <div class="notify"><span id="notifyType" class=""></span></div>
            <h1>Sign in</h1>
            <input type="text" id="email" value={email} onChange={(e) => setName(e.target.value)} placeholder="Email"></input><br></br>
            <input type="text" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"></input><br></br>
            <pre id='response' class="error-message"></pre>
            <button onClick={createUser}>Create User</button>
            <button onClick={loginUser}>Log In</button>
          </div>
        :
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
            <div>
              <div class="notify"><span id="notifyType" class=""></span></div>
              <h1 style={{textAlign:'center'}}>Create User</h1>
              <div style={{width: '50%', margin: 'auto'}}>
                <input type="text" id="email" value={email} onChange={(e) => setName(e.target.value)} placeholder="Email"></input><br></br>
                <input type="text" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"></input><br></br>
              </div>
              <button onClick={createUser}>Create User</button>
            </div>
          </div>
      }
  </div>
  );
}

export default App;
