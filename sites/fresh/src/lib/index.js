import { config } from './config';
import { getLogWriter } from './supabase';
import { getLogger } from '@kavach/logger';

const writer = getLogWriter(config, 'svelte_logs');
export const logger = getLogger(writer, 'info');
