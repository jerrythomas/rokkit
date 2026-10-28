/**
 * Palette families — named, ready-to-use colour systems for a rokkit.config.js.
 *
 * Each family is `{ name, description, palettes, skin }`:
 *   - `palettes` — bare OKLCH `L C H` components (use `colorSpace: 'oklch'`), 50–950;
 *   - `skin` — every role (surface and ink as a light/dark pair, primary, secondary,
 *     tertiary, accent and the five status roles) plus the skin's own token `overrides`,
 *     which put status text on a darker shade over light paper and a lighter one over dark
 *     paper (no single shade reads at AA on both papers). Fills follow: `--on-{role}` is
 *     derived from the shade a mode paints.
 *
 * Palette names are shared across families only where the values are identical, so several
 * families can be spread into one `palettes` block.
 *
 *   import { zenSumi, seaGlass } from '@rokkit/unocss/palettes'
 *   export default {
 *     palettes: { ...zenSumi.palettes, ...seaGlass.palettes },
 *     colorSpace: 'oklch',
 *     skins: { default: zenSumi.skin, 'sea-glass': seaGlass.skin }
 *   }
 *
 * Every family is held to the same bar (spec/palette-families.spec.js): the ink ramp reads at
 * AA, primary and the status colours are distinct, the primary fill takes a readable
 * on-colour, and status text reads at AA on paper and paper-soft, in both modes.
 */

/** kami (紙) — washi paper: the warm light surface, with its sumi text stops (600–900) */
const kami = {
	50: '0.985 0.005 85', 100: '0.975 0.008 85', 200: '0.955 0.010 85',
	300: '0.920 0.012 85', 400: '0.850 0.010 70', 500: '0.750 0.008 50',
	600: '0.510 0.010 50', 700: '0.470 0.012 50', 800: '0.380 0.012 50',
	900: '0.220 0.012 50', 950: '0.170 0.010 50'
}

/** sumi (墨) — ink stick: the warm dark surface (50–400) and its paper-white text stops (600–950) */
const sumi = {
	50: '0.170 0.010 50', 100: '0.210 0.012 50', 200: '0.250 0.012 50',
	300: '0.320 0.012 50', 400: '0.420 0.010 50', 500: '0.570 0.010 50',
	600: '0.660 0.009 85', 700: '0.720 0.009 85', 800: '0.780 0.008 85',
	900: '0.940 0.008 85', 950: '0.975 0.008 85'
}

/** kiri (霧) — mist: a cool light surface on the kami lightness ladder */
const kiri = {
	50: '0.985 0.006 250', 100: '0.975 0.006 250', 200: '0.955 0.006 250',
	300: '0.920 0.006 250', 400: '0.850 0.012 250', 500: '0.750 0.012 250',
	600: '0.510 0.012 250', 700: '0.470 0.012 250', 800: '0.380 0.012 250',
	900: '0.220 0.012 250', 950: '0.170 0.012 250'
}

/** yoru (夜) — night: a cool dark surface on the sumi lightness ladder */
const yoru = {
	50: '0.170 0.012 255', 100: '0.210 0.012 255', 200: '0.250 0.012 255',
	300: '0.320 0.012 255', 400: '0.420 0.012 255', 500: '0.570 0.012 255',
	600: '0.660 0.008 255', 700: '0.720 0.008 255', 800: '0.780 0.008 255',
	900: '0.940 0.008 255', 950: '0.975 0.008 255'
}

/** shu (朱) — vermillion seal ink */
const shu = {
	50: '0.970 0.022 38', 100: '0.938 0.052 38', 200: '0.880 0.092 37',
	300: '0.805 0.130 37', 400: '0.725 0.165 37', 500: '0.641 0.190 36',
	600: '0.555 0.175 35', 700: '0.470 0.150 34', 800: '0.390 0.122 33',
	900: '0.315 0.092 33', 950: '0.245 0.066 33'
}

/** hisui (翡翠) — jade */
const hisui = {
	50: '0.970 0.015 160', 100: '0.940 0.030 160', 200: '0.880 0.050 160',
	300: '0.800 0.065 160', 400: '0.720 0.075 160', 500: '0.620 0.080 160',
	600: '0.540 0.075 160', 700: '0.460 0.065 160', 800: '0.380 0.055 160',
	900: '0.300 0.045 160', 950: '0.240 0.035 160'
}

