import alias from '@rollup/plugin-alias';
import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import typescript from 'rollup-plugin-typescript';

export default [
    // CommonJS build
    {
        input: 'src/index.ts',
        plugins: [resolve(), commonjs(), typescript()],
        external: ['prettier', 'js-yaml', 'yaml'],
        output: {
            file: 'dist/index.js',
            format: 'cjs',
            sourcemap: true,
        },
    },
    // Browser build
    // Supported use case: importing the plugin from a bundler like Vite or Webpack
    // Semi-supported use case: importing the plugin directly in the browser through using import maps.
    {
        input: 'src/index.ts',
        plugins: [
            alias({
                entries: [{ find: 'prettier', replacement: 'prettier/standalone' }],
            }),
            resolve(),
            commonjs(),
            typescript(),
        ],
        external: ['prettier/standalone', 'prettier/plugins/babel', 'js-yaml', 'yaml'],
        output: {
            file: 'dist/browser.js',
            format: 'esm',
        },
    },
];
