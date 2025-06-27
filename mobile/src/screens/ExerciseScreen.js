import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  List,
  IconButton,
} from 'react-native-paper';
import { useSelector } from 'react-redux';

const ExerciseScreen = ({ navigation }) => {
  const { user } = useSelector((state) => state.auth);

  const handleNavigateToMenu = () => {
    navigation.navigate('ExerciseMenu');
  };

  const handleNavigateToHistory = () => {
    navigation.navigate('ExerciseHistory');
  };

  const menuItems = [
    {
      title: '今日のトレーニング',
      description: '段階別運動メニュー',
      icon: 'dumbbell',
      onPress: handleNavigateToMenu,
      color: '#2E7D32',
    },
    {
      title: 'トレーニング履歴',
      description: '過去の運動記録',
      icon: 'history',
      onPress: handleNavigateToHistory,
      color: '#1976D2',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      <Card style={styles.headerCard}>
        <Card.Content>
          <Text style={styles.title}>自主トレーニング</Text>
          <Text style={styles.subtitle}>
            ACLリハビリテーション プログラム
          </Text>
        </Card.Content>
      </Card>

      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <Card key={index} style={styles.menuCard}>
            <Card.Content>
              <View style={styles.menuContent}>
                <View style={styles.menuTextContainer}>
                  <Text style={styles.menuTitle}>{item.title}</Text>
                  <Text style={styles.menuDescription}>{item.description}</Text>
                </View>
                <IconButton
                  icon={item.icon}
                  size={32}
                  iconColor={item.color}
                  style={[styles.menuIcon, { backgroundColor: `${item.color}15` }]}
                />
              </View>
              <Button
                mode="contained"
                onPress={item.onPress}
                style={[styles.menuButton, { backgroundColor: item.color }]}
                labelStyle={styles.menuButtonLabel}
              >
                開始
              </Button>
            </Card.Content>
          </Card>
        ))}
      </View>

      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.infoTitle}>運動時の注意事項</Text>
          <List.Section>
            <List.Item
              title="痛みの確認"
              description="運動中に痛みを感じた場合は即座に中止してください"
              left={() => <List.Icon icon="alert-circle" color="#F44336" />}
            />
            <List.Item
              title="適切な環境"
              description="十分なスペースと安全な環境で実施してください"
              left={() => <List.Icon icon="home" color="#4CAF50" />}
            />
            <List.Item
              title="水分補給"
              description="運動前後の水分補給を忘れずに行ってください"
              left={() => <List.Icon icon="water" color="#2196F3" />}
            />
          </List.Section>
        </Card.Content>
      </Card>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  headerCard: {
    margin: 16,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
  },
  menuContainer: {
    padding: 16,
    paddingTop: 8,
  },
  menuCard: {
    marginBottom: 12,
    elevation: 2,
  },
  menuContent: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  menuTextContainer: {
    flex: 1,
  },
  menuTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 14,
    color: '#666',
  },
  menuIcon: {
    margin: 0,
    borderRadius: 8,
  },
  menuButton: {
    borderRadius: 8,
  },
  menuButtonLabel: {
    color: 'white',
    fontWeight: 'bold',
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
});

export default ExerciseScreen;