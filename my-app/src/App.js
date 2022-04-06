
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useCookies } from "react-cookie";
import Home from './pages/Home';
import Ticker from './pages/Ticker';
import SignIn from './pages/SignIn';
import CreateUser from './pages/Create';

const App = () => {
  const [cookies, setCookies] = useCookies(['isLoggedIn']);

  const isLoggedIn = () => {
    return cookies.isLoggedIn === "yes";
  }

  return (
    <div>
      <Routes>
        <Route path='/' element={ isLoggedIn() ?  <Home /> : <Navigate to='/signIn'/> }>
        </Route>
        <Route path='/signIn' element={!isLoggedIn() ?  <SignIn /> : <Navigate to='/'/> }/>
        <Route path='/createUser' element={isLoggedIn() ?  <CreateUser /> : <Navigate to='/signIn'/> }/>
        <Route path='/ticker/:tickerId' element={isLoggedIn() ?  <Ticker /> : <Navigate to='/signIn'/>} />
      </Routes>
    </div>
  );
}

export default App;
