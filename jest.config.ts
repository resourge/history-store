module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node', // or 'jsdom' if you're testing in a browser-like environment
    transform: {
        '^.+\\.tsx?$': 'ts-jest', // Transform TypeScript files
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
};