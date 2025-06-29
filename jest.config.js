module.exports = {
  testEnvironment: 'node',
  collectCoverageFrom: [
    'src/**/*.js',
    '!src/database/migrations/**',
    '!src/database/seeds/**',
    '!src/server.js'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  testMatch: [
    '**/tests/**/*.test.js',
    '**/src/**/*.test.js'
  ],
  setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
  verbose: true,
  projects: [
    {
      displayName: 'backend',
      testEnvironment: 'node',
      testMatch: ['<rootDir>/tests/**/*.test.js'],
      setupFilesAfterEnv: ['<rootDir>/tests/setup.js'],
      transform: {
        '^.+\\.js$': 'babel-jest',
      },
    },
  ],
};