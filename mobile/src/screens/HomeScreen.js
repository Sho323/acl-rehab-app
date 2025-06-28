import React, { useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import PropTypes from 'prop-types';
import {
  Text,
  Card,
  Button,
  ProgressBar,
  Chip,
  Divider,
  IconButton,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';

const { width } = Dimensions.get('window');

const HomeScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  // フェーズに応じた表示内容
  const getPhaseInfo = (phase) => {
    const phaseMap = {
      'pre_surgery': {
        title: '術前期',
        description: '手術前の準備期間',
        color: '#FF9800',
        progress: 0.1,
      },
      'post_surgery_early': {
        title: '術直後期',
        description: '手術直後〜2週間',
        color: '#F44336',
        progress: 0.2,
      },
      'phase_3_1': {
        title: '基礎回復期',
        description: '2〜6週間',
        color: '#2196F3',
        progress: 0.4,
      },
      'phase_3_2': {
        title: '筋力強化期',
        description: '6〜12週間',
        color: '#4CAF50',
        progress: 0.6,
      },
      'phase_3_3': {
        title: '機能訓練期',
        description: '3〜6ヶ月',
        color: '#9C27B0',
        progress: 0.8,
      },
      'phase_3_4': {
        title: '競技復帰期',
        description: '6〜12ヶ月',
        color: '#E91E63',
        progress: 0.95,
      },
      'completed': {
        title: '完了',
        description: '競技復帰達成',
        color: '#4CAF50',
        progress: 1.0,
      },
    };
    return phaseMap[phase] || phaseMap['pre_surgery'];
  };

  const currentPhaseInfo = getPhaseInfo(user?.currentPhase);

  const handleLogout = () => {
    dispatch(logoutUser());
    navigation.replace('Login');
  };

  const menuItems = [
    {
      title: '自主トレーニング',
      icon: 'dumbbell',
      description: '今日の運動メニュー',
      onPress: () => navigation.navigate('Exercise'),
      color: '#2E7D32',
    },
    {
      title: '進捗確認',
      icon: 'chart-line',
      description: '回復状況の確認',
      onPress: () => navigation.navigate('Progress'),
      color: '#1976D2',
    },
    {
      title: 'プロフィール',
      icon: 'account',
      description: '個人情報・設定',
      onPress: () => navigation.navigate('Profile'),
      color: '#7B1FA2',
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* ヘッダー */}
      <Card style={styles.headerCard}>
        <Card.Content>
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <Text style={styles.welcomeText}>こんにちは</Text>
              <Text style={styles.userName}>{user?.name}さん</Text>
            </View>
            <IconButton
              icon="logout"
              size={24}
              onPress={handleLogout}
              style={styles.logoutButton}
            />
          </View>
        </Card.Content>
      </Card>

      {/* 現在のフェーズ */}
      <Card style={styles.phaseCard}>
        <Card.Content>
          <View style={styles.phaseHeader}>
            <Text style={styles.phaseTitle}>現在のリハビリ段階</Text>
            <Chip
              mode="outlined"
              style={[styles.phaseChip, { borderColor: currentPhaseInfo.color }]}
              textStyle={{ color: currentPhaseInfo.color }}
            >
              {currentPhaseInfo.title}
            </Chip>
          </View>
          
          <Text style={styles.phaseDescription}>
            {currentPhaseInfo.description}
          </Text>
          
          <View style={styles.progressContainer}>
            <Text style={styles.progressLabel}>全体の進捗</Text>
            <ProgressBar
              progress={currentPhaseInfo.progress}
              color={currentPhaseInfo.color}
              style={styles.progressBar}
            />
            <Text style={styles.progressText}>
              {Math.round(currentPhaseInfo.progress * 100)}%
            </Text>
          </View>

          {user?.surgeryDate && (
            <Text style={styles.surgeryDate}>
              手術日: {new Date(user.surgeryDate).toLocaleDateString('ja-JP')}
            </Text>
          )}
        </Card.Content>
      </Card>

      {/* メインメニュー */}
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

      {/* 今日のヒント */}
      <Card style={styles.tipCard}>
        <Card.Content>
          <Text style={styles.tipTitle}>今日のヒント</Text>
          <Divider style={styles.tipDivider} />
          <Text style={styles.tipText}>
            運動前のアイシングは5-10分程度に留め、運動後は15-20分間のアイシングを行いましょう。
            痛みが強い場合は無理をせず、担当医師にご相談ください。
          </Text>
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
    marginBottom: 8,
    elevation: 2,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userInfo: {
    flex: 1,
  },
  welcomeText: {
    fontSize: 14,
    color: '#666',
  },
  userName: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
  logoutButton: {
    margin: 0,
  },
  phaseCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  phaseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  phaseTitle: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  phaseChip: {
    borderWidth: 1,
  },
  phaseDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: '#666',
    marginBottom: 4,
  },
  progressBar: {
    height: 8,
    borderRadius: 4,
    marginBottom: 4,
  },
  progressText: {
    fontSize: 12,
    textAlign: 'right',
    color: '#666',
  },
  surgeryDate: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
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
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  menuDescription: {
    fontSize: 12,
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
  tipCard: {
    margin: 16,
    marginTop: 8,
    elevation: 2,
  },
  tipTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tipDivider: {
    marginBottom: 12,
  },
  tipText: {
    fontSize: 14,
    lineHeight: 20,
    color: '#333',
  },
});

HomeScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
  }).isRequired,
};

export default HomeScreen;