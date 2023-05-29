#!/usr/bin/env node
import { convert } from './convert.js'
convert('./src/states', 'states')
convert('./src/components', 'components')
convert('./src/auth', 'auth', false)
