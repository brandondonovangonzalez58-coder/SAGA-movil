//sesiones
import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

export const useAuthStore = create((set) => ({
  usuario: null,
  token: null,

  login: async (usuario, token) => {
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('usuario', JSON.stringify(usuario));
    set({ usuario, token });
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('usuario');
    set({ usuario: null, token: null });
  },

  cargarSesion: async () => {
    const token = await AsyncStorage.getItem('token');
    const usuarioStr = await AsyncStorage.getItem('usuario');
    if (token && usuarioStr) {
      set({ token, usuario: JSON.parse(usuarioStr) });
    }
  }
}));