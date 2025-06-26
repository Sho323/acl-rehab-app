// テスト環境のセットアップ
require('dotenv').config({ path: '.env.test' });

// タイムアウト設定
jest.setTimeout(10000);

// モックの設定
jest.mock('../src/config/database', () => {
  const mockKnex = {
    select: jest.fn().mockReturnThis(),
    from: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    first: jest.fn(),
    insert: jest.fn().mockReturnThis(),
    update: jest.fn().mockReturnThis(),
    delete: jest.fn().mockReturnThis(),
    returning: jest.fn().mockReturnThis(),
    schema: {
      createTable: jest.fn(),
      dropTable: jest.fn(),
    },
    fn: {
      now: jest.fn(() => new Date()),
    },
    raw: jest.fn(),
  };

  // テーブル名を受け取った場合のモック
  const mockTable = jest.fn(() => mockKnex);
  Object.assign(mockTable, mockKnex);

  return mockTable;
});

// コンソール出力を抑制（必要に応じて）
global.console = {
  ...console,
  // 特定のログを抑制したい場合
  // log: jest.fn(),
  // error: jest.fn(),
  // warn: jest.fn(),
};