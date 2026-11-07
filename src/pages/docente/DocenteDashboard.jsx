// Dashboard del Docente con métricas de rendimiento (filtrado por carrera y grupo)
import { AlertTriangle, Award, BookOpen, ChevronDown, GraduationCap, Scale, TrendingUp, Users } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../../api/axios';
import { useAuthStore } from '../../store/authStore';

const ESTADOS_PRESENTE = ['Presente', 'Retardo', 'Justificada'];

export default function DocenteDashboard() {
  const usuario = useAuthStore((s) => s.usuario);

  // --- Selectores jerárquicos (igual que Pasar Lista) ---
  const [carreras, setCarreras] = useState([]);
  const [grupos, setGrupos] = useState([]);
  const [carreraSeleccionada, setCarreraSeleccionada] = useState(null);
  const [grupoSeleccionado, setGrupoSeleccionado] = useState(null);
  const [menuAbierto, setMenuAbierto] = useState(null);

  // --- Estados de carga ---
  const [loadingCarreras, setLoadingCarreras] = useState(true);
  const [loadingFiltro, setLoadingFiltro] = useState(false);

  // --- Estado del dashboard ---
  const [stats, setStats] = useState({
    grupos: 0,
    clases: 0,
    mejorAlumno: null,
    regularAlumno: null,
    peorAlumno: null,
    promedioGeneral: 0
  });

  // 1) Cargar carreras al montar
  useEffect(() => {
    api.get('/carreras/')
      .then(res => setCarreras(Array.isArray(res.data) ? res.data : []))
      .catch(console.log)
      .finally(() => setLoadingCarreras(false));
  }, []);

  // 2) Al elegir carrera, cargar sus grupos
  const seleccionarCarrera = async (carrera) => {
    setCarreraSeleccionada(carrera);
    setGrupoSeleccionado(null);
    setGrupos([]);
    setMenuAbierto(null);
    setLoadingFiltro(true);
    try {
      const res = await api.get('/grupos/');
      const todos = Array.isArray(res.data) ? res.data : [];
      setGrupos(todos.filter(g => g.id_carrera === carrera.id_carrera));
    } catch (error) {
      console.log('Error cargando grupos', error);
    } finally {
      setLoadingFiltro(false);
    }
  };

  // 3) Al elegir grupo, recalcular métricas solo de ese grupo
  const seleccionarGrupo = async (grupo) => {
    setGrupoSeleccionado(grupo);
    setMenuAbierto(null);
    setLoadingFiltro(true);
    try {
      const [resAsistencias, resEstudiantes] = await Promise.all([
        api.get('/asistencias/'),
        api.get(`/estudiantes/grupo/${grupo.id_grupo}`)
      ]);

      const asistencias = Array.isArray(resAsistencias.data) ? resAsistencias.data : [];
      const estudiantes = Array.isArray(resEstudiantes.data) ? resEstudiantes.data : [];

      // IDs de estudiantes del grupo seleccionado
      const idsDelGrupo = new Set(estudiantes.map(e => e.id_estudiante));

      // Asistencias SOLO de alumnos del grupo
      const asistenciasGrupo = asistencias.filter(a => idsDelGrupo.has(a.id_estudiante));

      // Rendimiento por alumno
      const rendimiento = estudiantes.map(est => {
        const asisAlumno = asistenciasGrupo.filter(a => a.id_estudiante === est.id_estudiante);
        const total = asisAlumno.length;
        if (total === 0) return null;

        const presentes = asisAlumno.filter(a => ESTADOS_PRESENTE.includes(a.estado)).length;
        const faltas = asisAlumno.filter(a => a.estado === 'Falta').length;
        const porcentaje = Math.round((presentes / total) * 100);

        return {
          nombre: `${est.usuario?.nombre ?? ''} ${est.usuario?.apellidos ?? ''}`.trim() || 'Sin nombre',
          porcentaje,
          faltas,
          totalClases: total
        };
      }).filter(Boolean);

      if (rendimiento.length === 0) {
        setStats({
          grupos: 1,
          clases: asistenciasGrupo.length,
          mejorAlumno: null,
          regularAlumno: null,
          peorAlumno: null,
          promedioGeneral: 0
        });
        return;
      }

      // Promedio general
      const promedio = Math.round(
        rendimiento.reduce((acc, c) => acc + c.porcentaje, 0) / rendimiento.length
      );

      // Más eficiente / mayor riesgo
      const ordenados = [...rendimiento].sort((a, b) => b.porcentaje - a.porcentaje);
      const mejor = ordenados[0];
      const peor = ordenados[ordenados.length - 1];

      // Más regular = más cercano al promedio (excluyendo mejor y peor)
      const candidatosRegular = rendimiento.filter(
        a => a.nombre !== mejor.nombre && a.nombre !== peor.nombre
      );
      const pool = candidatosRegular.length > 0 ? candidatosRegular : rendimiento;
      const regular = pool.reduce((prev, curr) =>
        Math.abs(curr.porcentaje - promedio) < Math.abs(prev.porcentaje - promedio) ? curr : prev
      );

      setStats({
        grupos: 1,
        clases: asistenciasGrupo.length,
        mejorAlumno: mejor,
        regularAlumno: regular,
        peorAlumno: peor,
        promedioGeneral: promedio
      });
    } catch (error) {
      console.log('Error cargando métricas del grupo', error);
    } finally {
      setLoadingFiltro(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.title}>Hola, Profe {usuario?.nombre} 👨‍🏫</Text>
        <Text style={styles.subtitle}>Selecciona carrera y grupo para ver el rendimiento.</Text>

        {/* === SELECTOR JERÁRQUICO === */}
        <Text style={styles.stepLabel}>1. Carrera</Text>
        <TouchableOpacity
          style={styles.selector}
          onPress={() => !loadingCarreras && setMenuAbierto(menuAbierto === 'carrera' ? null : 'carrera')}
          disabled={loadingCarreras}
        >
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <GraduationCap color="#3b82f6" size={20} />
            <Text style={{ color: carreraSeleccionada ? 'white' : '#737373' }}>
              {loadingCarreras
                ? 'Cargando carreras...'
                : carreraSeleccionada
                  ? carreraSeleccionada.nombre
                  : 'Elige una carrera...'}
            </Text>
          </View>
          {loadingCarreras
            ? <ActivityIndicator color="#3b82f6" size="small" />
            : <ChevronDown color="white" size={20} />
          }
        </TouchableOpacity>
        {menuAbierto === 'carrera' && (
          <View style={styles.dropdown}>
            {carreras.length === 0 && (
              <Text style={{ color: '#a3a3a3', padding: 15 }}>
                No hay carreras disponibles.
              </Text>
            )}
            {carreras.map(c => (
              <TouchableOpacity
                key={c.id_carrera}
                style={styles.dropdownItem}
                onPress={() => seleccionarCarrera(c)}
              >
                <Text style={{ color: 'white' }}>{c.nombre}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {carreraSeleccionada && (
          <>
            <Text style={[styles.stepLabel, { marginTop: 15 }]}>2. Grupo</Text>
            <TouchableOpacity
              style={styles.selector}
              onPress={() => setMenuAbierto(menuAbierto === 'grupo' ? null : 'grupo')}
            >
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Users color="#10b981" size={20} />
                <Text style={{ color: grupoSeleccionado ? 'white' : '#737373' }}>
                  {grupoSeleccionado
                    ? `Grupo ${grupoSeleccionado.nombre} (${grupoSeleccionado.turno})`
                    : 'Elige un grupo...'}
                </Text>
              </View>
              <ChevronDown color="white" size={20} />
            </TouchableOpacity>
            {menuAbierto === 'grupo' && (
              <View style={styles.dropdown}>
                {grupos.length === 0 && (
                  <Text style={{ color: '#a3a3a3', padding: 15 }}>
                    No hay grupos en esta carrera.
                  </Text>
                )}
                {grupos.map(g => (
                  <TouchableOpacity
                    key={g.id_grupo}
                    style={styles.dropdownItem}
                    onPress={() => seleccionarGrupo(g)}
                  >
                    <Text style={{ color: 'white' }}>Grupo {g.nombre} - {g.turno}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </>
        )}

        {loadingFiltro && (
          <ActivityIndicator color="#3b82f6" size="large" style={{ marginTop: 20 }} />
        )}

        {/* === MÉTRICAS (solo si hay grupo seleccionado) === */}
        {!loadingFiltro && grupoSeleccionado && (
          <>
            <View style={styles.separator} />

            {/* 🏆 Más eficiente */}
            <View style={styles.card}>
              <View style={styles.iconBox}>
                <Award color="#10b981" size={28} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>🏆 Alumno Más Eficiente</Text>
                <Text style={styles.cardValue}>
                  {stats.mejorAlumno ? stats.mejorAlumno.nombre : 'Sin datos'}
                </Text>
                <Text style={styles.cardHighlightGreen}>
                  {stats.mejorAlumno ? `${stats.mejorAlumno.porcentaje}% asistencia` : '0%'}
                </Text>
              </View>
            </View>

            {/* ⚖️ Más regular */}
            <View style={styles.card}>
              <View style={styles.iconBox}>
                <Scale color="#3b82f6" size={28} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>⚖️ Alumno Más Regular</Text>
                <Text style={styles.cardValue}>
                  {stats.regularAlumno ? stats.regularAlumno.nombre : 'Sin datos'}
                </Text>
                <Text style={styles.cardHighlightBlue}>
                  {stats.regularAlumno
                    ? `${stats.regularAlumno.porcentaje}% (cerca del promedio)`
                    : '0%'}
                </Text>
              </View>
            </View>

            {/* ⚠️ Mayor riesgo */}
            <View style={styles.card}>
              <View style={styles.iconBox}>
                <AlertTriangle color="#ef4444" size={28} />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>⚠️ Mayor Riesgo de Reprobar por Faltas</Text>
                <Text style={styles.cardValue}>
                  {stats.peorAlumno ? stats.peorAlumno.nombre : 'Sin datos'}
                </Text>
                <Text style={styles.cardHighlightRed}>
                  {stats.peorAlumno
                    ? `${stats.peorAlumno.porcentaje}% · ${stats.peorAlumno.faltas} falta(s)`
                    : '0%'}
                </Text>
              </View>
            </View>

            {/* Estadísticas Generales */}
            <View style={styles.statsGrid}>
              <View style={styles.miniCard}>
                <Users color="#3b82f6" size={20} />
                <Text style={styles.miniValue}>{stats.grupos}</Text>
                <Text style={styles.miniLabel}>Grupo</Text>
              </View>
              <View style={styles.miniCard}>
                <BookOpen color="#f59e0b" size={20} />
                <Text style={styles.miniValue}>{stats.clases}</Text>
                <Text style={styles.miniLabel}>Asistencias</Text>
              </View>
              <View style={styles.miniCard}>
                <TrendingUp color="#10b981" size={20} />
                <Text style={styles.miniValue}>{stats.promedioGeneral}%</Text>
                <Text style={styles.miniLabel}>Promedio Gral.</Text>
              </View>
            </View>
          </>
        )}

        {!grupoSeleccionado && !loadingFiltro && (
          <View style={styles.emptyState}>
            <GraduationCap color="#3b82f6" size={48} />
            <Text style={styles.emptyTitle}>Selecciona un grupo</Text>
            <Text style={styles.emptySubtitle}>
              Elige una carrera y luego un grupo para ver las métricas de rendimiento.
            </Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020202' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },

  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 14, color: '#a3a3a3', marginBottom: 20 },
  stepLabel: { color: '#a3a3a3', fontSize: 12, fontWeight: 'bold', marginBottom: 8, textTransform: 'uppercase' },

  // Selectores (idénticos a Pasar Lista)
  selector: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    padding: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  dropdown: {
    backgroundColor: '#0a1420',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 15,
    marginTop: 5,
    overflow: 'hidden'
  },
  dropdownItem: { padding: 15, borderBottomWidth: 1, borderBottomColor: 'rgba(255,255,255,0.1)' },

  separator: { height: 1, backgroundColor: 'rgba(255,255,255,0.1)', marginVertical: 25 },

  // Tarjetas de métricas
  card: {
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 20,
    padding: 20,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15
  },
  iconBox: {
    width: 55, height: 55,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center', justifyContent: 'center'
  },
  cardInfo: { flex: 1 },
  cardLabel: { color: '#a3a3a3', fontSize: 13, marginBottom: 4 },
  cardValue: { color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 4 },
  cardHighlightGreen: { color: '#10b981', fontSize: 18, fontWeight: 'bold' },
  cardHighlightBlue: { color: '#3b82f6', fontSize: 18, fontWeight: 'bold' },
  cardHighlightRed: { color: '#ef4444', fontSize: 18, fontWeight: 'bold' },

  // Grid de mini tarjetas
  statsGrid: { flexDirection: 'row', gap: 10, marginTop: 10 },
  miniCard: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    borderRadius: 16,
    padding: 15,
    alignItems: 'center',
    gap: 5
  },
  miniValue: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  miniLabel: { color: '#a3a3a3', fontSize: 11, textAlign: 'center' },

  // Estado vacío
  emptyState: {
    marginTop: 40,
    alignItems: 'center',
    gap: 10,
    paddingHorizontal: 20
  },
  emptyTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  emptySubtitle: { color: '#a3a3a3', fontSize: 13, textAlign: 'center' }
});