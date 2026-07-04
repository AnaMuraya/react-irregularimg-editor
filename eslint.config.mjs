import js from '@eslint/js'
import tseslint from 'typescript-eslint'

export default tseslint.config(
  { ignores: ['dist', 'demo/bundle.js', 'node_modules', 'coverage'] },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    rules: {
      'no-empty': ['error', { allowEmptyCatch: true }],
      '@typescript-eslint/no-explicit-any': 'off',
      '@typescript-eslint/no-non-null-assertion': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/no-unused-vars': [
        'warn',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
    },
  }
)
