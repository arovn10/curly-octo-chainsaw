import * as ImagePicker from 'expo-image-picker';
import { apiClient } from '../api/client';

export interface UploadResult {
  publicUrl: string;
  key: string;
}

export async function uploadSingleImage(localUri: string): Promise<UploadResult> {
  try {
    const filename = localUri.split('/').pop() || `photo-${Date.now()}.jpg`;

    // Get presigned upload URL from backend
    const uploadResponse = await apiClient.post('/upload', {
      filename,
      contentType: 'image/jpeg',
    });

    if (!uploadResponse.data.ok) {
      throw new Error(uploadResponse.data.error || 'Failed to get upload URL');
    }

    const { uploadUrl, publicUrl, key } = uploadResponse.data.data;

    // Upload image to S3 using presigned URL
    const response = await fetch(localUri);
    const blob = await response.blob();

    const uploadResult = await fetch(uploadUrl, {
      method: 'PUT',
      body: blob,
      headers: {
        'Content-Type': 'image/jpeg',
      },
    });

    if (!uploadResult.ok) {
      throw new Error('Failed to upload to S3');
    }

    return { publicUrl, key };
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function pickAndUploadImage(): Promise<UploadResult | null> {
  try {
    // Request permissions
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera roll permissions not granted');
    }

    // Pick image
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (result.canceled || !result.assets[0]) {
      return null;
    }

    return await uploadSingleImage(result.assets[0].uri);
  } catch (error) {
    console.error('Error uploading image:', error);
    throw error;
  }
}

export async function pickMultipleImages(): Promise<UploadResult[]> {
  try {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      throw new Error('Camera roll permissions not granted');
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsMultipleSelection: true,
      quality: 0.8,
    });

    if (result.canceled || !result.assets.length) {
      return [];
    }

    const uploadPromises = result.assets.map(async (asset) => {
      return await uploadSingleImage(asset.uri);
    });

    return await Promise.all(uploadPromises);
  } catch (error) {
    console.error('Error uploading images:', error);
    throw error;
  }
}
