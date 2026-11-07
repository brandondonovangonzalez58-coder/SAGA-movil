import { BookOpen, Calendar, ChevronDown, Clock, User } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import api from '../../api/axios';

export default function HistorialAsistencias() {
  const [sesiones, setSesiones] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [sesionAbierta, setSesionAbierta] = useState(null);
  const [asistencias, setAsistencias] = useState([]);
  const [loadingAsistencias, setLoadingAsistencias] = useState(false);

  useEffect(() => {
    api.get('/sesiones/').then(res => {
      const ordenadas = res.data.sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
      setSesiones(ordenadas);
    }).catch(err => console.log(err)).finally(() => setLoading(false));
  }, []);

  const verDetalle = async (sesion) => {
    if (sesionAbierta?.id_sesion === sesion.id_sesion) {
      setSesionAbierta(null);
      return;
    }
    
    setSesionAbierta(sesion);
    setLoadingAsistencias(true);
    
    try {
      const res = await api.get('/asistencias/');
      const filtradas = res.data.filter(a => a.id_sesion === sesion.id_sesion);
      setAsistencias(filtradas);
    } catch (error) {
      console.log(error);
    } finally {
      setLoadingAsistencias(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.title}>Historial de Clases</Text>
        <Text style={styles.subtitle}>Toca una tarjeta para ver los detalles y la lista de alumnos.</Text>

        {loading && <ActivityIndicator color="#3b82f6" size="large" style={{ marginTop: 30 }} />}

        {!loading && sesiones.length === 0 && (
          <Text style={{ color: '#a3a3a3', textAlign: 'center', marginTop: 30 }}>
            Aún no has guardado ninguna bitácora.
          </Text>
        )}

        {/* TARJETAS CON MÁS ESPACIO */}
        {!loading && sesiones.map((sesion) => (
          <View key={sesion.id_sesion} style={styles.card}>
            
            {/* Cabecera de la Tarjeta */}
            <TouchableOpacity onPress={() => verDetalle(sesion)} style={styles.cardHeader} activeOpacity={0.7}>
              <View style={styles.iconBox}>
                <BookOpen color="#3b82f6" size={24} />
              </View>
              
              <View style={{ flex: 1, marginLeft: 15 }}>
                <Text style={styles.sesionTema} numberOfLines={1}>
                  {sesion.tema || 'Sin tema registrado'}
                </Text>
                <View style={styles.infoRow}>
                  <View style={styles.infoItem}>
                    <Calendar size={14} color="#a3a3a3" />
                    <Text style={styles.sesionDetail}>{sesion.fecha}</Text>
                  </View>
                  <View style={styles.infoItem}>
                    <Clock size={14} color="#a3a3a3" />
                    <Text style={styles.sesionDetail}>
                      {sesion.hora_inicio?.slice(0,5)} - {sesion.hora_fin?.slice(0,5)}
                    </Text>
                  </View>
                </View>
              </View>

              <View style={styles.chevronBox}>
                <ChevronDown 
                  color="#3b82f6" 
                  size={20} 
                  style={{ transform: [{ rotate: sesionAbierta?.id_sesion === sesion.id_sesion ? '180deg' : '0deg' }] }} 
                />
              </View>
            </TouchableOpacity>

            {/* Detalle de la sesión (Lista de alumnos) */}
            {sesionAbierta?.id_sesion === sesion.id_sesion && (
              <View style={styles.cardBody}>
                <Text style={styles.detailTitle}>Alumnos Evaluados</Text>
                
                {loadingAsistencias ? (
                  <ActivityIndicator color="#3b82f6" size="small" />
                ) : asistencias.length === 0 ? (
                  <Text style={{ color: 'gray', textAlign: 'center', padding: 20 }}>No hay registros.</Text>
                ) : (
                  asistencias.map((asistencia, index) => (
                    <View key={asistencia.id_asistencia} style={styles.asistenciaRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                        <View style={styles.avatar}>
                          <User size={14} color="#3b82f6" />
                        </View>
                        {/* 🚨 AQUÍ ESTÁ EL CAMBIO: Usamos el nombre del estudiante */}
                        <Text style={{ color: 'white', fontSize: 15 }}>
                          {asistencia.estudiante?.usuario 
                            ? `${asistencia.estudiante.usuario.nombre} ${asistencia.estudiante.usuario.apellidos}` 
                            : `Alumno ID: ${asistencia.id_estudiante}`}
                        </Text>
                      </View>
                      
                      <View style={[
                        styles.badge, 
                        asistencia.estado === 'Presente' || asistencia.estado === 'Retardo' 
                          ? styles.badgePresente 
                          : styles.badgeFalta
                      ]}>
                        <Text style={styles.badgeText}>{asistencia.estado}</Text>
                      </View>
                    </View>
                  ))
                )}
              </View>
            )}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020202' },
  content: { padding: 20, paddingTop: 60, paddingBottom: 40 },
  
  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 14, color: '#a3a3a3', marginBottom: 25, marginTop: 5 },
  
  card: { 
    backgroundColor: 'rgba(255,255,255,0.03)', 
    borderRadius: 20, 
    borderWidth: 1, 
    borderColor: 'rgba(255,255,255,0.08)', 
    marginBottom: 20,
    overflow: 'hidden' 
  },
  cardHeader: { 
    padding: 20, 
    flexDirection: 'row', 
    alignItems: 'center' 
  },
  
  iconBox: { 
    width: 45, height: 45, 
    borderRadius: 12, 
    backgroundColor: 'rgba(59,130,246,0.1)', 
    alignItems: 'center', justifyContent: 'center' 
  },
  
  sesionTema: { color: 'white', fontSize: 17, fontWeight: 'bold', marginBottom: 6 },
  infoRow: { flexDirection: 'row', gap: 15 },
  infoItem: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  sesionDetail: { color: '#a3a3a3', fontSize: 13 },
  
  chevronBox: { 
    width: 35, height: 35, 
    borderRadius: 10, 
    backgroundColor: 'rgba(59,130,246,0.1)', 
    alignItems: 'center', justifyContent: 'center' 
  },
  
  cardBody: { 
    padding: 20, 
    backgroundColor: 'rgba(0,0,0,0.3)', 
    borderTopWidth: 1, 
    borderTopColor: 'rgba(255,255,255,0.05)' 
  },
  detailTitle: { color: '#a3a3a3', fontSize: 13, fontWeight: 'bold', marginBottom: 15, textTransform: 'uppercase' },
  
  asistenciaRow: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'center', 
    marginBottom: 12,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.05)'
  },
  avatar: { 
    width: 28, height: 28, 
    borderRadius: 14, 
    backgroundColor: 'rgba(59,130,246,0.1)', 
    alignItems: 'center', justifyContent: 'center' 
  },
  
  badge: { paddingHorizontal: 12, paddingVertical: 5, borderRadius: 15 },
  badgePresente: { backgroundColor: 'rgba(16,185,129,0.15)' },
  badgeFalta: { backgroundColor: 'rgba(239,68,68,0.15)' },
  badgeText: { color: 'white', fontSize: 12, fontWeight: 'bold' }
});