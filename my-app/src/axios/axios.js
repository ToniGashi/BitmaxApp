import axiosLib from 'axios';

const axios = axiosLib.create({
  baseURL: 'http://localhost:3000',
  withCredentials: true
});

export default axios;
