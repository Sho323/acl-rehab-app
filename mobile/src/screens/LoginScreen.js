import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  TextInput,
  Button,
  Card,
  Title,
  Paragraph,
  ActivityIndicator,
} from 'react-native-paper';
import { useDispatch } from 'react-redux';
import { loginUser } from '../store/slices/authSlice';
import { theme } from '../theme';

const LoginScreen = ({ navigation }) => {
  const [patientNumber, setPatientNumber] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  const handleLogin = async () => {
    if (!patientNumber || !password) {
      Alert.alert('エラー', '患者番号とパスワードを入力してください');
      return;
    }

    setIsLoading(true);
    try {
      await dispatch(loginUser({ patientNumber, password })).unwrap();
      navigation.replace('Home');
    } catch (error) {
      Alert.alert('ログインエラー', error.message || 'ログインに失敗しました');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGuestAccess = () => {
    navigation.replace('Home');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <View style={styles.content}>
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>ACL自主トレーニング</Title>
            <Paragraph style={styles.subtitle}>
              リハビリテーションアプリ
            </Paragraph>

            <TextInput
              label="患者番号"
              value={patientNumber}
              onChangeText={setPatientNumber}
              style={styles.input}
              mode="outlined"
              disabled={isLoading}
            />

            <TextInput
              label="パスワード"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              style={styles.input}
              mode="outlined"
              disabled={isLoading}
            />

            <Button
              mode="contained"
              onPress={handleLogin}
              style={styles.loginButton}
              disabled={isLoading}
            >
              {isLoading ? <ActivityIndicator color="white" /> : 'ログイン'}
            </Button>

            <Button
              mode="outlined"
              onPress={handleGuestAccess}
              style={styles.guestButton}
              disabled={isLoading}
            >
              ゲストとして利用
            </Button>
          </Card.Content>
        </Card>
      </View>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    padding: 20,
  },
  title: {
    textAlign: 'center',
    marginBottom: 10,
    color: theme.colors.primary,
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 30,
    color: theme.colors.text,
  },
  input: {
    marginBottom: 15,
  },
  loginButton: {
    marginTop: 10,
    marginBottom: 10,
  },
  guestButton: {
    marginTop: 5,
  },
});

export default LoginScreen;