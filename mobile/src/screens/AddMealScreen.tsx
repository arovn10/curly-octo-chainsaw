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
import { SafeAreaView } from 'react-native-safe-area-context';
import { mealsApi } from '../api/client';
import { uploadSingleImage } from '../utils/upload';
import CookingTimer from '../components/CookingTimer';
import { useAuth } from '../context/AuthContext';
import * as ImagePicker from 'expo-image-picker';

interface PhotoWithDescription {
  uri: string;
  description: string;
  uploadedUrl?: string;
  uploading?: boolean;
}

interface RecipeStep {
  instruction: string;
  timerSeconds?: number;
}

export default function AddMealScreen({ navigation }: any) {
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [prepMinutes, setPrepMinutes] = useState('');
  const [totalMinutes, setTotalMinutes] = useState('');
  const [servings, setServings] = useState('');
  const [costPerServing, setCostPerServing] = useState('');
  const [difficulty, setDifficulty] = useState<'EASY' | 'MEDIUM' | 'HARD'>('MEDIUM');
  const [photos, setPhotos] = useState<PhotoWithDescription[]>([]);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [userId] = useState(user?.id || 'demo-user-id');
  const [trackedMinutes, setTrackedMinutes] = useState<number | null>(null);
  const [showTimer, setShowTimer] = useState(false);
  const [recipeSteps, setRecipeSteps] = useState<RecipeStep[]>([{ instruction: '' }]);

  const pickImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsMultipleSelection: true,
        quality: 0.8,
      });

      if (!result.canceled && result.assets) {
        // Show images immediately with local URIs
        const newPhotos: PhotoWithDescription[] = result.assets.map(asset => ({
          uri: asset.uri,
          description: '',
          uploading: false,
        }));
        setPhotos([...photos, ...newPhotos]);
        
        // Upload in background
        uploadPhotos(newPhotos);
      }
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to pick images');
    }
  };

  const uploadPhotos = async (photosToUpload: PhotoWithDescription[]) => {
    setUploading(true);
    try {
      const uploadPromises = photosToUpload.map(async (photo, index) => {
        const photoIndex = photos.length + index;
        setPhotos(prev => {
          const updated = [...prev];
          updated[photoIndex] = { ...updated[photoIndex], uploading: true };
          return updated;
        });

        try {
          const uploaded = await uploadSingleImage(photo.uri);
          setPhotos(prev => {
            const updated = [...prev];
            updated[photoIndex] = {
              ...updated[photoIndex],
              uploadedUrl: uploaded.publicUrl,
              uploading: false,
            };
            return updated;
          });
        } catch (error) {
          console.error('Upload error for photo:', error);
          setPhotos(prev => {
            const updated = [...prev];
            updated[photoIndex] = { ...updated[photoIndex], uploading: false };
            return updated;
          });
        }
      });

      await Promise.all(uploadPromises);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const updatePhotoDescription = (index: number, description: string) => {
    const updated = [...photos];
    updated[index] = { ...updated[index], description };
    setPhotos(updated);
  };

  const addRecipeStep = () => {
    setRecipeSteps([...recipeSteps, { instruction: '' }]);
  };

  const removeRecipeStep = (index: number) => {
    if (recipeSteps.length > 1) {
      setRecipeSteps(recipeSteps.filter((_, i) => i !== index));
    }
  };

  const updateRecipeStep = (index: number, field: 'instruction' | 'timerSeconds', value: string | number) => {
    const updated = [...recipeSteps];
    updated[index] = { ...updated[index], [field]: value };
    setRecipeSteps(updated);
  };

  const handleSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a meal title');
      return;
    }

    setLoading(true);
    try {
      // Get uploaded URLs or fallback to local URIs
      const photoUrls = photos.map(p => p.uploadedUrl || p.uri);
      
      const mealData = {
        userId,
        title: title.trim(),
        description: description.trim() || undefined,
        tags: [], // TODO: Add tag input
        difficulty,
        prepMinutes: prepMinutes ? parseInt(prepMinutes) : undefined,
        totalMinutes: trackedMinutes !== null ? trackedMinutes : (totalMinutes ? parseInt(totalMinutes) : undefined),
        servings: servings ? parseInt(servings) : undefined,
        costPerServingCents: costPerServing ? Math.round(parseFloat(costPerServing) * 100) : undefined,
        photos: photoUrls,
        isPublic: false,
        recipe: recipeSteps.some(s => s.instruction.trim()) ? {
          steps: recipeSteps
            .filter(s => s.instruction.trim())
            .map((step, index) => ({
              instruction: step.instruction,
              timerSeconds: step.timerSeconds,
              photoPrompt: false,
            })),
        } : undefined,
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
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView style={styles.scrollView}>
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
            <View style={styles.timeInputContainer}>
              <TextInput
                style={[styles.input, trackedMinutes !== null && styles.inputWithTimer]}
                value={trackedMinutes !== null ? trackedMinutes.toString() : totalMinutes}
                onChangeText={(text) => {
                  if (trackedMinutes !== null) return; // Don't allow manual edit while timer is running
                  setTotalMinutes(text);
                }}
                keyboardType="numeric"
                placeholder="25"
                editable={trackedMinutes === null}
              />
              {trackedMinutes !== null && (
                <Text style={styles.timerBadge}>⏱️ Timer Active</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.timerSection}>
          <TouchableOpacity
            style={styles.timerToggle}
            onPress={() => setShowTimer(!showTimer)}
          >
            <Text style={styles.timerToggleText}>
              {showTimer ? '▼ Hide' : '▶️ Show'} Cooking Timer
            </Text>
          </TouchableOpacity>

          {showTimer && (
            <CookingTimer
              onTimeUpdate={(minutes, seconds) => {
                // Update total time as timer runs
                const total = minutes;
                setTrackedMinutes(total);
                setTotalMinutes(total.toString());
              }}
              onTimerComplete={(totalSeconds) => {
                const minutes = Math.floor(totalSeconds / 60);
                setTrackedMinutes(minutes);
                setTotalMinutes(minutes.toString());
                Alert.alert(
                  'Timer Complete!',
                  `Cooking took ${minutes} minute${minutes !== 1 ? 's' : ''}`,
                  [{ text: 'OK' }]
                );
              }}
            />
          )}

          {trackedMinutes !== null && !showTimer && (
            <View style={styles.timerResult}>
              <Text style={styles.timerResultText}>
                ⏱️ Tracked Time: {trackedMinutes} minute{trackedMinutes !== 1 ? 's' : ''}
              </Text>
              <TouchableOpacity
                style={styles.clearTimerButton}
                onPress={() => {
                  setTrackedMinutes(null);
                  setTotalMinutes('');
                }}
              >
                <Text style={styles.clearTimerText}>Clear</Text>
              </TouchableOpacity>
            </View>
          )}
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
                <View style={styles.photoWrapper}>
                  <Image source={{ uri: photo.uri }} style={styles.photoPreview} />
                  {photo.uploading && (
                    <View style={styles.uploadingOverlay}>
                      <ActivityIndicator color="#fff" />
                    </View>
                  )}
                  <TouchableOpacity
                    style={styles.removePhotoButton}
                    onPress={() => removePhoto(index)}
                  >
                    <Text style={styles.removePhotoText}>×</Text>
                  </TouchableOpacity>
                </View>
                <TextInput
                  style={styles.photoDescription}
                  placeholder="Photo description..."
                  value={photo.description}
                  onChangeText={(text) => updatePhotoDescription(index, text)}
                  multiline
                  numberOfLines={2}
                />
              </View>
            ))}
          </View>
        )}

        <Text style={styles.label}>Step-by-Step Instructions</Text>
        {recipeSteps.map((step, index) => (
          <View key={index} style={styles.stepContainer}>
            <View style={styles.stepHeader}>
              <Text style={styles.stepNumber}>Step {index + 1}</Text>
              {recipeSteps.length > 1 && (
                <TouchableOpacity
                  style={styles.removeStepButton}
                  onPress={() => removeRecipeStep(index)}
                >
                  <Text style={styles.removeStepText}>Remove</Text>
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={[styles.input, styles.stepInput]}
              value={step.instruction}
              onChangeText={(text) => updateRecipeStep(index, 'instruction', text)}
              placeholder={`What's step ${index + 1}?`}
              multiline
              numberOfLines={3}
            />
            <View style={styles.stepTimerRow}>
              <Text style={styles.stepTimerLabel}>Timer (seconds):</Text>
              <TextInput
                style={[styles.input, styles.stepTimerInput]}
                value={step.timerSeconds?.toString() || ''}
                onChangeText={(text) => updateRecipeStep(index, 'timerSeconds', text ? parseInt(text) : undefined)}
                keyboardType="numeric"
                placeholder="Optional"
              />
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.addStepButton} onPress={addRecipeStep}>
          <Text style={styles.addStepText}>+ Add Step</Text>
        </TouchableOpacity>

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flex: 1,
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
    marginBottom: 12,
    width: '100%',
  },
  photoWrapper: {
    position: 'relative',
    width: '100%',
    height: 200,
    marginBottom: 8,
  },
  photoPreview: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
  },
  uploadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  photoDescription: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 14,
    minHeight: 60,
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
  timeInputContainer: {
    position: 'relative',
  },
  inputWithTimer: {
    backgroundColor: '#f0f9ff',
    borderColor: '#007AFF',
  },
  timerBadge: {
    position: 'absolute',
    right: 8,
    top: 12,
    fontSize: 10,
    color: '#007AFF',
    fontWeight: '600',
  },
  timerSection: {
    marginTop: 8,
  },
  timerToggle: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  timerToggleText: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
  timerResult: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f0f9ff',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
  },
  timerResultText: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
  clearTimerButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff3b30',
    borderRadius: 6,
  },
  clearTimerText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  stepContainer: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  stepHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  stepNumber: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FF6B6B',
  },
  removeStepButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ff3b30',
    borderRadius: 6,
  },
  removeStepText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  stepInput: {
    marginBottom: 12,
    minHeight: 80,
  },
  stepTimerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  stepTimerLabel: {
    fontSize: 14,
    color: '#666',
  },
  stepTimerInput: {
    flex: 1,
  },
  addStepButton: {
    backgroundColor: '#fff',
    borderWidth: 1,
    borderColor: '#FF6B6B',
    borderStyle: 'dashed',
    borderRadius: 8,
    padding: 16,
    alignItems: 'center',
    marginBottom: 12,
  },
  addStepText: {
    color: '#FF6B6B',
    fontSize: 16,
    fontWeight: '600',
  },
});

