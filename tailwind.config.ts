import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class", "class"],
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}"],
  theme: {
  	extend: {
  		colors: {
  			base: 'rgb(var(--color-base) / <alpha-value>)',
  			panel: 'rgb(var(--color-panel) / <alpha-value>)',
  			panel2: 'rgb(var(--color-panel-2) / <alpha-value>)',
  			ink: 'rgb(var(--color-ink) / <alpha-value>)',
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			line: 'rgb(var(--color-line) / <alpha-value>)',
  			frost: 'rgb(var(--color-brand) / <alpha-value>)',
  			frostdark: 'rgb(var(--color-brand-dark) / <alpha-value>)',
  			brand: {
  				'50': 'rgb(var(--color-brand-50) / <alpha-value>)',
  				'100': 'rgb(var(--color-brand-100) / <alpha-value>)',
  				'400': 'rgb(var(--color-brand-400) / <alpha-value>)',
  				'500': 'rgb(var(--color-brand) / <alpha-value>)',
  				'600': 'rgb(var(--color-brand-dark) / <alpha-value>)',
  				'700': 'rgb(var(--color-brand-700) / <alpha-value>)'
  			},
  			verde: 'rgb(var(--color-brand) / <alpha-value>)',
  			verdebg: 'rgb(var(--color-brand-50) / <alpha-value>)',
  			amarelo: 'rgb(var(--color-amarelo) / <alpha-value>)',
  			amarelobg: 'rgb(var(--color-amarelo-bg) / <alpha-value>)',
  			vermelho: 'rgb(var(--color-vermelho) / <alpha-value>)',
  			vermelhobg: 'rgb(var(--color-vermelho-bg) / <alpha-value>)',
  			azul: 'rgb(var(--color-azul) / <alpha-value>)',
  			azulbg: 'rgb(var(--color-azul-bg) / <alpha-value>)',
  			roxo: 'rgb(var(--color-roxo) / <alpha-value>)',
  			roxobg: 'rgb(var(--color-roxo-bg) / <alpha-value>)',
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			border: 'hsl(var(--border))',
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'ui-sans-serif',
  				'system-ui',
  				'-apple-system',
  				'Segoe UI',
  				'Roboto',
  				'sans-serif'
  			]
  		},
  		boxShadow: {
  			soft: '0 1px 2px 0 rgb(0 0 0 / 0.04), 0 1px 3px 0 rgb(0 0 0 / 0.04)',
  			card: '0 1px 2px 0 rgb(0 0 0 / 0.03), 0 8px 24px -12px rgb(0 0 0 / 0.10)',
  			lift: '0 2px 4px 0 rgb(0 0 0 / 0.04), 0 14px 28px -14px rgb(0 0 0 / 0.18)',
  			glow: '0 0 0 1px rgb(var(--color-brand) / 0.15), 0 8px 24px -8px rgb(var(--color-brand) / 0.35)'
  		},
  		backgroundImage: {
  			'grid-fade': 'radial-gradient(circle at top left, rgb(var(--color-brand) / 0.08), transparent 45%)'
  		},
  		borderRadius: {
  			lg: 'var(--radius)',
  			md: 'calc(var(--radius) - 2px)',
  			sm: 'calc(var(--radius) - 4px)'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
};
export default config;
