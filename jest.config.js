module.exports = {
    testEnvironment: 'node',
    coverageThreshold: {
        global: {
            statements: 100,
        }
    },
    collectCoverageFrom: [
        'commands/*.js',
        'utils/*.js'
    ],
    coveragePathIgnorePatterns: [
        'jest.config.js',
        '/coverage/',
        '/node_modules/',
        'test/.*.js',
    ],
    verbose: true
};
