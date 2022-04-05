import { useState, useEffect } from "react";  
import MaterialTable from "@material-table/core";
import tableIcons from "../components/MaterialTableIcons";
import { useNavigate } from 'react-router-dom';
import { useCookies } from "react-cookie";
import { io } from "socket.io-client";
import { createTicker, updateTicker, deleteTicker } from "../common/tickerFunctions"

const Home = () => {
  const [socket, setSocket] = useState();
  const [cookies, setCookies] = useCookies(['isLoggedIn', 'accessToken']);

  const [tickers, setTickers] = useState([]);
  const navigate = useNavigate();

  const columns = [
    {title: "symbol", field: "symbol"},
    {title: "name", field: "name"},
    {title: "price", field: "price", type:'numeric'}
  ];

  useEffect(() => {
    const s = io("http://localhost:3007", {
      query: { token: cookies.accessToken }
    })
    setSocket(s);
    s.connect();
    return () => s.disconnect();
  }, []);

  useEffect(() => {
    if(socket) {
      socket.on('message', async (message) => {
        setTickers(message);
      })
      socket.on('disconnected', async (message) => {
        if(socket) {
          socket.disconnect();
        }
      })
    }
  })

  const createUser = async() => {
    navigate('/createUser', { replace: true });
  }

  const logOut = async() => {
    setCookies('isLoggedIn', 'no');
    setCookies('accessToken', '');
    navigate('/signIn', {replace: true});
  }

  return (
    <div>
      <button onClick={createUser} style={{width: '100%', margin: '0', backgroundColor: 'green'}}> Create User </button>
      <div className="container">
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
          onRowClick={ (event, rowData) => { navigate(`/ticker/${rowData.id}`, { replace: true })}}
          icons={tableIcons}
          options={{
            search:false,
            showFirstLastPageButtons:false,
            showPreviousNextPageButtons:false,
          }}
        />
      </div>
      <button onClick={logOut} style={{width: '100%', margin: '0', backgroundColor: 'green'}}> LogOut </button>
    </div>
  );
}

export default Home;
