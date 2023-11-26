import * as esbuild from 'esbuild';
import { rimraf } from 'rimraf';

const version = process.env.npm_package_version;
const year = new Date().getFullYear();

await rimraf('dist');

await esbuild.build({
  entryPoints: ["*.ts"],
  entryNames: `[dir]/[name]-${version}.min`,
  outdir: "dist",
  minify: true,
  bundle: true,
  platform: 'browser',
  target: 'ES2022',
  format: 'esm',
  banner: {'js':`/*! gt-fcm-wrapper v${version} | Copyright (c) ${year} gethomast | MIT */`}
});
