// @ts-check

/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  rootDir: './test',
  snapshotFormat: {
    escapeString: true,
    printBasicPrototype: true,
  },
  prettierPath: require.resolve('formatter-for-jest-snapshots'),
};
