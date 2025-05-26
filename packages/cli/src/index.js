#!/usr/bin/env node
/* eslint-disable no-console */
import sade from 'sade'
import { bundleFolders, convertFolders, readConfigFile, getFolderNames } from './convert.js'
// import path from 'path'
import pkg from '../package.json' with { type: 'json' }

const prog = sade(pkg.name)

prog
	.version(pkg.version)
	.option('-c, --config', 'Provide path to custom config', 'config.json')
	.option('-i, --input', 'Specify the source folder', './src')
	.option('-o, --output', 'Specify the output folder', './lib')

prog
	.command('bundle')
	.describe('Bundle icons in the source folder into json files.')
	.example(`${pkg.name} bundle -i src -o build --config my-conf.json`)
	.action((opts) => {
		console.info(`> Bundling from ${opts.input} to ${opts.output}`)
		// Read the configuration
		const config = readConfigFile(`${opts.input}/${opts.config}`)
		// Find folders under input as bundles
		const folders = getFolderNames(opts.input)

		if (folders.length === 0) {
			console.warn(`No folders found in ${opts.input}`)
			return
		}

		console.info(`> Found folders: ${folders.join(', ')}`)
		bundleFolders(folders, config, opts)
		// Process each folder as an icon bundle
	})

prog
	.command('build')
	.describe('Build a complete iconify json package for each icon folder')
	.example(`${pkg.name} build -i src -o build --config my-conf.json`)
	.action((opts) => {
		console.info(`> Building iconify packages from ${opts.input} to ${opts.output}`)
		const config = readConfigFile(`${opts.input}/${opts.config}`)
		const folders = getFolderNames(opts.input)

		if (folders.length === 0) {
			console.warn(`No folders found in ${opts.input}`)
			return
		}

		console.info(`> Found folders: ${folders.join(', ')}`)
		// Process each folder as an icon set
		convertFolders(folders, config, opts)
	})

prog.parse(process.argv)
