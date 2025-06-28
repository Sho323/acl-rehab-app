import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import PropTypes from 'prop-types';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { loginUser, checkAuthToken, clearError, demoLogin } from '../store/slices/authSlice';

const LoginScreen = ({ navigation }) => {
  const [patientNumber, setPatientNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const dispatch = useDispatch();
  const { isLoading, isAuthenticated, error } = useSelector((state) => state.auth);

  useEffect(() => {
    // アプリ起動時に保存されたトークンをチェック
    dispatch(checkAuthToken());
  }, [dispatch]);

  useEffect(() => {
    // 認証成功時にホーム画面へ遷移
    if (isAuthenticated) {
      navigation.replace('Home');
    }
  }, [isAuthenticated, navigation]);

  useEffect(() => {
    // エラー表示
    if (error) {
      Alert.alert('ログインエラー', error, [
        { text: 'OK', onPress: () => dispatch(clearError()) }
      ]);
    }
  }, [error, dispatch]);

  const handleLogin = () => {
    if (!patientNumber.trim() || !password.trim()) {
      Alert.alert('入力エラー', '患者番号とパスワードを入力してください。');
      return;
    }

    dispatch(loginUser({ patientNumber: patientNumber.trim(), password }));
  };

  const handleDemoLogin = (phase) => {
    dispatch(demoLogin({ phase }));
  };

  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>認証中...</Text>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>ACL リハビリアプリ</Title>
            <Paragraph style={styles.subtitle}>
              前十字靭帯損傷患者用
            </Paragraph>

            <TextInput
              label="患者番号"
              value={patientNumber}
              onChangeText={setPatientNumber}
              mode="outlined"
              style={styles.input}
              autoCapitalize="none"
              autoCorrect={false}
              textContentType="username"
              disabled={isLoading}
            />

            <TextInput
              label="パスワード"
              value={password}
              onChangeText={setPassword}
              mode="outlined"
              style={styles.input}
              secureTextEntry={!showPassword}
              right={
                <TextInput.Icon
                  icon={showPassword ? 'eye-off' : 'eye'}
                  onPress={() => setShowPassword(!showPassword)}
                />
              }
              textContentType="password"
              disabled={isLoading}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              disabled={isLoading}
              loading={isLoading}
            >
              ログイン
            </Button>

            <Text style={styles.helpText}>
              ログインでお困りの場合は、担当の医療従事者にお尋ねください。
            </Text>
          </Card.Content>
        </Card>

        {/* デモ用ボタン */}
        <Card style={[styles.card, styles.demoCard]}>
          <Card.Content>
            <Title style={styles.demoTitle}>デモ版（開発用）</Title>
            <Paragraph style={styles.demoSubtitle}>
              各リハビリ段階をテストできます
            </Paragraph>
            
            <View style={styles.demoButtonContainer}>
              <Button
                mode="outlined"
                onPress={() => handleDemoLogin('pre_surgery')}
                style={styles.demoButton}
                compact
              >
                術前期
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleDemoLogin('post_surgery_early')}
                style={styles.demoButton}
                compact
              >
                術直後期
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleDemoLogin('phase_3_1')}
                style={styles.demoButton}
                compact
              >
                基礎回復期
              </Button>
            </View>
            
            <View style={styles.demoButtonContainer}>
              <Button
                mode="outlined"
                onPress={() => handleDemoLogin('phase_3_2')}
                style={styles.demoButton}
                compact
              >
                筋力強化期
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleDemoLogin('phase_3_3')}
                style={styles.demoButton}
                compact
              >
                機能訓練期
              </Button>
              <Button
                mode="outlined"
                onPress={() => handleDemoLogin('phase_3_4')}
                style={styles.demoButton}
                compact
              >
                競技復帰期
              </Button>
            </View>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
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
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    color: '#666',
  },
  input: {
    marginBottom: 16,
  },
  loginButton: {
    marginTop: 16,
    marginBottom: 24,
    paddingVertical: 8,
  },
  helpText: {
    textAlign: 'center',
    fontSize: 12,
    color: '#666',
    lineHeight: 18,
  },
  demoCard: {
    marginTop: 16,
    backgroundColor: '#FFF3E0',
  },
  demoTitle: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 18,
    color: '#E65100',
  },
  demoSubtitle: {
    textAlign: 'center',
    marginBottom: 16,
    color: '#BF360C',
    fontSize: 12,
  },
  demoButtonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  demoButton: {
    flex: 1,
    marginHorizontal: 2,
    borderColor: '#FF9800',
  },
});

LoginScreen.propTypes = {
  navigation: PropTypes.shape({
    navigate: PropTypes.func.isRequired,
    replace: PropTypes.func.isRequired,
  }).isRequired,
};

export default LoginScreen;