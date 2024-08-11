// RecorderComponent.tsx
import React, { useState, useEffect } from 'react';
import { View, Button, Text, StyleSheet, FlatList, Alert } from 'react-native';
import { Audio } from 'expo-av';
import useAudioRecorder from '../hooks/useAudioRecorder.js';

const RecorderComponent = () => {
  const { startRecording, stopRecording, recordedUri } = useAudioRecorder();
  const [recordings, setRecordings] = useState<string[]>([]);
  const [sound, setSound] = useState<Audio.Sound | null>(null);
  const [results, setResults] = useState<any>(null);

  useEffect(() => {
    if (recordedUri) {
      setRecordings([...recordings, recordedUri]);
      uploadRecording(recordedUri);
    }
  }, [recordedUri]);

  const playSound = async (uri: string) => {
    const { sound } = await Audio.Sound.createAsync({ uri });
    setSound(sound);
    await sound.playAsync();
  };

  const stopSound = async () => {
    if (sound) {
      await sound.stopAsync();
      await sound.unloadAsync();
      setSound(null);
    }
  };

  const uploadRecording = async (uri: string) => {
    try {
      const response = await fetch(uri);
      const blob = await response.blob();
      const base64Data = await convertBlobToBase64(blob);

      const jsonPayload = {
        file: base64Data,
      };

      const uploadResponse = await fetch('http://192.168.1.180:5000/process_audio', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(jsonPayload)
      });

      const result = await uploadResponse.json();
      console.log('API Response:', result);
      setResults(result);
    } catch (error) {
      console.error('Error uploading file:', error);
      Alert.alert('Error', 'Error uploading file');
    }
  };

  const convertBlobToBase64 = (blob: Blob): Promise<string | ArrayBuffer | null> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttonContainer}>
        <Button title="Start Recording" onPress={startRecording} />
      </View>
      <View style={styles.spacer} />
      <View style={styles.buttonContainer}>
        <Button title="Stop Recording" onPress={stopRecording} />
      </View>
      <FlatList
        data={recordings}
        keyExtractor={(item, index) => index.toString()}
        renderItem={({ item }) => (
          <View style={styles.recordingItem}>
            <Text>{item}</Text>
            <View style={styles.buttonContainer}>
              <Button title="Play" onPress={() => playSound(item)} />
            </View>
            <View style={styles.spacer} />
            <View style={styles.buttonContainer}>
              <Button title="Stop" onPress={stopSound} />
            </View>
          </View>
        )}
      />
      {results && (
        <View style={styles.results}>
          <Text>Predicted Speaker: {results.predicted_speaker}</Text>
          {results.confidence !== undefined && <Text>Confidence: {results.confidence.toFixed(2)}%</Text>}
          {results.transcription && <Text>Transcription: {results.transcription}</Text>}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  buttonContainer: {
    width: 200,
    height: 50,
    justifyContent: 'center',
    marginTop: 20,
  },
  spacer: {
    height: 20,
  },
  recordingItem: {
    marginVertical: 10,
    alignItems: 'center',
  },
  results: {
    marginTop: 20,
    alignItems: 'center',
  },
});

export default RecorderComponent;
