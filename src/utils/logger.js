const fs = require('fs');
const path = require('path');

// ログディレクトリを作成
const logDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

// シンプルロガーの作成
class SimpleLogger {
  constructor() {
    this.logLevel = process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug');
    this.levels = { error: 0, warn: 1, info: 2, debug: 3 };
  }

  _shouldLog(level) {
    return this.levels[level] <= this.levels[this.logLevel];
  }

  _formatMessage(level, message, extra = {}) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      service: 'acl-self-training-app',
      ...extra
    };
    return JSON.stringify(logEntry);
  }

  _writeToFile(filename, content) {
    try {
      const filePath = path.join(logDir, filename);
      fs.appendFileSync(filePath, content + '\n');
    } catch (error) {
      console.error('Failed to write log:', error);
    }
  }

  _log(level, message, extra = {}) {
    if (!this._shouldLog(level)) return;

    const formattedMessage = this._formatMessage(level, message, extra);
    
    // コンソール出力（開発環境）
    if (process.env.NODE_ENV !== 'production') {
      const timestamp = new Date().toLocaleTimeString();
      console.log(`${timestamp} [${level.toUpperCase()}]: ${message}`);
    }

    // ファイル出力
    this._writeToFile('combined.log', formattedMessage);
    
    if (level === 'error') {
      this._writeToFile('error.log', formattedMessage);
    }
  }

  error(message, extra = {}) {
    this._log('error', message, extra);
  }

  warn(message, extra = {}) {
    this._log('warn', message, extra);
  }

  info(message, extra = {}) {
    this._log('info', message, extra);
  }

  debug(message, extra = {}) {
    this._log('debug', message, extra);
  }
}

const logger = new SimpleLogger();

module.exports = logger;