/** kohaku (琥珀) — amber */
const kohaku = {
	50: '0.980 0.020 75', 100: '0.950 0.040 75', 200: '0.900 0.070 75',
	300: '0.850 0.095 75', 400: '0.790 0.110 75', 500: '0.720 0.120 75',
	600: '0.640 0.110 75', 700: '0.560 0.095 75', 800: '0.470 0.080 75',
	900: '0.380 0.065 75', 950: '0.300 0.050 75'
}

/** beni (紅) — crimson */
const beni = {
	50: '0.980 0.010 18', 100: '0.955 0.025 20', 200: '0.910 0.055 22',
	300: '0.850 0.100 24', 400: '0.740 0.155 26', 500: '0.570 0.185 27',
	600: '0.500 0.175 25', 700: '0.420 0.155 23', 800: '0.330 0.120 20',
	900: '0.250 0.085 18', 950: '0.170 0.060 18'
}

/** ai (藍) — indigo dye */
const ai = {
	50: '0.970 0.015 250', 100: '0.945 0.030 251', 200: '0.905 0.060 252',
	300: '0.845 0.100 253', 400: '0.750 0.135 254', 500: '0.590 0.160 254',
	600: '0.510 0.155 254', 700: '0.430 0.140 254', 800: '0.330 0.110 254',
	900: '0.250 0.080 254', 950: '0.180 0.065 255'
}

/** murasaki (紫) — purple */
const murasaki = {
	50: '0.970 0.020 300', 100: '0.945 0.045 300', 200: '0.905 0.085 301',
	300: '0.845 0.135 302', 400: '0.735 0.185 302', 500: '0.560 0.225 303',
	600: '0.480 0.210 303', 700: '0.400 0.185 304', 800: '0.305 0.145 304',
	900: '0.225 0.105 305', 950: '0.180 0.085 305'
}

/** umi (海) — sea teal; its 500 sits between Tailwind teal 500 and 600, so light text reads on its translucent fills */
const umi = {
	50: '0.984 0.014 181', 100: '0.953 0.050 181', 200: '0.910 0.093 180',
	300: '0.855 0.125 181', 400: '0.785 0.133 182', 500: '0.660 0.118 184',
	600: '0.600 0.104 185', 700: '0.511 0.086 186', 800: '0.437 0.071 188',
	900: '0.386 0.059 188', 950: '0.277 0.045 193'
}

/** sora (空) — sky */
const sora = {
	50: '0.977 0.013 237', 100: '0.951 0.025 237', 200: '0.901 0.056 231',
	300: '0.828 0.101 230', 400: '0.754 0.139 233', 500: '0.685 0.148 237',
	600: '0.588 0.139 242', 700: '0.500 0.119 243', 800: '0.443 0.100 241',
	900: '0.391 0.085 241', 950: '0.293 0.063 243'
}

/** take (竹) — bamboo green */
const take = {
	50: '0.982 0.018 156', 100: '0.962 0.043 157', 200: '0.925 0.081 156',
	300: '0.871 0.136 154', 400: '0.800 0.182 152', 500: '0.723 0.192 150',
	600: '0.627 0.170 149', 700: '0.527 0.137 150', 800: '0.448 0.108 151',
	900: '0.393 0.090 153', 950: '0.266 0.063 153'
}

/** daidai (橙) — bitter orange */
const daidai = {
	50: '0.980 0.016 74', 100: '0.954 0.037 75', 200: '0.901 0.073 71',
	300: '0.837 0.116 66', 400: '0.758 0.159 56', 500: '0.705 0.187 48',
	600: '0.646 0.194 41', 700: '0.553 0.174 38', 800: '0.470 0.143 37',
	900: '0.408 0.116 38', 950: '0.266 0.076 36'
}

