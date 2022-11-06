import { config } from './config';
import { getLogWriter } from '@kavach/adapter-supabase';
import { getLogger } from '@kavach/core';

const writer = getLogWriter(config, { table: 'svelte_logs' });
export const logger = getLogger(writer, { level: 'info' });
