import js from '@eslint/js'
import globals from 'globals'
import reactHooks from 'eslint-plugin-react-hooks'
import reactRefresh from 'eslint-plugin-react-refresh'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist'] },
  {
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      ecmaVersion: 2020,
      globals: globals.browser,
    },
    plugins: {
      'react-hooks': reactHooks,
      'react-refresh': reactRefresh,
    },
    rules: {
      ...reactHooks.configs.recommended.rules,
      // Indice purement lié au Fast Refresh (dev) : sans impact en production,
      // et le projet co-localise volontairement constantes et composants.
      'react-refresh/only-export-components': 'off',
      // Le code s'appuie sur la normalisation dynamique des réponses API : `any` est assumé.
      '@typescript-eslint/no-explicit-any': 'off',
      // Les paramètres non utilisés et les erreurs capturées ignorées sont tolérés ;
      // les variables réellement inutiles restent signalées.
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          args: 'none',
          varsIgnorePattern: '^_',
          ignoreRestSiblings: true,
          caughtErrors: 'none',
        },
      ],
      // Les blocs catch vides sont volontaires (échec silencieux du cache local, etc.).
      'no-empty': ['error', { allowEmptyCatch: true }],
    },
  },
)
