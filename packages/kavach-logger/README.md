# @kavach/logger

> Kavach - Protective Armour

## Usage

```bash
pnpm add @kavach/logger @kavach/adapter-supabase
```

```js
import { getLogWriter } from '@kavach/adapter-supabase'
import { getLogger } from '@kavach/logger'

const writer = getLogWriter(config, options)
const logger = getLogger(writer, options)
```
