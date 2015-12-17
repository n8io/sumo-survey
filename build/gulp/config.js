const path = require('path');
const shell = require('shelljs');
const cwd = require('cwd');
const buildDir = cwd('build');
const srcDir = cwd('src');
const testDir = cwd('test');
const distDir = cwd('dist');
const packageJson = require(cwd('package.json'));
const cfg = {
  stylint: {
    src: [
      path.join(srcDir, 'app/client/**/*.styl')
    ]
  },
  clean: {
    src: [
      distDir
    ]
  },
  coverage: {
    src: [
      'src/**/*.js'
    ],
    options: {
      includeUntested: true
    },
    writeReportsOptions: {
      reporters: [
        'html',
        'lcov',
        'json',
        'text'
      ]
    },
    thresholdOptions: {
      thresholds: {
        global: {
          statements: 95,
          branches: 85,
          functions: 90,
          lines: 95
        },
        each: {
          statements: 90,
          branches: 70,
          lines: -20
        }
      }
    }
  },
  eslint: {
    src: [
      path.join(buildDir, '**/*.js'),
      path.join(srcDir, '**/*.js'),
      path.join(testDir, '**/*.js'),
      path.join(`!${srcDir}`, 'app/client/statics/**/*.js'),
      path.join(`!${cwd()}`, '**/*.min.js')
    ]
  },
  'git-info': {
    dest: cwd('.git.json')
  },
  nodemon: {
    script: cwd(process.env['npm_package_main']),
    ext: 'js',
    ignore: [
      path.join(`!${buildDir}`, 'docker/**/*.js'),
      path.join(`!${srcDir}`, 'client/statics/**/*')
    ]
  },
  plato: {
    src: [
      cwd('src/**/*.js')
    ],
    dest: cwd('coverage/plato'),
    options: {
      title: `In-Depth Code Coverage for ${packageJson.name}`,
      date: (new Date()).getTime(),
      recurse: true
    }
  },
  test: {
    all: {
      src: [
        cwd('test/test.spec.js')
      ],
      options: {
        reporter: 'spec',
        growl: true
      }
    },
    unit: {
      src: [
        cwd('test/unit/unit.spec.js')
      ],
      options: {
        reporter: 'spec',
        growl: true
      }
    },
    integration: {
      src: [
        cwd('test/integration/integration.spec.js')
      ],
      options: {
        reporter: 'spec',
        growl: true
      }
    }
  }
};

cfg.git = {
  commit: (shell.exec('git rev-parse --verify HEAD', {silent: true}).output || '').split('\n').join(''),
  branch: (shell.exec('git rev-parse --abbrev-ref HEAD', {silent: true}).output || '').split('\n').join('')
};

module.exports = cfg;
