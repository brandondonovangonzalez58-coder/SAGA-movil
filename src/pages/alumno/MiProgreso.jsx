//progreso del alumno
import { CheckCircle, XCircle } from 'lucide-react-native';
import { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

export default function MiProgreso() {
  // Datos simulados (luego los conectamos a tu backend)
  const [progreso] = useState({
    total: 20,
    presentes: 17,
    faltas: 3,
    porcentaje: 85,
    acredita: true
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <Text style={styles.title}>Mi Progreso</Text>
      <Text style={styles.subtitle}>Revisa tu porcentaje de asistencia</Text>

      {/* Tarjeta de Porcentaje */}
      <View style={[styles.card, progreso.acredita ? styles.cardSuccess : styles.cardDanger]}>
        <View style={[styles.iconCircle, progreso.acredita ? styles.bgSuccess : styles.bgDanger]}>
          {progreso.acredita ? <CheckCircle color="#10b981" size={48} /> : <XCircle color="#ef4444" size={48} />}
        </View>
        <Text style={[styles.percentage, progreso.acredita ? styles.textSuccess : styles.textDanger]}>
          {progreso.porcentaje}%
        </Text>
        <Text style={styles.cardTitle}>Asistencia General</Text>
        <Text style={styles.cardText}>
          {progreso.acredita ? '¡Felicidades! Cumples con el 80% requerido.' : 'Cuidado, necesitas al menos 80% para acreditar.'}
        </Text>
      </View>

      {/* Tarjeta de Detalles */}
      <View style={styles.cardDetail}>
        <Text style={styles.detailTitle}>Resumen</Text>
        
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Clases Totales</Text>
          <Text style={styles.rowValue}>{progreso.total}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Asistencias</Text>
          <Text style={[styles.rowValue, { color: '#10b981' }]}>{progreso.presentes}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.rowLabel}>Faltas</Text>
          <Text style={[styles.rowValue, { color: '#ef4444' }]}>{progreso.faltas}</Text>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020202' },
  content: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 14, color: '#a3a3a3', marginBottom: 30 },
  
  card: { padding: 30, borderRadius: 24, borderWidth: 1, alignItems: 'center', marginBottom: 20 },
  cardSuccess: { backgroundColor: 'rgba(16,185,129,0.1)', borderColor: 'rgba(16,185,129,0.3)' },
  cardDanger: { backgroundColor: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' },
  iconCircle: { width: 80, height: 80, borderRadius: 40, alignItems: 'center', justifyContent: 'center', marginBottom: 15 },
  bgSuccess: { backgroundColor: 'rgba(16,185,129,0.2)' },
  bgDanger: { backgroundColor: 'rgba(239,68,68,0.2)' },
  percentage: { fontSize: 56, fontWeight: 'bold', marginBottom: 5 },
  textSuccess: { color: '#10b981' },
  textDanger: { color: '#ef4444' },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: '600' },
  cardText: { color: '#a3a3a3', textAlign: 'center', marginTop: 10, fontSize: 14 },

  cardDetail: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 25, borderRadius: 24, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)' },
  detailTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 20 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.05)', padding: 15, borderRadius: 12, marginBottom: 10 },
  rowLabel: { color: '#a3a3a3', fontSize: 15 },
  rowValue: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});