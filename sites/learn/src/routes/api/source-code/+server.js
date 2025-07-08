import { readFileSync } from 'fs'
import { join, resolve } from 'path'
import { error } from '@sveltejs/kit'

/**
 * GET /api/source-code?path=<file-path>
 * Serves source code for demo files in the tutorial system
 */
export async function GET({ url, request }) {
	const filePath = url.searchParams.get('path')

	if (!filePath) {
		throw error(400, 'Missing path parameter')
	}

	// Security: Only allow paths within the tutorial directory
	const allowedPaths = [
		'/src/routes/(learn)/tutorial/',
		'src/routes/(learn)/tutorial/'
	]

	const isAllowed = allowedPaths.some(allowed => filePath.includes(allowed))
	if (!isAllowed) {
		throw error(403, 'Access denied: Path not allowed')
	}

	// Security: Prevent directory traversal
	if (filePath.includes('..') || filePath.includes('~')) {
		throw error(403, 'Access denied: Invalid path')
	}

	// Only allow .svelte, .js, .ts files
	const allowedExtensions = ['.svelte', '.js', '.ts', '.css']
	const hasValidExtension = allowedExtensions.some(ext => filePath.endsWith(ext))
	if (!hasValidExtension) {
		throw error(403, 'Access denied: File type not allowed')
	}

	try {
		// Resolve the file path relative to the project root
		let resolvedPath

		if (filePath.startsWith('/')) {
			// Absolute path from project root
			resolvedPath = join(process.cwd(), filePath.substring(1))
		} else {
			// Relative path from current directory
			resolvedPath = join(process.cwd(), filePath)
		}

		// Read the file
		const content = readFileSync(resolvedPath, 'utf-8')

		// Return the content with appropriate headers
		return new Response(content, {
			headers: {
				'Content-Type': 'text/plain; charset=utf-8',
				'Cache-Control': 'no-cache, no-store, must-revalidate',
				'Pragma': 'no-cache',
				'Expires': '0'
			}
		})
	} catch (err) {
		if (err.code === 'ENOENT') {
			throw error(404, `File not found: ${filePath}`)
		} else if (err.code === 'EACCES') {
			throw error(403, `Access denied: ${filePath}`)
		} else {
			console.error('Error reading source file:', err)
			throw error(500, 'Internal server error')
		}
	}
}
