import { useState } from "react";
const axiosLib = require('axios');

const axios = axiosLib.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});
function App() {
  const [email, setName] = useState("");
  const [password, setPassword] = useState("");

  async function createUser() {
    console.log('creating user');
    axios.post('/user', {
      email, 
      password
    }).then(response => {
      console.log(response);
    }).catch(err => {
      console.log('!!!!!!!!!!!!!!', err.message);
    })
  }
  
  async function loginUser() {
    console.log('getting user');
    try {
      const res = await axios.post('/login', {
        email, 
        password
      })
      console.log(res);
    } catch (err) {
      //Document.getElementById('response').innerHTML = err.message
    }
  }

  return (
    <ul>
      <label htmlFor="email">Email:</label><br></br>
      <input type="text" id="email" value={email} onChange={(e) => setName(e.target.value)} placeholder="Enter your email address"></input><br></br>
      <label htmlFor="password">Password:</label><br></br>
      <input type="text" id="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Enter your password here"></input><br></br>
      <pre id='response' style={{color: 'red'}}></pre><br></br><br></br>
      <button onClick={createUser}>click to create user</button>
      <button onClick={loginUser}>click to login user</button>
    </ul>
  );
}

export default App;
