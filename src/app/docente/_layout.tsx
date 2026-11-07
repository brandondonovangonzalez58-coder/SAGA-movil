import { Tabs } from 'expo-router';
import { ClipboardCheck, History, Home } from 'lucide-react-native';

export default function DocenteLayout() {
  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarStyle: {
          backgroundColor: '#0a1420',
          borderTopColor: 'rgba(255,255,255,0.1)',
          paddingBottom: 5,
          height: 60,
        },
        tabBarActiveTintColor: '#3b82f6',
        tabBarInactiveTintColor: '#737373',
      }}
    >
      <Tabs.Screen
        name="principal"
        options={{
          title: 'Inicio',
          tabBarIcon: ({ color, size }) => <Home color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="pasar-lista"
        options={{
          title: 'Pasar Lista',
          tabBarIcon: ({ color, size }) => <ClipboardCheck color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="historial"
        options={{
          title: 'Historial',
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}