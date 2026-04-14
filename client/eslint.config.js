import vue from 'eslint-plugin-vue'
import typescriptParser from '@typescript-eslint/parser'
import typescriptPlugin from '@typescript-eslint/eslint-plugin'

export default [
  ...vue.configs['flat/recommended'],
  {
    files: ['**/*.vue'],
    languageOptions: {
      parserOptions: {
        parser: typescriptParser,
        ecmaVersion: 2022,
        sourceType: 'module',
      }
    },
    rules: {
      'vue/max-attributes-per-line': ['error', {
        "singleline": {
          "max": 2
        },      
        "multiline": {
          "max": 1
        }
      }],
      'vue/html-indent': ['error', 'tab'],
      'vue/html-closing-bracket-newline': ['error', {
        singleline: 'never',
        multiline: 'always'
      }],
      'vue/first-attribute-linebreak': ['error', {
        singleline: 'ignore',
        multiline: 'below'
      }],
      'vue/multi-word-component-names': 'off',
    }
  },
  {
    files: ['**/*.ts', '**/*.tsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 2022,
        sourceType: 'module',
      }
    },
    plugins: {
      '@typescript-eslint': typescriptPlugin
    }
  }
]