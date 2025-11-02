import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Image,
  ActivityIndicator,
} from 'react-native';
import { mealsApi } from '../api/client';
import { pickMultipleImages } from '../utils/upload';

export default function AddMealScreen({ navigation }: any) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepMinutes, setPrepMinutes] = useState('');
  const [totalMinutes, setTotalMinutes] = useState('');
  const [servings, setServings] = useState('');
  const [costPerServing, setCostPerServing] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [photos, setPhotos] = useState<string[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId] = useState('demo-user-id'); // TODO: Get from auth

  const pickImage = async () => {
    try {
      setUploading(true);
      const uploadedPhotos = await pickMultipleImages();
      if (uploadedPhotos.length > 0) {
        const newUrls = uploadedPhotos.map(p => p.publicUrl);
        setPhotos([...photos, ...newUrls]);
      }
    } catch (error: any) {
      Alert.alert('Upload Error', error.message || 'Failed to upload photos');
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a meal title');
      return;
    }

    setLoading(true);
    try {
      const mealData = {
        userId,
        title: title.trim(),
        description: description.trim() || undefined,
        tags: [], // TODO: Add tag input
        difficulty,
        prepMinutes: prepMinutes ? parseInt(prepMinutes) : undefined,
        totalMinutes: totalMinutes ? parseInt(totalMinutes) : undefined,
        servings: servings ? parseInt(servings) : undefined,
        costPerServingCents: costPerServing ? Math.round(parseFloat(costPerServing) * 100) : undefined,
        photos,
        isPublic: false,
      };

      const response = await mealsApi.create(mealData);
      
      if (response.ok) {
        Alert.alert('Success', 'Meal added!', [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]);
      } else {
        Alert.alert('Error', response.error || 'Failed to create meal');
      }
    } catch (error) {
      console.error('Error creating meal:', error);
      Alert.alert('Error', 'Failed to create meal');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.label}>Meal Title *</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="e.g., Garlic Butter Shrimp"
        />

        <Text style={styles.label}>Description</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Optional description"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Difficulty</Text>
        <View style={styles.difficultyContainer}>
          {(['EASY', 'MEDIUM', 'HARD'] as const).map((diff) => (
            <TouchableOpacity
              key={diff}
              style={[
                styles.difficultyButton,
                difficulty === diff && styles.difficultyButtonActive,
              ]}
              onPress={() => setDifficulty(diff)}
            >
              <Text
                style={[
                  styles.difficultyText,
                  difficulty === diff && styles.difficultyTextActive,
                ]}
              >
                {diff}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Prep Time (min)</Text>
            <TextInput
              style={styles.input}
              value={prepMinutes}
              onChangeText={setPrepMinutes}
              keyboardType="numeric"
              placeholder="10"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Total Time (min)</Text>
            <TextInput
              style={styles.input}
              value={totalMinutes}
              onChangeText={setTotalMinutes}
              keyboardType="numeric"
              placeholder="25"
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={styles.half}>
            <Text style={styles.label}>Servings</Text>
            <TextInput
              style={styles.input}
              value={servings}
              onChangeText={setServings}
              keyboardType="numeric"
              placeholder="2"
            />
          </View>
          <View style={styles.half}>
            <Text style={styles.label}>Cost per Serving ($)</Text>
            <TextInput
              style={styles.input}
              value={costPerServing}
              onChangeText={setCostPerServing}
              keyboardType="decimal-pad"
              placeholder="5.50"
            />
          </View>
        </View>

        <Text style={styles.label}>Photos</Text>
        <TouchableOpacity
          style={[styles.photoButton, uploading && styles.photoButtonDisabled]}
          onPress={pickImage}
          disabled={uploading}
        >
          {uploading ? (
            <ActivityIndicator color="#007AFF" />
          ) : (
            <Text style={styles.photoButtonText}>
              📷 {photos.length > 0 ? `Add More (${photos.length})` : 'Add Photos'}
            </Text>
          )}
        </TouchableOpacity>

        {photos.length > 0 && (
          <View style={styles.photosContainer}>
            {photos.map((photo, index) => (
              <View key={index} style={styles.photoItem}>
                <Image source={{ uri: photo }} style={styles.photoPreview} />
                <TouchableOpacity
                  style={styles.removePhotoButton}
                  onPress={() => removePhoto(index)}
                >
                  <Text style={styles.removePhotoText}>×</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'Adding...' : 'Add Meal'}
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  difficultyContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  difficultyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
    backgroundColor: '#fff',
    alignItems: 'center',
  },
  difficultyButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  difficultyText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  difficultyTextActive: {
    color: '#fff',
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  half: {
    flex: 1,
  },
  photoButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
  },
  photoButtonText: {
    fontSize: 16,
    color: '#007AFF',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
  },
  submitButtonDisabled: {
    opacity: 0.5,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  photoButtonDisabled: {
    opacity: 0.5,
  },
  photosContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 12,
  },
  photoItem: {
    position: 'relative',
    width: 100,
    height: 100,
  },
  photoPreview: {
    width: 100,
    height: 100,
    borderRadius: 8,
  },
  removePhotoButton: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: '#ff3b30',
    borderRadius: 12,
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  removePhotoText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

