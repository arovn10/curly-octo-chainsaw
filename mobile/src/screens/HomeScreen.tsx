import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { mealsApi, Meal } from '../api/client';

export default function HomeScreen({ navigation }: any) {
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [userId] = useState('demo-user-id'); // TODO: Get from auth context

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      setLoading(true);
      const response = await mealsApi.getAll(userId);
      if (response.ok) {
        setMeals(response.data);
      }
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMeal = ({ item }: { item: Meal }) => (
    <TouchableOpacity
      style={styles.mealCard}
      onPress={() => navigation.navigate('MealDetail', { mealId: item.id })}
    >
      <Text style={styles.mealTitle}>{item.title}</Text>
      {item.description && (
        <Text style={styles.mealDescription}>{item.description}</Text>
      )}
      <View style={styles.mealMeta}>
        {item.totalMinutes && (
          <Text style={styles.metaText}>⏱️ {item.totalMinutes}m</Text>
        )}
        {item.costPerServingCents && (
          <Text style={styles.metaText}>
            💰 ${(item.costPerServingCents / 100).toFixed(2)}
          </Text>
        )}
        {item.sentiment && (
          <Text style={styles.metaText}>
            {item.sentiment === 'LOVED' ? '❤️' : item.sentiment === 'FINE' ? '👍' : '😐'}
          </Text>
        )}
      </View>
      {item.globalScore && (
        <Text style={styles.scoreText}>Score: {Math.round(item.globalScore)}</Text>
      )}
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍝 NoshLog</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => navigation.navigate('AddMeal')}
        >
          <Text style={styles.addButtonText}>+ Add Meal</Text>
        </TouchableOpacity>
      </View>
      <FlatList
        data={meals}
        renderItem={renderMeal}
        keyExtractor={(item) => item.id}
        refreshing={loading}
        onRefresh={loadMeals}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No meals yet. Add your first meal!</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  mealCard: {
    backgroundColor: '#fff',
    margin: 12,
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  mealTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  mealDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 12,
  },
  mealMeta: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 8,
  },
  metaText: {
    fontSize: 14,
    color: '#666',
  },
  scoreText: {
    fontSize: 12,
    color: '#007AFF',
    marginTop: 8,
    fontWeight: '600',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    fontSize: 16,
    color: '#999',
  },
});

