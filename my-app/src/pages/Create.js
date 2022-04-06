import React, { useState, useRef } from "react";
import axios from "../axios/axios";
import { useNavigate } from 'react-router-dom';

const CreateUser = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const createEmail = useRef(null);
  const createPassword = useRef(null);
  const createError = useRef(null);
  const notifyContainer = useRef(null);
  const notifyType = useRef(null);
  const navigate = useNavigate();

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
      setEmail('');
      setPassword('');
    } catch (err) {
      if (createErr) {
        createErr.innerHTML = err.response.data.message || err.response.data.error.message;
      }
      notify('failure');
      console.log(err);
    }
  }

  const notify = (notification) => {
    notifyContainer.current.classList.toggle('active')
    notifyType.current.classList.toggle(notification);
    setTimeout(() => {
      notifyType.current.classList.toggle(notification);
      notifyContainer.current.classList.toggle('active')
    },2000)
  }

  const home = async() => {
    navigate('/', { replace: true });
  }

  return (
    <div>
      <button onClick={home} style={{width: '100%', margin: '0', backgroundColor: 'green'}}> Home </button>
      <div ref={notifyContainer} className="notify"><span ref={notifyType} className=""></span>
      </div>
      <div className='form2'>
        
        <h2 style={{textAlign:'center'}}>Create User</h2>
        <div style={{width: '50%', margin: 'auto'}}>
          <input type="text" ref={createEmail} autoComplete="off" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email"></input><br></br>
          <input type="password" ref={createPassword} autoComplete="off" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password"></input><br></br>
        </div>
        <pre ref={createError} className="error-message"></pre>
        <button onClick={createUser}>Create User</button>
      </div>
    </div>
    
  )
}

export default CreateUser;
