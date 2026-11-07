//creacion de lista
import { CheckCircle, XCircle } from 'lucide-react-native';
import { useState } from 'react';
import { Alert, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

export default function PasarLista() {
  // Datos simulados para probar rápido
  const [alumnos, setAlumnos] = useState([
    { id: 1, nombre: 'Juan Pérez', estado: 'Presente' },
    { id: 2, nombre: 'María López', estado: 'Presente' },
    { id: 3, nombre: 'Pedro García', estado: 'Falta' },
    { id: 4, nombre: 'Lucía Hernández', estado: 'Presente' },
  ]);

  const cambiarEstado = (id, nuevoEstado) => {
    setAlumnos(alumnos.map(a => a.id === id ? { ...a, estado: nuevoEstado } : a));
  };

  const guardarAsistencia = () => {
    Alert.alert("¡Éxito!", "La lista se ha guardado correctamente.");
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        
        <Text style={styles.title}>Pasar Lista</Text>
        <Text style={styles.subtitle}>Marca la asistencia de tus alumnos.</Text>

        {/* Lista de Alumnos */}
        {alumnos.map((alumno) => (
          <View key={alumno.id} style={styles.card}>
            <Text style={styles.alumnoNombre}>{alumno.nombre}</Text>
            
            <View style={styles.row}>
              <TouchableOpacity 
                onPress={() => cambiarEstado(alumno.id, 'Presente')}
                style={[styles.button, alumno.estado === 'Presente' ? styles.btnPresente : styles.btnInactivo]}
              >
                <CheckCircle color={alumno.estado === 'Presente' ? 'white' : '#a3a3a3'} size={18} />
                <Text style={[styles.btnText, alumno.estado === 'Presente' && { color: 'white' }]}>Presente</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                onPress={() => cambiarEstado(alumno.id, 'Falta')}
                style={[styles.button, alumno.estado === 'Falta' ? styles.btnFalta : styles.btnInactivo]}
              >
                <XCircle color={alumno.estado === 'Falta' ? 'white' : '#a3a3a3'} size={18} />
                <Text style={[styles.btnText, alumno.estado === 'Falta' && { color: 'white' }]}>Falta</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        {/* Botón Guardar */}
        <TouchableOpacity onPress={guardarAsistencia} style={styles.saveButton}>
          <Text style={styles.saveButtonText}>Guardar Lista</Text>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#020202' },
  content: { padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  subtitle: { fontSize: 14, color: '#a3a3a3', marginBottom: 30 },
  
  card: { backgroundColor: 'rgba(255,255,255,0.03)', padding: 16, borderRadius: 16, borderWidth: 1, borderColor: 'rgba(255,255,255,0.1)', marginBottom: 15 },
  alumnoNombre: { color: 'white', fontSize: 16, fontWeight: '600', marginBottom: 12 },
  
  row: { flexDirection: 'row', gap: 10 },
  button: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 10, borderRadius: 10, gap: 8 },
  btnPresente: { backgroundColor: '#10b981' },
  btnFalta: { backgroundColor: '#ef4444' },
  btnInactivo: { backgroundColor: 'rgba(255,255,255,0.05)' },
  btnText: { color: '#a3a3a3', fontWeight: '600' },

  saveButton: { backgroundColor: '#3b82f6', paddingVertical: 18, borderRadius: 16, alignItems: 'center', marginTop: 20, shadowColor: '#3b82f6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 10, elevation: 8 },
  saveButtonText: { color: 'white', fontSize: 18, fontWeight: 'bold' }
});