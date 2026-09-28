import categorical from './categorical.json' with { type: 'json' }

/**
 * Categorical colour families with full 50-950 ladders, used to differentiate
 * open-ended groups (chart series, graph node groups).
 *
 * Deliberately NOT merged into `defaultColors`: core's `tailwind.json` is a
 * different palette that disagrees on shared families, so merging would move
 * every chart's resolved colours.
 */
export const categoricalPalette: Record<string, Record<string, string>> = categorical

export const categoricalFamilies = Object.keys(categorical).sort()
