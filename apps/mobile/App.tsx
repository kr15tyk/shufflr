import React, { useState } from 'react';
import { Button, FlatList, SafeAreaView, StyleSheet, Text, View } from 'react-native';
import { StatusBar } from 'expo-status-bar';

import { shuffle } from '@shufflr/utils';

const SAMPLE_TRACKS = [
  { id: '1', title: 'Track One' },
  { id: '2', title: 'Track Two' },
  { id: '3', title: 'Track Three' },
  { id: '4', title: 'Track Four' },
  { id: '5', title: 'Track Five' },
];

interface SimpleTrack {
  id: string;
  title: string;
}

export default function App(): React.JSX.Element {
  const [tracks, setTracks] = useState<SimpleTrack[]>(SAMPLE_TRACKS);

  const handleShuffle = (): void => {
    setTracks(shuffle(tracks));
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.heading}>🔀 Shufflr</Text>
      <Button title="Shuffle Tracks" onPress={handleShuffle} />
      <FlatList
        data={tracks}
        keyExtractor={(item) => item.id}
        renderItem={({ item, index }) => (
          <View style={styles.track}>
            <Text style={styles.trackText}>
              {index + 1}. {item.title}
            </Text>
          </View>
        )}
        style={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    padding: 16,
  },
  heading: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  list: {
    marginTop: 16,
  },
  track: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  trackText: {
    fontSize: 16,
  },
});
