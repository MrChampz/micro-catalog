module.exports = {
  extends: '@loopback/eslint-config',
  rules: {
    '@typescript-eslint/naming-convention': 'off',
    '@typescript-eslint/no-floating-promises': 'off',
    '@typescript-eslint/no-misused-promises': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/ban-ts-comment': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        vars: 'all',
        args: 'none', // none - do not check arguments
        /*
         * The following is a workaround to the issue that parameter decorators
         * are treated as `unused-vars`.
         *
         * See https://github.com/typescript-eslint/typescript-eslint/issues/571
         *
         * @example
         * ```ts
         * import {inject} from '@loopback/context';
         * class MyController {
         *   constructor(@inject('foo') foo: string) {}
         * }
         * ```
         */
        varsIgnorePattern: 'inject|config|(\\w+)Bindings',
        ignoreRestSiblings: false,
      },
    ],
  },
};
