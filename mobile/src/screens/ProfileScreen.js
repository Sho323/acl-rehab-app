import React from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  Divider,
  List,
  IconButton,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import { logoutUser } from '../store/slices/authSlice';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);

  const handleLogout = () => {
    Alert.alert(
      'ログアウト',
      'ログアウトしてもよろしいですか？',
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'ログアウト', 
          style: 'destructive',
          onPress: () => {
            dispatch(logoutUser());
            navigation.replace('Login');
          }
        }
      ]
    );
  };

  const getPhaseDisplayName = (phase) => {
    const phaseMap = {
      'pre_surgery': '術前期',
      'post_surgery_early': '術直後期',
      'phase_3_1': '基礎回復期',
      'phase_3_2': '筋力強化期',
      'phase_3_3': '機能訓練期',
      'phase_3_4': '競技復帰期',
      'completed': '完了',
    };
    return phaseMap[phase] || '不明';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '未設定';
    return new Date(dateString).toLocaleDateString('ja-JP');
  };

  const menuItems = [
    {
      title: 'ACL-RSI評価',
      description: '心理的準備度の評価',
      icon: 'clipboard-check',
      onPress: () => Alert.alert('準備中', 'この機能は開発中です'),
    },
    {
      title: '通知設定',
      description: 'リマインダーの設定',
      icon: 'bell',
      onPress: () => Alert.alert('準備中', 'この機能は開発中です'),
    },
    {
      title: 'データエクスポート',
      description: '進捗データのエクスポート',
      icon: 'download',
      onPress: () => Alert.alert('準備中', 'この機能は開発中です'),
    },
    {
      title: 'ヘルプ・サポート',
      description: '使い方やお問い合わせ',
      icon: 'help-circle',
      onPress: () => Alert.alert('準備中', 'この機能は開発中です'),
    },
  ];

  return (
    <ScrollView style={styles.container}>
      {/* 患者情報 */}
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <View style={styles.avatar}>
              <Text style={styles.avatarText}>
                {user?.name?.charAt(0) || 'P'}
              </Text>
            </View>
            <View style={styles.profileInfo}>
              <Text style={styles.patientName}>{user?.name || '患者名'}</Text>
              <Text style={styles.patientNumber}>
                患者番号: {user?.patientNumber || 'N/A'}
              </Text>
              <Text style={styles.currentPhase}>
                現在の段階: {getPhaseDisplayName(user?.currentPhase)}
              </Text>
            </View>
          </View>
        </Card.Content>
      </Card>

      {/* 基本情報 */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>基本情報</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>生年月日</Text>
            <Text style={styles.infoValue}>
              {formatDate(user?.dateOfBirth)}
            </Text>
          </View>
          
          <Divider style={styles.infoDivider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>性別</Text>
            <Text style={styles.infoValue}>
              {user?.gender === 'male' ? '男性' : user?.gender === 'female' ? '女性' : '未設定'}
            </Text>
          </View>
          
          <Divider style={styles.infoDivider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>手術日</Text>
            <Text style={styles.infoValue}>
              {formatDate(user?.surgeryDate)}
            </Text>
          </View>
          
          <Divider style={styles.infoDivider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>メールアドレス</Text>
            <Text style={styles.infoValue}>
              {user?.email || '未登録'}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* メニュー */}
      <Card style={styles.menuCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>設定・その他</Text>
          
          {menuItems.map((item, index) => (
            <List.Item
              key={index}
              title={item.title}
              description={item.description}
              left={(props) => (
                <List.Icon
                  {...props}
                  icon={item.icon}
                  color="#666"
                />
              )}
              right={(props) => (
                <List.Icon
                  {...props}
                  icon="chevron-right"
                  color="#999"
                />
              )}
              onPress={item.onPress}
              style={styles.menuItem}
            />
          ))}
        </Card.Content>
      </Card>

      {/* アプリ情報 */}
      <Card style={styles.appInfoCard}>
        <Card.Content>
          <Text style={styles.sectionTitle}>アプリ情報</Text>
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>バージョン</Text>
            <Text style={styles.infoValue}>1.0.0</Text>
          </View>
          
          <Divider style={styles.infoDivider} />
          
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>最終更新</Text>
            <Text style={styles.infoValue}>2024年12月</Text>
          </View>
          
          <Divider style={styles.infoDivider} />
          
          <Text style={styles.disclaimer}>
            このアプリは医療従事者の指導の下でご利用ください。
            体調不良や痛みが続く場合は、すぐに担当医師にご相談ください。
          </Text>
        </Card.Content>
      </Card>

      {/* ログアウトボタン */}
      <View style={styles.logoutContainer}>
        <Button
          mode="outlined"
          onPress={handleLogout}
          style={styles.logoutButton}
          textColor="#F44336"
          icon="logout"
        >
          ログアウト
        </Button>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  profileCard: {
    margin: 16,
    marginBottom: 8,
    elevation: 2,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  profileInfo: {
    flex: 1,
  },
  patientName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  patientNumber: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  currentPhase: {
    fontSize: 14,
    color: '#2E7D32',
    fontWeight: '500',
  },
  infoCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
  },
  infoLabel: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  infoDivider: {
    marginVertical: 4,
  },
  menuCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 2,
  },
  menuItem: {
    paddingVertical: 4,
  },
  appInfoCard: {
    margin: 16,
    marginTop: 8,
    marginBottom: 8,
    elevation: 1,
    backgroundColor: '#FAFAFA',
  },
  disclaimer: {
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
    marginTop: 8,
    fontStyle: 'italic',
  },
  logoutContainer: {
    padding: 16,
    paddingTop: 8,
  },
  logoutButton: {
    borderColor: '#F44336',
    borderWidth: 1,
  },
});

export default ProfileScreen;