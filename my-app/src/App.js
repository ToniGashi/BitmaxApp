
import './App.css';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useCookies } from "react-cookie";
import Home from './pages/Home';
import Ticker from './pages/Ticker';
import SignIn from './pages/SignIn';
import CreateUser from './pages/Create';

const App = () => {
  const [cookies, setCookies] = useCookies(['isLoggedIn']);

  return (
    <div>
      <Routes>
        <Route path='/' element={cookies.isLoggedIn === "yes" ?  <Home /> : <Navigate to='/signIn'/> }>
        </Route>
        <Route path='/signIn' element={cookies.isLoggedIn !== "yes" ?  <SignIn /> : <Navigate to='/'/> }/>
        <Route path='/createUser' element={cookies.isLoggedIn === "yes" ?  <CreateUser /> : <Navigate to='/signIn'/> }/>
        <Route path='/ticker/:tickerId' element={cookies.isLoggedIn === "yes" ?  <Ticker /> : <Navigate to='/signIn'/>} />
      </Routes>
    </div>
  );
}

export default App;
