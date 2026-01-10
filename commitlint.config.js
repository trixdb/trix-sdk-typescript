export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    'type-enum': [
      2,
      'always',
      [
        'feat',     // New feature
        'fix',      // Bug fix
        'docs',     // Documentation only
        'style',    // Formatting, missing semi colons
        'refactor', // Code change that neither fixes a bug nor adds a feature
        'perf',     // Performance improvement
        'test',     // Adding tests
        'chore',    // Updating build tasks, package manager configs
        'revert',   // Reverting a previous commit
        'build',    // Changes to build system or dependencies
        'ci',       // CI configuration changes
      ],
    ],
    'scope-enum': [
      2,
      'always',
      [
        // Core SDK components
        'client',
        'types',
        'errors',
        'utils',
        'testing',

        // Resource-specific scopes
        'memories',
        'spaces',
        'search',
        'graph',
        'entities',
        'facts',
        'relationships',
        'sessions',
        'highlights',
        'enrichments',
        'feedback',
        'agent',
        'jobs',
        'clusters',
        'resources',

        // Auth & billing
        'auth',
        'billing',
        'invites',
        'webhooks',

        // Infrastructure
        'deps',
        'config',
        'build',
        'docs',
      ],
    ],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [2, 'always', 'sentence-case'],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'body-max-line-length': [1, 'always', 100],
    'footer-max-line-length': [1, 'always', 100],
  },
};
