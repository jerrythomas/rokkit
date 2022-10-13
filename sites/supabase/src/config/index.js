import { sentry } from '@jerrythomas/sentry'
import { supabase } from './auth'
import { routes } from './routes'

import { providers } from './providers'

sentry.init({ adapter: supabase, routes, providers })

export { supabase, sentry, providers }