/** sakura (桜) — cherry-blossom rose */
const sakura = {
	50: '0.969 0.015 12', 100: '0.941 0.030 12', 200: '0.892 0.056 10',
	300: '0.810 0.106 12', 400: '0.719 0.169 13', 500: '0.645 0.215 16',
	600: '0.586 0.222 18', 700: '0.514 0.198 17', 800: '0.455 0.171 14',
	900: '0.410 0.150 10', 950: '0.271 0.101 12'
}

/** momo (桃) — peach-blossom pink */
const momo = {
	50: '0.971 0.014 343', 100: '0.948 0.028 342', 200: '0.899 0.059 343',
	300: '0.823 0.110 346', 400: '0.725 0.175 350', 500: '0.656 0.212 354',
	600: '0.592 0.218 1', 700: '0.525 0.199 4', 800: '0.459 0.170 4',
	900: '0.408 0.144 2', 950: '0.284 0.105 4'
}

/** fuji (藤) — wisteria violet, one stop lighter than Tailwind violet so its 500 takes near-black text */
const fuji = {
	50: '0.985 0.008 293', 100: '0.969 0.016 294', 200: '0.943 0.029 294',
	300: '0.894 0.055 293', 400: '0.811 0.101 294', 500: '0.709 0.159 294',
	600: '0.606 0.219 293', 700: '0.541 0.247 293', 800: '0.491 0.241 293',
	900: '0.432 0.211 293', 950: '0.380 0.178 294'
}

/** kikyō (桔梗) — bellflower indigo, one stop lighter than Tailwind indigo */
const kikyo = {
	50: '0.979 0.010 267', 100: '0.962 0.018 272', 200: '0.930 0.034 273',
	300: '0.870 0.062 274', 400: '0.785 0.104 275', 500: '0.680 0.158 277',
	600: '0.585 0.204 277', 700: '0.511 0.230 277', 800: '0.457 0.215 277',
	900: '0.398 0.177 277', 950: '0.359 0.135 279'
}

/** koke (苔) — moss */
const koke = {
	50: '0.979 0.021 166', 100: '0.950 0.051 163', 200: '0.905 0.089 164',
	300: '0.845 0.130 165', 400: '0.773 0.153 163', 500: '0.696 0.149 163',
	600: '0.596 0.127 163', 700: '0.508 0.105 166', 800: '0.432 0.086 167',
	900: '0.378 0.073 169', 950: '0.262 0.049 173'
}

/** mizu (水) — water cyan */
const mizu = {
	50: '0.984 0.019 201', 100: '0.956 0.044 204', 200: '0.917 0.077 205',
	300: '0.865 0.115 207', 400: '0.797 0.134 212', 500: '0.715 0.126 215',
	600: '0.609 0.111 222', 700: '0.520 0.094 223', 800: '0.450 0.077 224',
	900: '0.398 0.066 227', 950: '0.302 0.054 230'
}

/** wakaba (若葉) — young-leaf lime */
const wakaba = {
	50: '0.986 0.031 121', 100: '0.967 0.066 122', 200: '0.938 0.122 124',
	300: '0.897 0.179 127', 400: '0.849 0.207 129', 500: '0.768 0.204 131',
	600: '0.648 0.175 132', 700: '0.532 0.141 132', 800: '0.453 0.113 131',
	900: '0.405 0.096 131', 950: '0.274 0.069 132'
}

/**
 * The skin `overrides` for status roles: each token reads `palette.<light>` on light paper and
 * `palette.<dark>` on dark paper. The `-soft` tints keep rokkit's light 100 in both modes,
 * which the themes darken their status copy against.
 * @param {Record<string, [string, number, number]>} roles - role → [palette, light shade, dark shade]
 */
function statusOverrides(roles) {
	return Object.fromEntries(
		Object.entries(roles).map(([role, [palette, light, dark]]) => [
			role,
			{ light: `${palette}.${light}`, dark: `${palette}.${dark}` }
		])
	)
}

/** The warm paper/ink pair: kami by day, sumi by night. */
const WARM = { surface: { light: 'kami', dark: 'sumi' }, ink: { light: 'kami', dark: 'sumi' } }
/** The cool paper/ink pair: kiri by day, yoru by night. */
const COOL = { surface: { light: 'kiri', dark: 'yoru' }, ink: { light: 'kiri', dark: 'yoru' } }

