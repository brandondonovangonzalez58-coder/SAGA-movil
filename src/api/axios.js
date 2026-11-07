//api desde backend

import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

// Tu IP local con el puerto 8000
const api = axios.create({
  baseURL: 'http://192.168.100.13:8000', 
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor para agregar el Token JWT a cada petición usando AsyncStorage
api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export default api;