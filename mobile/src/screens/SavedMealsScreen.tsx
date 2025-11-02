import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { savedApi, mealsApi, Meal } from '../api/client';

export default function SavedMealsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [savedMeals, setSavedMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSavedMeals();
  }, []);

  const loadSavedMeals = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await savedApi.getSaved(user.id);
      if (response.ok) {
        setSavedMeals(response.data || []);
      }
    } catch (error) {
      console.error('Error loading saved meals:', error);
      // Fallback to user's own meals if API fails
      try {
        const mealsResponse = await mealsApi.getAll(user.id);
        if (mealsResponse.ok) {
          setSavedMeals(mealsResponse.data || []);
        }
      } catch (fallbackError) {
        console.error('Fallback failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
  };

  const renderMeal = ({ item }: { item: Meal }) => (
    <TouchableOpacity
      style={styles.mealCard}
      onPress={() => navigation.navigate('MealDetail', { mealId: item.id })}
    >
      {item.photos && item.photos.length > 0 ? (
        <Image source={{ uri: item.photos[0] }} style={styles.mealImage} />
      ) : (
        <View style={[styles.mealImage, styles.mealImagePlaceholder]}>
          <Text style={styles.mealImageText}>📷</Text>
        </View>
      )}
      <View style={styles.mealOverlay}>
        <Text style={styles.mealTitle} numberOfLines={2}>
          {item.title}
        </Text>
        {item.user && (
          <Text style={styles.mealUser}>
            by {item.user.name || item.user.username}
          </Text>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>←</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>💾 Saved Meals</Text>
        <View style={styles.headerSpacer} />
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      ) : (
        <FlatList
          data={savedMeals}
          renderItem={renderMeal}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.list}
          columnWrapperStyle={styles.row}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Text style={styles.emptyEmoji}>🔖</Text>
              <Text style={styles.emptyTitle}>No saved meals</Text>
              <Text style={styles.emptyText}>
                Save meals you love to come back to them later!
              </Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  backButton: {
    padding: 8,
    marginRight: 8,
  },
  backButtonText: {
    fontSize: 24,
    color: '#fff',
    fontWeight: '600',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  headerSpacer: {
    width: 40,
  },
  list: {
    padding: 8,
  },
  row: {
    justifyContent: 'space-between',
  },
  mealCard: {
    width: '48%',
    aspectRatio: 1,
    marginBottom: 8,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#1a1a1a',
  },
  mealImage: {
    width: '100%',
    height: '100%',
  },
  mealImagePlaceholder: {
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mealImageText: {
    fontSize: 48,
  },
  mealOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 12,
  },
  mealTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 4,
  },
  mealUser: {
    fontSize: 12,
    color: '#999',
  },
  empty: {
    padding: 48,
    alignItems: 'center',
  },
  emptyEmoji: {
    fontSize: 64,
    marginBottom: 16,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 8,
  },
  emptyText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});