/** The status roles most families share: jade, amber, crimson, indigo. */
const TRADITIONAL_STATUS = {
	success: 'hisui',
	warning: 'kohaku',
	danger: 'beni',
	error: 'beni',
	info: 'ai'
}
const TRADITIONAL_OVERRIDES = {
	success: ['hisui', 700, 400],
	warning: ['kohaku', 800, 400],
	danger: ['beni', 600, 400],
	error: ['beni', 600, 400],
	info: ['ai', 600, 400]
}

/**
 * zen-sumi — sumi ink on washi paper, a vermillion seal. Quiet, warm, deliberate.
 *
 * secondary is murasaki, not hisui: hisui is success, and a secondary action drawn in the
 * success colour reads as "this succeeded".
 */
export const zenSumi = {
	name: 'zen-sumi',
	description: 'Sumi ink on washi paper with a vermillion seal — quiet, warm, deliberate.',
	palettes: { kami, sumi, shu, hisui, kohaku, beni, ai, murasaki },
	skin: {
		...WARM,
		primary: 'shu',
		secondary: 'murasaki',
		tertiary: 'kohaku',
		accent: 'shu',
		...TRADITIONAL_STATUS,
		overrides: statusOverrides(TRADITIONAL_OVERRIDES)
	}
}

/** sea-glass — sea teal and open sky over cool mist. Calm, clear, airy. */
export const seaGlass = {
	name: 'sea-glass',
	description: 'Sea teal and open sky over cool mist — calm, clear, airy.',
	palettes: { kiri, yoru, umi, sora, koke, take, kohaku, beni, ai },
	skin: {
		...COOL,
		primary: 'umi',
		secondary: 'koke',
		tertiary: 'sora',
		accent: 'sora',
		...TRADITIONAL_STATUS,
		success: 'take',
		overrides: statusOverrides({ ...TRADITIONAL_OVERRIDES, success: ['take', 800, 400] })
	}
}

/** sakura-ember — bitter-orange embers and cherry blossom on warm paper. Lively, friendly. */
export const sakuraEmber = {
	name: 'sakura-ember',
	description: 'Bitter-orange embers and cherry blossom on warm paper — lively, friendly.',
	palettes: { kami, sumi, daidai, sakura, momo, hisui, kohaku, beni, ai },
	skin: {
		...WARM,
		primary: 'daidai',
		secondary: 'sakura',
		tertiary: 'momo',
		accent: 'momo',
		...TRADITIONAL_STATUS,
		overrides: statusOverrides(TRADITIONAL_OVERRIDES)
	}
}

/** fuji-dusk — wisteria and bellflower at dusk over cool mist. Dreamy, focused. */
export const fujiDusk = {
	name: 'fuji-dusk',
	description: 'Wisteria and bellflower at dusk over cool mist — dreamy, focused.',
	palettes: { kiri, yoru, fuji, kikyo, murasaki, hisui, kohaku, beni, ai },
	skin: {
		...COOL,
		primary: 'fuji',
		secondary: 'murasaki',
		tertiary: 'kikyo',
		accent: 'kikyo',
		...TRADITIONAL_STATUS,
		overrides: statusOverrides(TRADITIONAL_OVERRIDES)
	}
}

/** moss-garden — moss and running water on warm stone paper. Grounded, fresh. */
export const mossGarden = {
	name: 'moss-garden',
	description: 'Moss and running water on warm stone paper — grounded, fresh.',
	palettes: { kami, sumi, koke, mizu, umi, wakaba, kohaku, beni, ai },
	skin: {
		...WARM,
		primary: 'koke',
		secondary: 'umi',
		tertiary: 'mizu',
		accent: 'mizu',
		...TRADITIONAL_STATUS,
		success: 'wakaba',
		overrides: statusOverrides({ ...TRADITIONAL_OVERRIDES, success: ['wakaba', 800, 400] })
	}
}

/** Every family by name. */
export const PALETTE_FAMILIES = {
	'zen-sumi': zenSumi,
	'sea-glass': seaGlass,
	'sakura-ember': sakuraEmber,
	'fuji-dusk': fujiDusk,
	'moss-garden': mossGarden
}
