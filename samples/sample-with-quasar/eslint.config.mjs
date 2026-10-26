import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import pluginVue from 'eslint-plugin-vue';
import eslintConfigPrettier from 'eslint-config-prettier';

const vueEssential = pluginVue.configs['flat/essential'];

export default [
  {
    ignores: [
      'dist/**',
      'src-capacitor/**',
      'src-cordova/**',
      '.quasar/**',
      'node_modules/**',
      'quasar.config.*.temporary.compiled*',
    ],
  },
  ...vueEssential,
  {
    files: ['**/*.ts', '**/*.vue'],
    plugins: {
      '@typescript-eslint': tsPlugin,
    },
    languageOptions: {
      parser: vueEssential[1].languageOptions.parser,
      parserOptions: {
        parser: tsParser,
        extraFileExtensions: ['.vue'],
      },
      sourceType: 'module',
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      'prefer-promise-reject-errors': 'off',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/no-var-requires': 'off',
      'no-unused-vars': 'off',
      'no-debugger': process.env.NODE_ENV === 'production' ? 'error' : 'off',
    },
  },
  // Must come last so it turns off rules that conflict with Prettier
  eslintConfigPrettier,
];
