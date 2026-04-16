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

prog
	.command('init')
	.describe('Initialize Rokkit in an existing SvelteKit project')
	.action(async (opts) => {
		const { init } = await import('./init.js')
		await init(opts)
	})

prog
	.command('add')
	.describe('Add Rokkit to an existing SvelteKit project (alias for init)')
	.action(async (opts) => {
		const { init } = await import('./init.js')
		await init(opts)
	})

prog
	.command('doctor')
	.describe('Validate Rokkit project setup')
	.option('--fix', 'Auto-fix safe issues')
	.action(async (opts) => {
		const { doctor } = await import('./doctor.js')
		await doctor(opts)
	})

prog
	.command('upgrade')
	.describe('Check for @rokkit/* package updates and optionally install them')
	.option('--apply', 'Install available upgrades')
	.action(async (opts) => {
		const { upgrade } = await import('./upgrade.js')
		upgrade(opts)
	})

prog
	.command('skin list')
	.describe('List all skins defined in rokkit.config.js')
	.action(async () => {
		const { skin } = await import('./skin.js')
		await skin('list')
	})

prog
	.command('skin create')
	.describe('Scaffold a new skin entry in rokkit.config.js')
	.option('--name', 'Skin name')
	.action(async (opts) => {
		const { skin } = await import('./skin.js')
		await skin('create', opts)
	})

prog
	.command('theme list')
	.describe('List built-in and custom themes')
	.action(async () => {
		const { theme } = await import('./theme.js')
		await theme('list')
	})

prog
	.command('theme create')
	.describe('Scaffold a new custom theme CSS file')
	.option('--name', 'Theme name')
	.action(async (opts) => {
		const { theme } = await import('./theme.js')
		await theme('create', opts)
	})

prog.parse(process.argv)
