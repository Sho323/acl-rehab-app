import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  Card,
  Button,
  TextInput,
  Chip,
  List,
  Avatar,
  Badge,
  IconButton,
  Divider,
  Switch,
  Portal,
  Modal,
  ActivityIndicator,
} from 'react-native-paper';
import { useSelector, useDispatch } from 'react-redux';
import {
  setActiveTab,
  addMessage,
  markMessageAsRead,
  markAllMessagesAsRead,
  setActiveConversation,
  addPendingReport,
  updateSharingPreferences,
  updateNotificationSettings,
  markNotificationAsRead,
  dismissAlert,
  setDummyData,
} from '../store/slices/medicalCollaborationSlice';

const MedicalCollaborationScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const {
    medicalStaff,
    messages,
    unreadCount,
    activeConversation,
    sharedReports,
    appointments,
    nextAppointment,
    notifications,
    alerts,
    sharingPreferences,
    notificationSettings,
    activeTab,
    isLoading,
    error,
  } = useSelector((state) => state.medicalCollaboration);

  const [messageText, setMessageText] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState(null);

  useEffect(() => {
    // デモ用のダミーデータを設定
    dispatch(setDummyData());
  }, [dispatch]);

  const handleTabChange = (tab) => {
    dispatch(setActiveTab(tab));
  };

  const handleSendMessage = () => {
    if (messageText.trim()) {
      dispatch(addMessage({
        senderId: 'patient',
        senderName: '患者',
        content: messageText.trim(),
        recipientId: activeConversation?.id || medicalStaff.primaryDoctor?.id,
        recipientName: activeConversation?.name || medicalStaff.primaryDoctor?.name,
        type: 'text',
      }));
      setMessageText('');
      
      // 自動返信（デモ用）
      setTimeout(() => {
        const responses = [
          'メッセージを受信しました。内容を確認いたします。',
          'ありがとうございます。経過良好ですね。',
          '次回の診察時に詳しくお話しましょう。',
          '何かご不明点があればお気軽にご連絡ください。',
        ];
        const randomResponse = responses[Math.floor(Math.random() * responses.length)];
        
        dispatch(addMessage({
          senderId: activeConversation?.id || medicalStaff.primaryDoctor?.id,
          senderName: activeConversation?.name || medicalStaff.primaryDoctor?.name,
          senderTitle: activeConversation?.title || medicalStaff.primaryDoctor?.title,
          content: randomResponse,
          recipientId: 'patient',
          type: 'text',
          isSent: false,
        }));
      }, 2000);
    }
  };

  const handleShareReport = (reportType) => {
    const reportData = {
      type: reportType,
      title: getReportTitle(reportType),
      recipients: [medicalStaff.primaryDoctor?.id, medicalStaff.physiotherapist?.id],
    };
    
    dispatch(addPendingReport(reportData));
    
    Alert.alert(
      'レポート送信',
      `${reportData.title}を医療従事者に送信しました。`,
      [{ text: 'OK' }]
    );
  };

  const getReportTitle = (type) => {
    switch (type) {
      case 'weekly_progress': return '週間進捗レポート';
      case 'acl_rsi': return 'ACL-RSI評価結果';
      case 'ai_analysis': return 'AI動作分析結果';
      case 'exercise_log': return '運動記録';
      default: return 'レポート';
    }
  };

  const formatDateTime = (dateTime) => {
    const date = new Date(dateTime);
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'confirmed': return '#4CAF50';
      case 'pending': return '#FF9800';
      case 'cancelled': return '#F44336';
      default: return '#666';
    }
  };

  const renderMedicalTeamTab = () => {
    return (
      <View style={styles.tabContent}>
        {/* 医療従事者チーム */}
        <Card style={styles.staffCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>医療チーム</Text>
            
            {medicalStaff.primaryDoctor && (
              <List.Item
                title={medicalStaff.primaryDoctor.name}
                description={`${medicalStaff.primaryDoctor.title} - ${medicalStaff.primaryDoctor.specialization}`}
                left={() => (
                  <View style={styles.avatarContainer}>
                    <Avatar.Text size={48} label={medicalStaff.primaryDoctor.name.slice(0, 1)} />
                    <View style={[styles.statusIndicator, { backgroundColor: '#4CAF50' }]} />
                  </View>
                )}
                right={() => (
                  <View style={styles.contactInfo}>
                    <Text style={styles.hospitalName}>{medicalStaff.primaryDoctor.hospital}</Text>
                    <Text style={styles.contactText}>{medicalStaff.primaryDoctor.phone}</Text>
                  </View>
                )}
                style={styles.staffItem}
              />
            )}
            
            {medicalStaff.physiotherapist && (
              <List.Item
                title={medicalStaff.physiotherapist.name}
                description={`${medicalStaff.physiotherapist.title} - ${medicalStaff.physiotherapist.specialization}`}
                left={() => (
                  <View style={styles.avatarContainer}>
                    <Avatar.Text size={48} label={medicalStaff.physiotherapist.name.slice(0, 1)} />
                    <View style={[styles.statusIndicator, { backgroundColor: '#2196F3' }]} />
                  </View>
                )}
                right={() => (
                  <View style={styles.contactInfo}>
                    <Text style={styles.hospitalName}>{medicalStaff.physiotherapist.hospital}</Text>
                    <Text style={styles.contactText}>{medicalStaff.physiotherapist.phone}</Text>
                  </View>
                )}
                style={styles.staffItem}
              />
            )}

            {medicalStaff.nurses.map((nurse) => (
              <List.Item
                key={nurse.id}
                title={nurse.name}
                description={`${nurse.title} - ${nurse.specialization}`}
                left={() => (
                  <View style={styles.avatarContainer}>
                    <Avatar.Text size={48} label={nurse.name.slice(0, 1)} />
                    <View style={[styles.statusIndicator, { backgroundColor: '#FF9800' }]} />
                  </View>
                )}
                right={() => (
                  <View style={styles.contactInfo}>
                    <Text style={styles.hospitalName}>{nurse.hospital}</Text>
                    <Text style={styles.contactText}>{nurse.email}</Text>
                  </View>
                )}
                style={styles.staffItem}
              />
            ))}

            {medicalStaff.specialists.map((specialist) => (
              <List.Item
                key={specialist.id}
                title={specialist.name}
                description={`${specialist.title} - ${specialist.specialization}`}
                left={() => (
                  <View style={styles.avatarContainer}>
                    <Avatar.Text size={48} label={specialist.name.slice(0, 1)} />
                    <View style={[styles.statusIndicator, { backgroundColor: '#9C27B0' }]} />
                  </View>
                )}
                right={() => (
                  <View style={styles.contactInfo}>
                    <Text style={styles.hospitalName}>{specialist.hospital}</Text>
                    <Text style={styles.contactText}>{specialist.email}</Text>
                  </View>
                )}
                style={styles.staffItem}
              />
            ))}
          </Card.Content>
        </Card>

        {/* 連絡先情報 */}
        <Card style={styles.contactCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>緊急連絡先</Text>
            <View style={styles.emergencyContact}>
              <Text style={styles.emergencyTitle}>24時間対応</Text>
              <Text style={styles.emergencyPhone}>📞 03-1234-9999</Text>
              <Text style={styles.emergencyNote}>
                痛みの悪化や異常を感じた場合は、すぐにご連絡ください。
              </Text>
            </View>
          </Card.Content>
        </Card>

        {/* 医療チーム紹介 */}
        <Card style={styles.teamInfoCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>チーム紹介</Text>
            <Text style={styles.teamDescription}>
              あなたのACLリハビリテーションを、多職種の医療専門家チームがサポートします。
              各専門家が連携して、安全で効果的な復帰をお手伝いします。
            </Text>
            
            <View style={styles.rolesList}>
              <View style={styles.roleItem}>
                <Text style={styles.roleTitle}>🏥 整形外科医</Text>
                <Text style={styles.roleDescription}>
                  診断・治療方針の決定、手術後の経過観察、復帰許可の判断
                </Text>
              </View>
              
              <View style={styles.roleItem}>
                <Text style={styles.roleTitle}>🤸 理学療法士</Text>
                <Text style={styles.roleDescription}>
                  リハビリテーション計画の作成、運動指導、機能評価
                </Text>
              </View>
              
              <View style={styles.roleItem}>
                <Text style={styles.roleTitle}>👩‍⚕️ 看護師</Text>
                <Text style={styles.roleDescription}>
                  日常的なケア、症状管理、患者教育とサポート
                </Text>
              </View>
              
              <View style={styles.roleItem}>
                <Text style={styles.roleTitle}>🧠 心理専門家</Text>
                <Text style={styles.roleDescription}>
                  心理的サポート、復帰不安の軽減、メンタルヘルスケア
                </Text>
              </View>
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderReportsTab = () => {
    return (
      <View style={styles.tabContent}>
        {/* 共有オプション */}
        <Card style={styles.shareOptionsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>データ共有</Text>
            
            <View style={styles.shareButtons}>
              <Button
                mode="outlined"
                onPress={() => handleShareReport('weekly_progress')}
                style={styles.shareButton}
                icon="chart-line"
              >
                進捗レポート
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleShareReport('acl_rsi')}
                style={styles.shareButton}
                icon="psychology"
              >
                ACL-RSI結果
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleShareReport('ai_analysis')}
                style={styles.shareButton}
                icon="camera"
              >
                AI分析結果
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleShareReport('exercise_log')}
                style={styles.shareButton}
                icon="dumbbell"
              >
                運動記録
              </Button>
            </View>
          </Card.Content>
        </Card>

        {/* 共有済みレポート */}
        <Card style={styles.reportsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>共有済みレポート</Text>
            
            {sharedReports.map((report) => (
              <View key={report.id} style={styles.reportItem}>
                <View style={styles.reportHeader}>
                  <Text style={styles.reportTitle}>{report.title}</Text>
                  <Text style={styles.reportDate}>
                    {formatDateTime(report.sentAt)}
                  </Text>
                </View>
                <Text style={styles.reportRecipients}>
                  送信先: {report.recipients.length}名
                </Text>
                <View style={styles.reportActions}>
                  <Chip mode="outlined" compact>
                    {report.status === 'sent' ? '送信済み' : '送信中'}
                  </Chip>
                </View>
              </View>
            ))}
          </Card.Content>
        </Card>

        {/* 自動共有設定 */}
        <Card style={styles.autoShareCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>自動共有設定</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>進捗データの自動共有</Text>
              <Switch
                value={sharingPreferences.autoShareProgress}
                onValueChange={(value) => 
                  dispatch(updateSharingPreferences({ autoShareProgress: value }))
                }
              />
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>ACL-RSI結果の自動共有</Text>
              <Switch
                value={sharingPreferences.autoShareACLRSI}
                onValueChange={(value) => 
                  dispatch(updateSharingPreferences({ autoShareACLRSI: value }))
                }
              />
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>週間レポートの自動送信</Text>
              <Switch
                value={sharingPreferences.weeklyReportEnabled}
                onValueChange={(value) => 
                  dispatch(updateSharingPreferences({ weeklyReportEnabled: value }))
                }
              />
            </View>
          </Card.Content>
        </Card>
      </View>
    );
  };


  const renderSettingsTab = () => {
    return (
      <View style={styles.tabContent}>
        {/* 通知設定 */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>通知設定</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>新しいメッセージの通知</Text>
              <Switch
                value={notificationSettings.newMessage}
                onValueChange={(value) => 
                  dispatch(updateNotificationSettings({ newMessage: value }))
                }
              />
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>予約リマインダー</Text>
              <Switch
                value={notificationSettings.appointmentReminder}
                onValueChange={(value) => 
                  dispatch(updateNotificationSettings({ appointmentReminder: value }))
                }
              />
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>レポート要請の通知</Text>
              <Switch
                value={notificationSettings.reportRequested}
                onValueChange={(value) => 
                  dispatch(updateNotificationSettings({ reportRequested: value }))
                }
              />
            </View>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>緊急アラート</Text>
              <Switch
                value={notificationSettings.urgentAlert}
                onValueChange={(value) => 
                  dispatch(updateNotificationSettings({ urgentAlert: value }))
                }
              />
            </View>
          </Card.Content>
        </Card>

        {/* プライバシー設定 */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>プライバシー設定</Text>
            
            <View style={styles.settingItem}>
              <Text style={styles.settingLabel}>緊急連絡先機能</Text>
              <Switch
                value={sharingPreferences.emergencyContactEnabled}
                onValueChange={(value) => 
                  dispatch(updateSharingPreferences({ emergencyContactEnabled: value }))
                }
              />
            </View>
            
            <List.Item
              title="データ使用ポリシー"
              description="医療データの使用に関するポリシーを確認"
              left={() => <List.Icon icon="shield-account" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => Alert.alert('ポリシー', 'データ使用ポリシーの詳細画面は開発中です')}
              style={styles.settingListItem}
            />
            
            <List.Item
              title="データエクスポート"
              description="自分の医療データをエクスポート"
              left={() => <List.Icon icon="download" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => Alert.alert('エクスポート', 'データエクスポート機能は開発中です')}
              style={styles.settingListItem}
            />
          </Card.Content>
        </Card>

        {/* データ共有履歴 */}
        <Card style={styles.settingsCard}>
          <Card.Content>
            <Text style={styles.sectionTitle}>データ共有履歴</Text>
            
            <List.Item
              title="共有済みレポートを確認"
              description="これまでに送信したレポートの一覧"
              left={() => <List.Icon icon="file-document-multiple" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => handleTabChange('reports')}
              style={styles.settingListItem}
            />
            
            <List.Item
              title="データエクスポート"
              description="自分の医療データをエクスポート"
              left={() => <List.Icon icon="download" />}
              right={() => <List.Icon icon="chevron-right" />}
              onPress={() => Alert.alert('エクスポート', 'データエクスポート機能は開発中です')}
              style={styles.settingListItem}
            />
          </Card.Content>
        </Card>
      </View>
    );
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'team':
        return renderMedicalTeamTab();
      case 'reports':
        return renderReportsTab();
      case 'settings':
        return renderSettingsTab();
      default:
        return renderMedicalTeamTab();
    }
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>データを読み込み中...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* アラート表示 */}
      {alerts.filter(alert => alert.isActive).map((alert) => (
        <Card key={alert.id} style={[styles.alertCard, { backgroundColor: '#ffebee' }]}>
          <Card.Content>
            <View style={styles.alertContent}>
              <Text style={styles.alertText}>{alert.message}</Text>
              <IconButton
                icon="close"
                size={20}
                onPress={() => dispatch(dismissAlert(alert.id))}
              />
            </View>
          </Card.Content>
        </Card>
      ))}

      {/* タブナビゲーション */}
      <View style={styles.tabNavigation}>
        <View style={styles.tabButtons}>
          <Button
            mode={activeTab === 'team' ? 'contained' : 'outlined'}
            onPress={() => handleTabChange('team')}
            style={styles.tabButton}
            compact
          >
            医療チーム
          </Button>
          <Button
            mode={activeTab === 'reports' ? 'contained' : 'outlined'}
            onPress={() => handleTabChange('reports')}
            style={styles.tabButton}
            compact
          >
            レポート共有
          </Button>
          <Button
            mode={activeTab === 'settings' ? 'contained' : 'outlined'}
            onPress={() => handleTabChange('settings')}
            style={styles.tabButton}
            compact
          >
            設定
          </Button>
        </View>
      </View>

      {/* タブコンテンツ */}
      <ScrollView style={styles.content}>
        {renderTabContent()}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  alertCard: {
    margin: 8,
    elevation: 4,
  },
  alertContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  alertText: {
    flex: 1,
    fontSize: 14,
    color: '#d32f2f',
  },
  tabNavigation: {
    backgroundColor: '#fff',
    paddingVertical: 8,
    elevation: 2,
  },
  tabButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 8,
  },
  tabButton: {
    flex: 1,
    marginHorizontal: 2,
  },
  tabBadge: {
    position: 'absolute',
    top: -8,
    right: -8,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 16,
  },
  // 医療チームタブ
  staffCard: {
    marginBottom: 16,
    elevation: 2,
  },
  staffItem: {
    paddingVertical: 8,
  },
  avatarContainer: {
    position: 'relative',
  },
  statusIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 12,
    height: 12,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: '#fff',
  },
  contactInfo: {
    alignItems: 'flex-end',
  },
  hospitalName: {
    fontSize: 12,
    color: '#666',
    marginBottom: 2,
  },
  contactText: {
    fontSize: 12,
    color: '#2196F3',
    fontWeight: 'bold',
  },
  contactCard: {
    marginBottom: 16,
    elevation: 2,
    backgroundColor: '#fff3cd',
  },
  emergencyContact: {
    alignItems: 'center',
    paddingVertical: 8,
  },
  emergencyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#856404',
    marginBottom: 4,
  },
  emergencyPhone: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 8,
  },
  emergencyNote: {
    fontSize: 12,
    color: '#856404',
    textAlign: 'center',
    lineHeight: 16,
  },
  teamInfoCard: {
    elevation: 2,
  },
  teamDescription: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
    marginBottom: 16,
  },
  rolesList: {
    marginTop: 8,
  },
  roleItem: {
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  roleTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  roleDescription: {
    fontSize: 12,
    color: '#666',
    lineHeight: 16,
  },
  // レポートタブ
  shareOptionsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  shareButtons: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  shareButton: {
    flex: 1,
    minWidth: '45%',
  },
  reportsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  reportItem: {
    padding: 12,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
  },
  reportHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  reportTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  reportDate: {
    fontSize: 12,
    color: '#666',
  },
  reportRecipients: {
    fontSize: 12,
    color: '#666',
    marginBottom: 8,
  },
  reportActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  autoShareCard: {
    elevation: 2,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  settingLabel: {
    fontSize: 14,
    color: '#333',
  },
  // 設定タブ
  settingsCard: {
    marginBottom: 16,
    elevation: 2,
  },
  settingListItem: {
    paddingVertical: 8,
  },
});

export default MedicalCollaborationScreen;