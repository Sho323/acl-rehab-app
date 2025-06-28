import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Button } from 'react-native-paper';
import PropTypes from 'prop-types';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, errorInfo: null };
  }

  static getDerivedStateFromError(error) {
    // エラーが発生したときに state を更新し、フォールバック UI を表示
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // エラーログを記録
    this.setState({
      error: error,
      errorInfo: errorInfo
    });

    // 開発環境でのみ詳細なエラー情報を表示
    if (__DEV__) {
      console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    // 本番環境では適切なエラー追跡サービスに送信
    // 例: Sentry, Crashlytics など
    // ErrorTracker.logError(error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  handleReportError = () => {
    const errorMessage = this.state.error?.message || 'Unknown error';
    const errorStack = this.state.error?.stack || '';
    
    Alert.alert(
      'エラーレポート',
      `以下のエラー情報をサポートに報告できます：\n\n${errorMessage}`,
      [
        { text: 'キャンセル', style: 'cancel' },
        { 
          text: 'レポート送信', 
          onPress: () => {
            // ここで実際のエラーレポート送信処理を実装
            Alert.alert('送信完了', 'エラーレポートを送信しました。');
          }
        }
      ]
    );
  };

  render() {
    if (this.state.hasError) {
      // カスタムフォールバック UI
      return (
        <View style={styles.container}>
          <View style={styles.errorContainer}>
            <Text style={styles.title}>問題が発生しました</Text>
            <Text style={styles.message}>
              アプリで予期しないエラーが発生しました。
              下記のボタンをお試しください。
            </Text>
            
            {__DEV__ && this.state.error && (
              <View style={styles.debugContainer}>
                <Text style={styles.debugTitle}>開発者情報:</Text>
                <Text style={styles.debugText}>{this.state.error.toString()}</Text>
                {this.state.errorInfo && (
                  <Text style={styles.debugText}>{this.state.errorInfo.componentStack}</Text>
                )}
              </View>
            )}
            
            <View style={styles.buttonContainer}>
              <Button 
                mode="contained" 
                onPress={this.handleRetry}
                style={styles.button}
              >
                もう一度試す
              </Button>
              
              <Button 
                mode="outlined" 
                onPress={this.handleReportError}
                style={styles.button}
              >
                エラーを報告
              </Button>
              
              {this.props.onReset && (
                <Button 
                  mode="text" 
                  onPress={this.props.onReset}
                  style={styles.button}
                >
                  ホームに戻る
                </Button>
              )}
            </View>
          </View>
        </View>
      );
    }

    // エラーがない場合は通常の子コンポーネントを表示
    return this.props.children;
  }
}

ErrorBoundary.propTypes = {
  children: PropTypes.node.isRequired,
  onReset: PropTypes.func, // ホーム画面に戻るなどのリセット処理
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  errorContainer: {
    backgroundColor: '#fff',
    padding: 24,
    borderRadius: 12,
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#d32f2f',
    marginBottom: 16,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    marginBottom: 24,
    lineHeight: 24,
  },
  buttonContainer: {
    width: '100%',
    gap: 12,
  },
  button: {
    marginVertical: 4,
  },
  debugContainer: {
    backgroundColor: '#f5f5f5',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
    width: '100%',
  },
  debugTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#666',
    marginBottom: 8,
  },
  debugText: {
    fontSize: 12,
    color: '#666',
    fontFamily: 'monospace',
  },
});

export default ErrorBoundary;