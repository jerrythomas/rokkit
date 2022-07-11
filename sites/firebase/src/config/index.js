import { sentry } from '@jerrythomas/sentry'
import { firebase } from './auth'
import { routes } from './routes'
import { providers } from './providers'

sentry.init({ adapter: firebase, routes, providers })

export { firebase, sentry, providers }
