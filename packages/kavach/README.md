# Kavach

> Kavach - Protective Armour

## Usage

```bash
pnpm add kavach @kavach/adapter-supabase
```

```js
import { createAdapter } from '@kavach/adapter-supabase'
import { createKavach } from '@kavach'

const adapter = getAdapter(config)
const kavach = createKavach(adapter)
```
