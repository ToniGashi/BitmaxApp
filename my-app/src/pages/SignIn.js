import React, { useState, useRef } from "react";
import axios from "../axios/axios";
import { useCookies } from "react-cookie";
import { useNavigate } from 'react-router-dom';

const SignIn = () => {
  const [cookies, setCookies] = useCookies(['isLoggedIn']);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const logEmail = useRef(null);
  const logPassword = useRef(null);
  const logError = useRef(null);

  const loginUser = async() => {
    const logErr = logError.current;
    try {
      const resp = await axios.post('/user-management/login', {
        email, 
        password
      })
      setCookies('isLoggedIn', 'yes');
      if(logErr) {
        logErr.innerHTML = '';
      }
      navigate('/', { replace: true});
    } catch (err) {
      console.log(err);
      if (logErr && (err.response?.data?.message || err.response?.data?.error?.message)) {
        logErr.innerHTML = err.response.data.message || err.response.data.error.message;
      }
    }
  }

  return (
    <div className="logBody">
      <div className="form">
        <h1>Sign in</h1>
        <input type="text" ref={logEmail} value={email} autoComplete="off" onChange={(e) => setEmail(e.target.value)} placeholder="Email"></input><br></br>
        <input type="password" ref={logPassword} autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"></input><br></br>
        <pre ref={logError} className="error-message"></pre>
        <button onClick={loginUser}>Log In</button>
      </div>
    </div>
  )
}

export default SignIn;
