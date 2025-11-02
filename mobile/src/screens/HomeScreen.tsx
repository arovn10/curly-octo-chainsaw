import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  Image,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { mealsApi, Meal } from '../api/client';
import { useAuth } from '../context/AuthContext';

const { width } = Dimensions.get('window');

export default function HomeScreen({ navigation }: any) {
  const { user } = useAuth();
  const [meals, setMeals] = useState<Meal[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [likedMeals, setLikedMeals] = useState<Set<string>>(new Set());

  useEffect(() => {
    loadMeals();
  }, []);

  const loadMeals = async () => {
    try {
      setLoading(true);
      const response = await mealsApi.getAll(undefined, true);
      if (response.ok) {
        setMeals(response.data || []);
      }
    } catch (error) {
      console.error('Error loading meals:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadMeals();
  };

  const handleLike = (mealId: string) => {
    setLikedMeals((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(mealId)) {
        newSet.delete(mealId);
      } else {
        newSet.add(mealId);
      }
      return newSet;
    });
    // TODO: Call API to like/unlike
  };

  const formatTimeAgo = (date: string | Date) => {
    const now = new Date();
    const then = new Date(date);
    const diffInSeconds = Math.floor((now.getTime() - then.getTime()) / 1000);
    
    if (diffInSeconds < 60) return 'now';
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h`;
    if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d`;
    return then.toLocaleDateString();
  };

  const renderMeal = ({ item }: { item: Meal }) => {
    const isLiked = likedMeals.has(item.id);
    const likeCount = item._count?.likes || 0;
    const commentCount = item._count?.comments || 0;

    return (
      <View style={styles.card}>
        {/* Header */}
        <View style={styles.cardHeader}>
          <View style={styles.userInfo}>
            <View style={styles.avatar}>
              {item.user?.image ? (
                <Image source={{ uri: item.user.image }} style={styles.avatarImage} />
              ) : (
                <Text style={styles.avatarText}>
                  {(item.user?.name || item.user?.username || 'U')[0].toUpperCase()}
                </Text>
              )}
            </View>
            <View>
              <Text style={styles.userName}>
                {item.user?.name || item.user?.username || 'Anonymous'}
              </Text>
              <Text style={styles.timeAgo}>
                {formatTimeAgo(item.dateCooked || item.createdAt)}
              </Text>
            </View>
          </View>
          <TouchableOpacity>
            <Text style={styles.moreButton}>⋯</Text>
          </TouchableOpacity>
        </View>

        {/* Photo */}
        {item.photos && item.photos.length > 0 && (
          <Image 
            source={{ uri: item.photos[0] }} 
            style={styles.photo}
            resizeMode="cover"
          />
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <View style={styles.actionLeft}>
            <TouchableOpacity 
              style={styles.actionButton}
              onPress={() => handleLike(item.id)}
            >
              <Text style={styles.actionIcon}>
                {isLiked ? '❤️' : '🤍'}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>💬</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.actionButton}>
              <Text style={styles.actionIcon}>📤</Text>
            </TouchableOpacity>
          </View>
          <TouchableOpacity style={styles.actionButton}>
            <Text style={styles.actionIcon}>🔖</Text>
          </TouchableOpacity>
        </View>

        {/* Likes */}
        {likeCount > 0 && (
          <Text style={styles.likesText}>
            {likeCount} {likeCount === 1 ? 'like' : 'likes'}
          </Text>
        )}

        {/* Caption */}
        <View style={styles.caption}>
          <Text style={styles.captionUser}>
            {item.user?.username || item.user?.name || 'Anonymous'}
          </Text>
          <Text style={styles.captionText}> {item.title}</Text>
        </View>
        {item.description && (
          <Text style={styles.description} numberOfLines={2}>
            {item.description}
          </Text>
        )}

        {/* Comments */}
        {commentCount > 0 && (
          <TouchableOpacity>
            <Text style={styles.viewComments}>
              View all {commentCount} {commentCount === 1 ? 'comment' : 'comments'}
            </Text>
          </TouchableOpacity>
        )}

        {/* Meta Info */}
        <View style={styles.metaInfo}>
          {item.totalMinutes && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaIcon}>⏱️</Text>
              <Text style={styles.metaText}>{item.totalMinutes}m</Text>
            </View>
          )}
          {item.costPerServingCents && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaIcon}>💰</Text>
              <Text style={styles.metaText}>${(item.costPerServingCents / 100).toFixed(2)}</Text>
            </View>
          )}
          {item.difficulty && (
            <View style={styles.metaBadge}>
              <Text style={styles.metaText}>{item.difficulty}</Text>
            </View>
          )}
        </View>

        {/* Tags */}
        {item.tags && item.tags.length > 0 && (
          <View style={styles.tags}>
            {item.tags.slice(0, 3).map((tag, idx) => (
              <TouchableOpacity key={idx} style={styles.tag}>
                <Text style={styles.tagText}>#{tag}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </View>
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container} edges={['top']}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color="#FF6B6B" />
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>🍽️ NomNom</Text>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.headerButton}>
            <Text style={styles.headerIcon}>🔔</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={styles.headerButton}
            onPress={() => navigation.navigate('AddMeal')}
          >
            <Text style={styles.headerIcon}>➕</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={meals}
        renderItem={renderMeal}
        keyExtractor={(item) => item.id}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing} 
            onRefresh={onRefresh}
            tintColor="#FF6B6B"
          />
        }
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Text style={styles.emptyEmoji}>🍽️</Text>
            <Text style={styles.emptyTitle}>No meals yet</Text>
            <Text style={styles.emptyText}>
              Start sharing your culinary creations!
            </Text>
            <TouchableOpacity
              style={styles.emptyButton}
              onPress={() => navigation.navigate('AddMeal')}
            >
              <Text style={styles.emptyButtonText}>Add Your First Meal</Text>
            </TouchableOpacity>
          </View>
        }
      />
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
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#000',
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  headerActions: {
    flexDirection: 'row',
    gap: 12,
  },
  headerButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerIcon: {
    fontSize: 24,
  },
  card: {
    backgroundColor: '#000',
    marginBottom: 1,
    paddingBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 12,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#333',
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  userName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  timeAgo: {
    fontSize: 12,
    color: '#999',
    marginTop: 2,
  },
  moreButton: {
    fontSize: 24,
    color: '#fff',
    paddingHorizontal: 8,
  },
  photo: {
    width: '100%',
    height: width,
    backgroundColor: '#111',
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
  },
  actionLeft: {
    flexDirection: 'row',
    gap: 16,
  },
  actionButton: {
    padding: 4,
  },
  actionIcon: {
    fontSize: 28,
  },
  likesText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  caption: {
    flexDirection: 'row',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  captionUser: {
    fontSize: 14,
    fontWeight: '600',
    color: '#fff',
  },
  captionText: {
    fontSize: 14,
    color: '#fff',
  },
  description: {
    fontSize: 14,
    color: '#ccc',
    paddingHorizontal: 12,
    marginBottom: 4,
  },
  viewComments: {
    fontSize: 14,
    color: '#999',
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  metaInfo: {
    flexDirection: 'row',
    gap: 8,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  metaBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  metaIcon: {
    fontSize: 12,
  },
  metaText: {
    fontSize: 12,
    color: '#ccc',
    fontWeight: '500',
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    paddingHorizontal: 12,
    marginTop: 8,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  tagText: {
    fontSize: 13,
    color: '#0095f6',
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
    marginBottom: 24,
  },
  emptyButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  emptyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
