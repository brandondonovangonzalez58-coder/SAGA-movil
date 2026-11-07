// Vista para pasar lista y guardar bitácora
import { useRouter } from 'expo-router';
import { AlertCircle, BookOpen, Calendar, CheckCircle, ChevronDown, Clock, Clock3, GraduationCap, History, Users, XCircle } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

export default function PasarLista() {
  const router = useRouter();
  const usuario = useAuthStore((s) => s.usuario);

  // Estados para los filtros
  const [carreras, setCarreras] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [alumnos, setAlumnos] = useState([]);

  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);

  // Estados de UI
  const [loading, setLoading] = useState(false);
  const [menuAbierto, setMenuAbierto] = useState(null);

  // Estados de la Bitácora
  const [fecha, setFecha] = useState(new Date().toISOString().split('T')[0]);
  const [horaInicio, setHoraInicio] = useState('08:00');
  const [horaFin, setHoraFin] = useState('09:00');
  const [tema, setTema] = useState('');

  // 1. Cargar carreras
  useEffect(() => {
    api.get('/carreras/').then(res => setCarreras(res.data)).catch(console.log);
  }, []);

  // 2. Al elegir una carrera, cargamos sus grupos
  const seleccionarCarrera = async (carrera) => {
    setCarreraSeleccionada(carrera);
    setGrupoSeleccionado(null);
    setAlumnos([]);
    setMenuAbierto(null);
    setLoading(true);
    try {
      const res = await api.get('/grupos/');
      setGrupos(res.data.filter(g => g.id_carrera === carrera.id_carrera));
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los grupos.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Al elegir un grupo, cargamos a sus alumnos (Inician en "Pendiente")
  const seleccionarGrupo = async (grupo) => {
    setGrupoSeleccionado(grupo);
    setMenuAbierto(null);
    setLoading(true);
    try {
      const res = await api.get(`/estudiantes/grupo/${grupo.id_grupo}`);
      if (res.data.length === 0) {
        Alert.alert("Aviso", "Este grupo no tiene alumnos inscritos.");
        setAlumnos([]);
      } else {
        const alumnosFormateados = res.data.map(a => ({
          id_estudiante: a.id_estudiante,
          nombre: a.usuario ? `${a.usuario.nombre} ${a.usuario.apellidos}` : `Alumno ${a.id_usuario}`, 
          estado: 'Pendiente' // <-- Inician pendientes
        }));
        setAlumnos(alumnosFormateados);
      }
    } catch (error) {
      Alert.alert("Error", "No se pudieron cargar los alumnos.");
    } finally {
      setLoading(false);
    }
  };

  const cambiarEstado = (id, nuevoEstado) => {
    setAlumnos(alumnos.map(a => a.id_estudiante === id ? { ...a, estado: nuevoEstado } : a));
  };

  // 4. Guardar la bitácora y asistencias
  const guardarAsistencia = async () => {
    if (!tema) {
      Alert.alert("Falta el tema", "Escribe el tema de la clase para guardar la bitácora.");
      return;
    }

    setLoading(true);
    try {
      const resSesion = await api.post('/sesiones/', {
        id_grupo_materia: 1, // Recuerda que aquí iría el ID real
        fecha: fecha,
        hora_inicio: horaInicio + ":00",
        hora_fin: horaFin + ":00",
        tema: tema,
        estado: "Cerrada"
      });

      const idSesionCreada = resSesion.data.id_sesion;

      for (const alumno of alumnos) {
        await api.post('/asistencias/', {
          id_sesion: idSesionCreada,
          id_estudiante: alumno.id_estudiante,
          estado: alumno.estado,
          observaciones: '',
          registrado_por: usuario.id_usuario || 1
        });
      }

      Alert.alert("¡Éxito!", "La bitácora de asistencia se guardó correctamente.");
    } catch (error) {
      console.error(error);
      Alert.alert("Error", "No se pudo guardar. Revisa los datos.");
    } finally {
      setLoading(false);
    }
  };

  // Función para darle color a cada botón según su estado
  const getBotonStyle = (estadoBoton, estadoAlumno) => {
    if (estadoBoton !== estadoAlumno) return styles.btnInactivo;
    switch (estadoBoton) {
      case 'Presente': return styles.btnPresente;
      case 'Falta': return styles.btnFalta;
      case 'Justificada': return styles.btnJustificado;
      case 'Pendiente': return styles.btnPendiente;
      default: return styles.btnInactivo;
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        {/* BOTÓN HISTORIAL */}
        <TouchableOpacity onPress={() => router.push('/docente/historial')} style={styles.historyBtn}>
          <History color="#3b82f6" size={20} />
          <Text style={styles.historyText}>Ver Historial</Text>
        </TouchableOpacity>

        <Text style={styles.title}>Pasar Lista</Text>
        <Text style={styles.subtitle}>Selecciona la clase y guarda la bitácora.</Text>

        {/* PASO 1: CARRERA */}
        <Text style={styles.stepLabel}>1. Carrera</Text>
        <TouchableOpacity style={styles.selector} onPress={() => setMenuAbierto(menuAbierto === 'carrera' ? null : 'carrera')}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <GraduationCap color="#3b82f6" size={20} />
            <Text style={{ color: carreraSeleccionada ? 'white' : '#737373' }}>
              {carreraSeleccionada ? carreraSeleccionada.nombre : 'Elige una carrera...'}
            </Text>
          </View>
          <ChevronDown color="white" size={20} />
        </TouchableOpacity>
        {menuAbierto === 'carrera' && (
          <View style={styles.dropdown}>
            {carreras.map(c => (
              <TouchableOpacity key={c.id_carrera} style={styles.dropdownItem} onPress={() => seleccionarCarrera(c)}>
                <Text style={{ color: 'white' }}>{c.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* PASO 2: GRUPO */}
        {carreraSeleccionada && (
          <>
            <Text style={[styles.stepLabel, { marginTop: 15 }]}>2. Grupo</Text>
            <TouchableOpacity style={styles.selector} onPress={() => setMenuAbierto(menuAbierto === 'grupo' ? null : 'grupo')}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Users color="#10b981" size={20} />
                <Text style={{ color: grupoSeleccionado ? 'white' : '#737373' }}>
                  {grupoSeleccionado ? `Grupo ${grupoSeleccionado.nombre} (${grupoSeleccionado.turno})` : 'Elige un grupo...'}
                </Text>
              </View>
              <ChevronDown color="white" size={20} />
            </TouchableOpacity>
            {menuAbierto === 'grupo' && (
              <View style={styles.dropdown}>
                {grupos.map(g => (
                  <TouchableOpacity key={g.id_grupo} style={styles.dropdownItem} onPress={() => seleccionarGrupo(g)}>
                    <Text style={{ color: 'white' }}>Grupo {g.nombre} - {g.turno}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {loading && <ActivityIndicator color="#3b82f6" size="large" style={{ marginTop: 20 }} />}

        {/* PASO 3: BITÁCORA Y ALUMNOS */}
        {!loading && alumnos.length > 0 && (
          <View style={{ marginTop: 20 }}>
            
            <View style={styles.bitacoraCard}>
              <Text style={styles.bitacoraTitle}>Bitácora de la Clase</Text>
              <View style={styles.inputRow}>
                <Calendar color="#f59e0b" size={18} />
                <TextInput style={styles.textInput} value={fecha} onChangeText={setFecha} placeholder="YYYY-MM-DD" />
              </View>
              <View style={{ flexDirection: 'row', gap: 10, marginTop: 10 }}>
                <View style={[styles.inputRow, { flex: 1 }]}>
                  <Clock color="#f59e0b" size={18} />
                  <TextInput style={styles.textInput} value={horaInicio} onChangeText={setHoraInicio} placeholder="08:00" />
                </View>
                <View style={[styles.inputRow, { flex: 1 }]}>
                  <Clock color="#f59e0b" size={18} />
                  <TextInput style={styles.textInput} value={horaFin} onChangeText={setHoraFin} placeholder="09:00" />
                </View>
              </View>
              <View style={[styles.inputRow, { marginTop: 10 }]}>
                <BookOpen color="#f59e0b" size={18} />
                <TextInput style={styles.textInput} value={tema} onChangeText={setTema} placeholder="Tema de la clase" />
              </View>
            </View>

            <View style={styles.headerList}>
              <Users color="#3b82f6" size={20} />
              <Text style={styles.headerListText}>3. Alumnos</Text>
            </View>

            {alumnos.map((alumno) => (
              <View key={alumno.id_estudiante} style={styles.card}>
                <Text style={styles.alumnoNombre}>{alumno.nombre}</Text>
                
                {/* Cuadrícula de 4 botones */}
                <View style={styles.gridRow}>
                  <TouchableOpacity 
                    onPress={() => cambiarEstado(alumno.id_estudiante, 'Presente')}
                    style={[styles.gridBtn, getBotonStyle('Presente', alumno.estado)]}
                  >
                    <CheckCircle color={alumno.estado === 'Presente' ? 'white' : '#a3a3a3'} size={16} />
                    <Text style={[styles.btnText, alumno.estado === 'Presente' && { color: 'white' }]}>Presente</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => cambiarEstado(alumno.id_estudiante, 'Falta')}
                    style={[styles.gridBtn, getBotonStyle('Falta', alumno.estado)]}
                  >
                    <XCircle color={alumno.estado === 'Falta' ? 'white' : '#a3a3a3'} size={16} />
                    <Text style={[styles.btnText, alumno.estado === 'Falta' && { color: 'white' }]}>Falta</Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.gridRow}>
                  <TouchableOpacity 
                    onPress={() => cambiarEstado(alumno.id_estudiante, 'Justificada')}
                    style={[styles.gridBtn, getBotonStyle('Justificada', alumno.estado)]}
                  >
                    <AlertCircle color={alumno.estado === 'Justificada' ? 'white' : '#a3a3a3'} size={16} />
                    <Text style={[styles.btnText, alumno.estado === 'Justificada' && { color: 'white' }]}>Justificado</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    onPress={() => cambiarEstado(alumno.id_estudiante, 'Pendiente')}
                    style={[styles.gridBtn, getBotonStyle('Pendiente', alumno.estado)]}
                  >
                    <Clock3 color={alumno.estado === 'Pendiente' ? 'white' : '#a3a3a3'} size={16} />
                    <Text style={[styles.btnText, alumno.estado === 'Pendiente' && { color: 'white' }]}>Pendiente</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <TouchableOpacity onPress={guardarAsistencia} style={styles.saveButton}>
              <Text style={styles.saveButtonText}>Guardar Bitácora</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020202' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  historyBtn: { flexDirection: 'row', justifyContent: 'flex-end', alignItems: 'center', gap: 8, marginBottom: 15 },
  historyText: { color: '#3b82f6', fontWeight: 'bold', fontSize: 14 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 14, color: '#a3a3a3', marginBottom: 20 },
  stepLabel: { color: '#a3a3a3', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' },
  selector: { backgroundColor: 'rgba(255,255,255,0.05)', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 15, padding: 16, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  dropdown: { backgroundColor: '#111827', borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', borderRadius: 15, marginTop: 5, overflow: 'hidden' },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },
  bitacoraCard: { backgroundColor: 'rgba(245, 158, 11, 0.05)', borderWidth: 1, borderColor: 'rgba(245, 158, 11, 0.2)', borderRadius: 16, padding: 15, marginBottom: 20 },
  bitacoraTitle: { color: '#f59e0b', fontSize: 16, fontWeight: 'bold', marginBottom: 10 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', borderRadius: 10, paddingHorizontal: 10, paddingVertical: 8 },
  textInput: { flex: 1, color: 'white', marginLeft: 10, fontSize: 14 },
  headerList: { flexDirection: 'row', alignItems: 'center', gap: 10, marginBottom: 15 },
  headerListText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  
  card: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 15 },
  alumnoNombre: { color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  
  gridRow: { flexDirection: 'row', gap: 10, marginBottom: 8 },
  gridBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 6 },
  btnText: { color: '#a3a3a3', fontWeight: '600', fontSize: 12 },
  
  btnPresente: { backgroundColor: '#10b981' },
  btnFalta: { backgroundColor: '#ef4444' },
  btnJustificado: { backgroundColor: '#f59e0b' },
  btnPendiente: { backgroundColor: '#6b7280' },
  btnInactivo: { backgroundColor: 'rgba(255,255,255,0.05)' },

  saveButton: { backgroundColor: '#3b82f6', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 20 },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});