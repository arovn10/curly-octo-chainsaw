import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
} from 'react-native';
import { mealsApi, Meal } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function RecommendedScreen({ navigation }: any) {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadRecommended();
  }, []);

  const loadRecommended = async () => {
    try {
      setLoading(true);
      // Get top-rated public meals
      const response = await mealsApi.getAll(undefined, true);
      if (response.ok) {
        const allMeals = response.data || [];
        // Sort by globalScore (highest first)
        const sorted = [...allMeals].sort((a, b) => 
          (b.globalScore || 0) - (a.globalScore || 0)
        );
        setMeals(sorted.slice(0, 20)); // Top 20
      }
    } catch (error) {
      console.error('Error loading recommended:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderMeal = ({ item }: { item: Meal }) => (
    <TouchableOpacity
      style={styles.mealCard}
      onPress={() => navigation.navigate('MealDetail', { mealId: item.id })}
    >
      <View style={styles.header}>
        <View style={styles.userInfo}>
          {item.user?.image && (
            <Image source={{ uri: item.user.image }} style={styles.avatar} />
          )}
          <Text style={styles.userName}>
            {item.user?.name || item.user?.username || 'Anonymous'}
          </Text>
        </View>
        {item.globalScore && (
          <View style={styles.scoreBadge}>
            <Text style={styles.scoreText}>⭐ {Math.round(item.globalScore)}</Text>
          </View>
        )}
      </View>
      
      {item.photos && item.photos.length > 0 && (
        <Image source={{ uri: item.photos[0] }} style={styles.mealImage} />
      )}
      
      <Text style={styles.mealTitle}>{item.title}</Text>
      {item.description && (
        <Text style={styles.mealDescription} numberOfLines={2}>
          {item.description}
        </Text>
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
      </View>
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
      <View style={styles.headerSection}>
        <Text style={styles.headerTitle}>⭐ Recommended</Text>
        <Text style={styles.headerSubtitle}>Top-rated dishes from the community</Text>
      </View>
      <FlatList
        data={meals}
        renderItem={renderMeal}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyText}>No recommendations yet</Text>
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
  headerSection: {
    backgroundColor: '#fff',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#666',
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
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#e0e0e0',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
  },
  scoreBadge: {
    backgroundColor: '#FFD700',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  scoreText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#333',
  },
  mealImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
    backgroundColor: '#f0f0f0',
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
  },
  metaText: {
    fontSize: 14,
    color: '#666',
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

