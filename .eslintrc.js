const path = require('path');

module.exports = {
  extends: ['@mcansh/eslint-config/typescript'],
  parserOptions: {
    project: [path.join(process.cwd(), 'app/tsconfig.json')],
  },
  rules: {
    '@typescript-eslint/no-unsafe-assignment': 'off',
    'import/no-extraneous-dependencies': [
      'error',
      {
        devDependencies: [
          '__tests__/**/*',
          'lint-staged.config.js',
          'postcss.config.js',
          'tailwind.config.js',
          'pm2.config.js',
        ],
      },
    ],
  },
};
