import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

export default function App() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>ACL Rehab App</Text>
      <Text style={styles.subtitle}>段階別自主トレーニングメニュー</Text>
      <Text style={styles.phase}>テスト用シンプルアプリ</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 20,
    color: '#666',
    textAlign: 'center',
  },
  phase: {
    fontSize: 14,
    color: '#4CAF50',
    backgroundColor: '#E8F5E8',
    padding: 10,
    borderRadius: 5,
  },
});