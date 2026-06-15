// All images from src/assets/images — eager glob + named page aliases

const modules = import.meta.glob('./images/*.{png,jpg,jpeg,svg,webp,gif}', {
  eager: true,
  import: 'default',
})

const fileName = (path) => path.replace('./images/', '').replace(/\.[^/.]+$/, '')

/** Every image keyed by filename (without extension) */
export const images = Object.fromEntries(
  Object.entries(modules).map(([path, url]) => [fileName(path), url])
)

const img = (name) => images[name]

// ── Home ──
export const heroHomeTeam = img('home-hero-team')
export const illusAboutMountain = img('home-about-team')
export const globalGlobe = img('1042519_96422-OKOPZT-749-03 (1)') ?? img('illustration-global-network')

// ── About ──
export const aboutHeroGlobe = img('ChatGPT Image Jun 14, 2026, 07_03_32 AM')

// ── Service ──
export const heroServiceDashboard = img('illustration-dashboard')
export const bgAccounting = img('illustration-finance-coins')
export const bgFinancing = img('illustration-finance-chart')
export const bgHrServices = img('illustration-network')
export const bgCreativeDigital = img('illustration-creative')
export const bgManagedTeams = img('illustration-remote-work')

// ── Cart ──
export const illusClipboard = img('illustration-checklist')

// ── Branding / legacy logos ──
export const avioraLogo = img('aviora-logo')
export const avioraIcon = img('aviora-icon')
export const logoDefault = img('11-03')
export const logoAlt = img('111-03')

// ── Backgrounds (for CSS via JS or inline styles) ──
export const bgSoftWaves = img('bg-waves-light') ?? img('bg-waves-pale')
export const bgWavesGreen = img('bg-waves-alt')
export const bgWavesFooter = img('bg-footer-waves')
export const bgContact = img('ChatGPT Image Jun 14, 2026, 07_03_10 AM')
export const bgFooterPanel = img('ChatGPT Image Jun 14, 2026, 07_03_36 AM')
export const bgPayment = img('wmremove-transformed')
export const bgAbstract = img('hailuo_abstract_background')

// ── Additional illustrations ──
export const illustrationFinanceCoins = img('illustration-finance-coins')
export const illustrationFinanceChart = img('illustration-finance-chart')
export const illustrationGlobalNetwork = img('illustration-global-network')
export const illustrationNetwork = img('illustration-network')
export const illustrationCreative = img('illustration-creative')
export const illustrationRemoteWork = img('illustration-remote-work')
export const illustrationChecklist = img('illustration-checklist')
export const illustrationDashboard = img('illustration-dashboard')
export const iconCoins = img('icon-coins')

export default images
