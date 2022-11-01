import { describe, expect, it } from 'vitest'
import fs from 'fs'
import yaml from 'js-yaml'

import { Router } from '../src/router.js'

describe('Router functions', () => {
	const context = {
		config: yaml.load(fs.readFileSync('spec/fixtures/config.yaml', 'utf8')),
		roles: yaml.load(fs.readFileSync('spec/fixtures/roles.yaml', 'utf8')),
		redirect: yaml.load(fs.readFileSync('spec/fixtures/redirect.yaml', 'utf8'))
	}

	it('Should handle different options', () => {
		context.config.forEach(({ options, expected, message }) => {
			let router = new Router(options)
			Object.keys(expected).forEach((key) => {
				expect(router[key]).toEqual(expected[key], message)
			})
		})
	})

	// it('Should set allowedRoutes', () => {
	// 	const { options, message, expected, data } = context.roles
	// 	let router = new Router(options)

	// 	Object.keys(expected).forEach((key) => {
	// 		expect(router[key]).toEqual(expected[key], message)
	// 	})

	// 	data.forEach(({ roles, routes, message, isAuthenticated }) => {
	// 		router.authRoles = roles
	// 		expect(router.allowedRoutes).toEqual(routes, message)
	// 		expect(router.isAuthenticated).toEqual(isAuthenticated, message)
	// 	})
	// })

	// it('Should fallback on allowed routes', () => {
	// 	const { options, data } = context.redirect
	// 	let router = new Router(options)

	// 	data.forEach(({ roles, routes, message }) => {
	// 		router.authRoles = roles
	// 		routes.forEach(({ visited, redirect }) => {
	// 			const fallback = router.redirect(visited)
	// 			expect(fallback).toEqual(redirect, message)
	// 		})
	// 	})
	// })
})
