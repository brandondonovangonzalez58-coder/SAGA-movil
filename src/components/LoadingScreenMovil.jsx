import { GraduationCap } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { Dimensions, StatusBar, StyleSheet, Text, View } from 'react-native';
import Animated, {
    Easing,
    useAnimatedStyle,
    useSharedValue,
    withRepeat,
    withSequence,
    withTiming
} from 'react-native-reanimated';

const { width } = Dimensions.get('window');

export default function LoadingScreenMovil({ rol = 'Administrador' }) {
  // Configuración de colores por Rol
  const config = {
    Administrador: { color1: '#3b82f6', color2: '#06b6d4', nombre: 'Admin' },
    Docente: { color1: '#10b981', color2: '#34d399', nombre: 'Docente' },
    Estudiante: { color1: '#8b5cf6', color2: '#a78bfa', nombre: 'Alumno' }
  };
  
  const current = config[rol] || config.Administrador;

  // Animaciones
  const rotacionExterior = useSharedValue(0);
  const rotacionInterior = useSharedValue(0);
  const flotacion = useSharedValue(0);
  const escanerY = useSharedValue(0);
  const progreso = useSharedValue(0);

  const [paso, setPaso] = useState(0);
  const pasos = rol === 'Docente' 
    ? ["Verificando Docente...", "Cargando grupos...", "Preparando pase de lista..."]
    : rol === 'Estudiante'
    ? ["Verificando Alumno...", "Consultando historial...", "Preparando tu espacio..."]
    : ["Verificando Admin...", "Conectando Base de Datos...", "Cargando panel global..."];

  useEffect(() => {
    // Configurar animaciones infinitas
    rotacionExterior.value = withRepeat(withTiming(360, { duration: 8000, easing: Easing.linear }), -1);
    rotacionInterior.value = withRepeat(withTiming(-360, { duration: 4000, easing: Easing.linear }), -1);
    flotacion.value = withRepeat(withSequence(
      withTiming(-10, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 1000, easing: Easing.inOut(Easing.ease) })
    ), -1);
    escanerY.value = withRepeat(withSequence(
      withTiming(100, { duration: 1500, easing: Easing.inOut(Easing.ease) }),
      withTiming(0, { duration: 1500, easing: Easing.inOut(Easing.ease) })
    ), -1);
    progreso.value = withTiming(100, { duration: 5000, easing: Easing.inOut(Easing.ease) });

    // Cambiar textos
    const interval = setInterval(() => {
      setPaso(p => (p < 2 ? p + 1 : p));
    }, 1600);
    return () => clearInterval(interval);
  }, []);

  const styleExterior = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotacionExterior.value}deg` }] }));
  const styleInterior = useAnimatedStyle(() => ({ transform: [{ rotate: `${rotacionInterior.value}deg` }] }));
  const styleFlotacion = useAnimatedStyle(() => ({ transform: [{ translateY: flotacion.value }] }));
  const styleEscaner = useAnimatedStyle(() => ({ transform: [{ translateY: escanerY.value }] }));
  const styleProgreso = useAnimatedStyle(() => ({ width: `${progreso.value}%` }));

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" />
      
      {/* Fondo de resplandor */}
      <View style={[styles.glow, { backgroundColor: current.color1 }]} />

      <View style={styles.content}>
        {/* Contenedor del Logo */}
        <View style={styles.logoContainer}>
          {/* Anillos animados */}
          <Animated.View style={[styles.ringOuter, { borderColor: current.color1 }, styleExterior]} />
          <Animated.View style={[styles.ringInner, { borderColor: current.color2 }, styleInterior]} />
          
          {/* Escáner Láser */}
          <Animated.View style={[styles.scanner, { backgroundColor: current.color1 }, styleEscaner]} />

          {/* Icono Central */}
          <Animated.View style={[styles.iconBox, { backgroundColor: current.color1, shadowColor: current.color1 }, styleFlotacion]}>
            <GraduationCap color="white" size={40} />
          </Animated.View>
        </View>

        {/* Textos */}
        <Text style={styles.title}>SAGA</Text>
        
        <View style={styles.textContainer}>
          <Text style={[styles.stepText, { color: current.color1 }]}>
            {pasos[paso]}
          </Text>
        </View>

        {/* Barra de progreso */}
        <View style={styles.progressBar}>
          <Animated.View style={[styles.progressFill, { backgroundColor: current.color1 }, styleProgreso]} />
        </View>
        
        <Text style={[styles.roleText, { color: current.color2 }]}>
          INGRESANDO COMO {current.nombre.toUpperCase()}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020202', alignItems: 'center', justifyContent: 'center' },
  glow: { position: 'absolute', width: 300, height: 300, borderRadius: 150, opacity: 0.15, filter: 'blur(50px)' },
  content: { alignItems: 'center', zIndex: 10 },
  logoContainer: { width: 160, height: 160, alignItems: 'center', justifyContent: 'center', marginBottom: 30 },
  ringOuter: { position: 'absolute', width: 140, height: 140, borderRadius: 70, borderWidth: 2, borderStyle: 'dashed', opacity: 0.5 },
  ringInner: { position: 'absolute', width: 110, height: 110, borderRadius: 55, borderWidth: 2, borderBottomColor: 'transparent', borderLeftColor: 'transparent' },
  scanner: { position: 'absolute', width: 100, height: 2, opacity: 0.8, shadowOffset: { width: 0, height: 0 }, shadowOpacity: 1, shadowRadius: 10 },
  iconBox: { width: 80, height: 80, borderRadius: 20, alignItems: 'center', justifyContent: 'center', shadowOffset: { width: 0, height: 0 }, shadowOpacity: 0.8, shadowRadius: 20, elevation: 10, borderWidth: 1, borderColor: 'rgba(255,255,255,0.2)' },
  title: { fontSize: 36, fontWeight: 'bold', color: 'white', letterSpacing: 10, marginBottom: 10 },
  textContainer: { height: 30, justifyContent: 'center', marginBottom: 30 },
  stepText: { fontSize: 14, fontWeight: '500' },
  progressBar: { width: 250, height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden', marginBottom: 20 },
  progressFill: { height: '100%', borderRadius: 2 },
  roleText: { fontSize: 12, fontWeight: 'bold', letterSpacing: 2 }
});