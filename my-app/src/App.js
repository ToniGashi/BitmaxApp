
import './App.css';
import { useState } from "react";
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
      const res = await axios.post('/login', {
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

  return (
    <div className="form">
      <div class="notify"><span id="notifyType" class=""></span></div>
      <h1>Sign in</h1>
      <input type="text" id="email" value={email} onChange={(e) => setName(e.target.value)} placeholder="Email"></input><br></br>
      <input type="text" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"></input><br></br>
      <pre id='response' class="error-message"></pre>
      <button onClick={createUser}>Create User</button>
      <button onClick={loginUser}>Log In</button>
    </div>
  );
}

export default App;
