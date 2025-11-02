import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../context/AuthContext';
import { statsApi } from '../api/client';

export default function StatsScreen({ navigation }: any) {
  const { user } = useAuth();
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, [user]);

  const loadStats = async () => {
    if (!user?.id) return;
    
    try {
      setLoading(true);
      const response = await statsApi.getStats(user.id);
      if (response.ok) {
        setStats(response.data);
      }
    } catch (error) {
      console.error('Error loading stats:', error);
      // Fallback to calculating from meals if API fails
      try {
        const mealsResponse = await mealsApi.getAll(user.id);
        if (mealsResponse.ok) {
          const meals = mealsResponse.data || [];
          const totalMeals = meals.length;
          const totalTime = meals.reduce((sum: number, m: any) => sum + (m.totalMinutes || 0), 0);
          const avgTime = totalMeals > 0 ? Math.round(totalTime / totalMeals) : 0;
          const totalCost = meals.reduce((sum: number, m: any) => 
            sum + (m.costPerServingCents || 0) * (m.servings || 1), 0
          );
          const avgCost = totalMeals > 0 ? (totalCost / totalMeals / 100).toFixed(2) : 0;
          
          const difficultyCounts = meals.reduce((acc: any, m: any) => {
            acc[m.difficulty || 'MEDIUM'] = (acc[m.difficulty || 'MEDIUM'] || 0) + 1;
            return acc;
          }, {});
          
          const tagsCount: Record<string, number> = {};
          meals.forEach((m: any) => {
            (m.tags || []).forEach((tag: string) => {
              tagsCount[tag] = (tagsCount[tag] || 0) + 1;
            });
          });
          
          const topTags = Object.entries(tagsCount)
            .sort(([, a], [, b]) => (b as number) - (a as number))
            .slice(0, 5)
            .map(([tag]) => tag);

          setStats({
            totalMeals,
            avgTime,
            avgCost,
            difficultyCounts,
            topTags,
            totalTime,
            totalCost: (totalCost / 100).toFixed(2),
          });
        }
      } catch (fallbackError) {
        console.error('Fallback stats calculation failed:', fallbackError);
      }
    } finally {
      setLoading(false);
    }
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
      <View style={styles.header}>
        <Text style={styles.headerTitle}>📊 My Stats</Text>
      </View>
      
      <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.totalMeals || 0}</Text>
            <Text style={styles.statLabel}>Total Meals</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.avgTime || 0}m</Text>
            <Text style={styles.statLabel}>Avg Time</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${stats?.avgCost || 0}</Text>
            <Text style={styles.statLabel}>Avg Cost</Text>
          </View>
          
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{stats?.totalTime || 0}m</Text>
            <Text style={styles.statLabel}>Total Time</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Difficulty Breakdown</Text>
          <View style={styles.breakdown}>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Easy</Text>
              <Text style={styles.breakdownValue}>
                {stats?.difficultyCounts?.EASY || 0}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Medium</Text>
              <Text style={styles.breakdownValue}>
                {stats?.difficultyCounts?.MEDIUM || 0}
              </Text>
            </View>
            <View style={styles.breakdownItem}>
              <Text style={styles.breakdownLabel}>Hard</Text>
              <Text style={styles.breakdownValue}>
                {stats?.difficultyCounts?.HARD || 0}
              </Text>
            </View>
          </View>
        </View>

        {stats?.topTags && stats.topTags.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Top Tags</Text>
            <View style={styles.tagsContainer}>
              {stats.topTags.map((tag: string, idx: number) => (
                <View key={idx} style={styles.tag}>
                  <Text style={styles.tagText}>#{tag}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
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
    padding: 16,
    borderBottomWidth: 0.5,
    borderBottomColor: '#333',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    padding: 16,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: '45%',
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
  statLabel: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    padding: 16,
    marginTop: 8,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#fff',
    marginBottom: 16,
  },
  breakdown: {
    backgroundColor: '#1a1a1a',
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  breakdownItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  breakdownLabel: {
    fontSize: 16,
    color: '#ccc',
  },
  breakdownValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#fff',
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  tag: {
    backgroundColor: '#1a1a1a',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  tagText: {
    fontSize: 14,
    color: '#0095f6',
    fontWeight: '500',
  },
});

