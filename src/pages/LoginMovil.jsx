//login parte movil

import { useRouter } from 'expo-router';
import { ArrowRight, Eye, EyeOff, GraduationCap, Lock, Mail } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../api/axios';
import LoadingScreenMovil from '../components/LoadingScreenMovil';
import { useAuthStore } from '../store/authStore';

export default function LoginMovil() {
  const [correo, setCorreo] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [rolLoading, setRolLoading] = useState('Estudiante');

  const router = useRouter();
  const login = useAuthStore((s) => s.login);

  const handleLogin = async () => {
    if (!correo || !password) {
      Alert.alert("Error", "Por favor llena todos los campos");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post('/auth/login', { correo, password });
      
      await login(res.data.usuario, res.data.access_token);
      const rolUsuario = res.data.usuario.rol;
      
      if (rolUsuario === 'Administrador') {
        Alert.alert("Aviso", "La gestión de administrador es exclusiva de la versión Web.");
        setLoading(false);
        return;
      }

      setRolLoading(rolUsuario);
      setIsAuthenticating(true);

      // REDIRECCIÓN CORREGIDA
      setTimeout(() => {
        if (rolUsuario === 'Docente') {
          router.replace('/docente/principal');
        } else if (rolUsuario === 'Estudiante') {
          router.replace('/alumno/principal');
        }
      }, 4000);

    } catch (error) {
      Alert.alert("Acceso denegado", error.response?.data?.detail || "Credenciales incorrectas");
      setLoading(false);
    }
  };

  if (isAuthenticating) {
    return <LoadingScreenMovil rol={rolLoading} />;
  }

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.glowBlue} />
      <View style={styles.glowPurple} />

      <View style={styles.card}>
        <View style={styles.iconContainer}>
          <GraduationCap color="white" size={40} />
        </View>
        
        <Text style={styles.title}>Bienvenido</Text>
        <Text style={styles.subtitle}>Ingresa a tu cuenta de SAGA</Text>

        <View style={styles.inputContainer}>
          <Mail color="#737373" size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="correo@saga.com"
            placeholderTextColor="#737373"
            value={correo}
            onChangeText={setCorreo}
            keyboardType="email-address"
            autoCapitalize="none"
          />
        </View>

        <View style={styles.inputContainer}>
          <Lock color="#737373" size={20} style={styles.inputIcon} />
          <TextInput
            style={styles.input}
            placeholder="Contraseña"
            placeholderTextColor="#737373"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
            {showPassword ? <EyeOff color="#737373" size={20} /> : <Eye color="#737373" size={20} />}
          </TouchableOpacity>
        </View>

        <TouchableOpacity 
          style={[styles.button, loading && { opacity: 0.7 }]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={styles.buttonText}>{loading ? 'Validando...' : 'Iniciar Sesión'}</Text>
          {!loading && <ArrowRight color="white" size={20} />}
        </TouchableOpacity>

        <Text style={styles.footerText}>Solo Docentes y Alumnos</Text>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020202', justifyContent: 'center', alignItems: 'center' },
  glowBlue: { position: 'absolute', top: -50, left: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: '#3b82f6', opacity: 0.15 },
  glowPurple: { position: 'absolute', bottom: -50, right: -50, width: 300, height: 300, borderRadius: 150, backgroundColor: '#8b5cf6', opacity: 0.15 },
  card: { width: '90%', maxWidth: 400, padding: 30, backgroundColor: 'rgba(255,255,255,0.03)', borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', alignItems: 'center' },
  iconContainer: { width: 80, height: 80, backgroundColor: '#3b82f6', borderRadius: 20, alignItems: 'center', justifyContent: 'center', marginBottom: 20, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 5 },
  subtitle: { fontSize: 14, color: '#a3a3a3', marginBottom: 30 },
  inputContainer: { width: '100%', flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 15, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 15, paddingHorizontal: 15 },
  inputIcon: { marginRight: 10 },
  input: { flex: 1, color: 'white', fontSize: 16, paddingVertical: 15 },
  eyeIcon: { padding: 5 },
  button: { width: '100%', backgroundColor: '#3b82f6', flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 15, marginTop: 10, gap: 10, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 5 },
  buttonText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  footerText: { color: '#737373', fontSize: 12, marginTop: 30 }
});