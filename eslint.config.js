import js from '@eslint/js';
import globals from 'globals';
import reactHooks from 'eslint-plugin-react-hooks';
import reactRefresh from 'eslint-plugin-react-refresh';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  { ignores: ['dist', 'node_modules'] },
  {
    files: ['**/*.{ts,tsx}'],
    extends: [js.configs.recommended, ...tseslint.configs.recommended],
    languageOptions: { globals: globals.browser },
    plugins: { 'react-hooks': reactHooks, 'react-refresh': reactRefresh },
    rules: {
      ...reactHooks.configs.recommended.rules,
      'react-refresh/only-export-components': ['warn', { allowConstantExport: true }],
      // no-hardcoded-hex rule: colours come from Tailwind tokens only
      'no-restricted-syntax': [
        'error',
        { selector: 'Literal[value=/^#[0-9a-fA-F]+$/]', message: 'No hex values: use Tailwind tokens.' },
      ],
    },
  },
  { files: ['tailwind.config.ts'], rules: { 'no-restricted-syntax': 'off' } },
);
