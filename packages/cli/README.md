# @rokkit/cli

A command-line utility for bundling and converting SVG icons into JSON formats compatible with Iconify.

## Installation

```bash
# Install globally
npm install -g @rokkit/cli

# Or use directly with npx
npx @rokkit/cli [command]
```

## Usage

```bash
rokkit-cli [command] [options]
```

### Commands

#### `bundle`

Bundle icons in source folders into JSON files.

```bash
rokkit-cli bundle -i ./icons -o ./dist
```

This command:

1. Scans the input directory for subdirectories
2. Each subdirectory is treated as an icon set
3. Creates a JSON bundle for each icon set in the output directory

#### `build`

Build complete Iconify JSON packages for icon sets.

```bash
rokkit-cli build -i ./icons -o ./dist
```

Similar to `bundle`, but creates a full Iconify package structure for each icon set.

### Options

| Option     | Alias | Description                        | Default             |
| ---------- | ----- | ---------------------------------- | ------------------- |
| `--input`  | `-i`  | Source folder containing icon sets | `./src`             |
| `--output` | `-o`  | Target folder for output files     | `./build`           |
| `--config` | `-c`  | Path to custom config file         | `./src/config.json` |

## Configuration File

The configuration file should be a JSON file with the following structure:

```json
{
  "package": {
    "namespace": "@your-namespace",
    "version": "1.0.0",
    "homepage": "https://github.com/your-username/your-repo"
  },
  "icon-set-1": {
    "color": true
  },
  "icon-set-2": {
    "color": false
  }
}
```

- `package`: Global package information
  - `namespace`: Namespace for the icon package
  - `version`: Version number
  - `homepage`: Repository URL
- Each icon set can have specific configuration:
  - `color`: Whether to preserve colors (true) or convert to `currentColor` (false)

## Examples

### Basic usage

```bash
# Bundle icons
rokkit-cli bundle -i ./src/icons -o ./dist

# Build Iconify packages
rokkit-cli build -i ./src/icons -o ./dist
```

### Using a custom config file

```bash
rokkit-cli build -c ./my-config.json -i ./src/icons -o ./dist
```

## License

MIT
