import React from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { AuthProvider, useAuth } from './src/context/AuthContext';
import LoginScreen from './src/screens/LoginScreen';
import HomeScreen from './src/screens/HomeScreen';
import MyMealsScreen from './src/screens/MyMealsScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import RecommendedScreen from './src/screens/RecommendedScreen';
import AddMealScreen from './src/screens/AddMealScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

function HomeStack() {
  return (
    <Stack.Navigator>
      <Stack.Screen
        name="Home"
        component={HomeScreen}
        options={{ title: '🍽️ NomNom' }}
      />
      <Stack.Screen
        name="AddMeal"
        component={AddMealScreen}
        options={{ title: 'Add Meal' }}
      />
    </Stack.Navigator>
  );
}

function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return null; // Or a loading screen
  }

  if (!isAuthenticated) {
    return (
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          <Stack.Screen name="Login" component={LoginScreen} />
        </Stack.Navigator>
      </NavigationContainer>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        <Stack.Screen name="MainTabs">
          {() => (
            <Tab.Navigator
              screenOptions={{
                tabBarActiveTintColor: '#FF6B6B',
                tabBarInactiveTintColor: '#999',
                headerShown: false,
              }}
            >
              <Tab.Screen
                name="PublicFeed"
                component={HomeScreen}
                options={{ 
                  tabBarLabel: 'Public',
                  tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🌍</Text>,
                }}
              />
              <Tab.Screen
                name="MyMeals"
                component={MyMealsScreen}
                options={{ 
                  tabBarLabel: 'My Meals',
                  tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>🍽️</Text>,
                }}
              />
              <Tab.Screen
                name="Recommended"
                component={RecommendedScreen}
                options={{ 
                  tabBarLabel: 'Recommended',
                  tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>⭐</Text>,
                }}
              />
              <Tab.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ 
                  tabBarLabel: 'Profile',
                  tabBarIcon: ({ color }) => <Text style={{ fontSize: 20 }}>👤</Text>,
                }}
              />
            </Tab.Navigator>
          )}
        </Stack.Screen>
        <Stack.Screen
          name="AddMeal"
          component={AddMealScreen}
          options={{ 
            presentation: 'modal',
            headerShown: true,
            title: 'Add Meal',
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <StatusBar style="auto" />
      <AuthProvider>
        <AppNavigator />
      </AuthProvider>
    </SafeAreaProvider>
  );
}
