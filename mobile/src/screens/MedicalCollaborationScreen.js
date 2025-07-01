import React from 'react';
import { View, StyleSheet } from 'react-native';
import { Card, Title, Paragraph, Button } from 'react-native-paper';
import { theme } from '../theme';

const MedicalCollaborationScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <Card style={styles.card}>
        <Card.Content>
          <Title>医療連携</Title>
          <Paragraph>
            この機能は現在開発中です。
            将来的には医療スタッフとの連携機能を提供予定です。
          </Paragraph>
          <Button
            mode="contained"
            onPress={() => navigation.goBack()}
            style={styles.button}
          >
            戻る
          </Button>
        </Card.Content>
      </Card>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
    padding: 20,
    justifyContent: 'center',
  },
  card: {
    padding: 20,
  },
  button: {
    marginTop: 20,
  },
});

export default MedicalCollaborationScreen;