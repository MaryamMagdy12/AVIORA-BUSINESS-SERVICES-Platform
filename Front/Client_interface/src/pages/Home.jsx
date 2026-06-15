import { Link } from 'react-router-dom'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faUsers,
  faShieldHalved,
  faChartLine,
  faCoins,
  faArrowsUpDown,
  faLock,
  faUserTie,
  faGlobe,
  faShield,
  faChartColumn,
  faPiggyBank,
} from '@fortawesome/free-solid-svg-icons'
import {
  heroHomeTeam,
  illusAboutMountain,
  globalGlobe,
} from '../assets/media'
import { AvioraMark } from '../components/AvioraLogo'
import Reveal, { RevealStagger, RevealItem } from '../components/Reveal'
import '../assets/css/home.css'

const whyCards = [
  {
    icon: faUsers,
    title: 'Specialists On Demand',
    text: 'Tap into accounting, finance, HR, advisory, and creative talent worldwide—without building an in-house team from scratch.',
    link: '/service',
  },
  {
    icon: faShieldHalved,
    title: 'Built-In Compliance',
    text: 'Stay aligned with IFRS, SOCPA, Zakat, VAT, tax rules, HR policy, and data-protection standards in every deliverable.',
    link: '/about',
  },
  {
    icon: faChartLine,
    title: 'Live Insight, Not Lagging Reports',
    text: 'Track performance through real-time dashboards, financials, and HR metrics so you can act sooner and spot issues early.',
    link: '/about',
  },
  {
    icon: faCoins,
    title: 'Leaner Operating Costs',
    text: 'Replace fixed overhead—office space, full-time payroll, recruiting, and HR admin—with flexible expert support.',
    link: '/about#cost-reduction',
  },
  {
    icon: faArrowsUpDown,
    title: 'Teams That Flex With You',
    text: 'Expand or streamline capacity quickly, from operational roles to senior leadership, without months of hiring.',
    link: '/about',
  },
  {
    icon: faLock,
    title: 'Your Data, Protected',
    text: 'Work with governed access, secure systems, and disciplined handling of sensitive financial and people information.',
    link: '/about',
  },
]

const stats = [
  { icon: faUserTie, value: '100+', label: 'Skilled Professionals' },
  { icon: faGlobe, value: '30+', label: 'Markets Supported' },
  { icon: faShield, value: '98%', label: 'Clients Who Stay' },
  { icon: faChartColumn, value: '10+', label: 'Years of Delivery' },
]

const heroPills = [
  { to: '/about#cost-reduction', icon: faPiggyBank, label: 'CUT COSTS' },
  { to: '/service', icon: faShieldHalved, label: 'BUILD TRUST' },
  { to: '/about', icon: faGlobe, label: 'GO REMOTE' },
]

function Home() {
  return (
    <div className="home-page">
      <section className="home-hero">
        <svg className="home-hero__svg-defs" aria-hidden="true">
          <defs>
            <clipPath id="homeHeroCurve" clipPathUnits="objectBoundingBox">
              <path d="M 0.24 0 C 0.08 0.16, 0.36 0.38, 0.12 0.58 C 0.02 0.74, 0.1 0.9, 0.22 1 L 1 1 L 1 0 Z" />
            </clipPath>
          </defs>
        </svg>

        <div className="home-hero__watermark" aria-hidden="true">
          <AvioraMark className="home-hero__mark" />
        </div>

        <div className="container home-hero__inner">
          <Reveal immediate className="home-hero__content">
            <h1>
              Scale Faster With <span className="accent">Remote Experts You Can Rely On</span>
            </h1>
            <span className="home-hero__line" aria-hidden="true" />
            <p>
              From finance and HR to strategy and creative work, Aviora connects you with proven remote teams that keep operations sharp, compliant, and ready to grow.
            </p>
            <div className="home-hero__pills">
              {heroPills.map((pill) => (
                <Link key={pill.label} to={pill.to} className="hero-pill">
                  <span className="hero-pill__icon">
                    <FontAwesomeIcon icon={pill.icon} />
                  </span>
                  <span className="hero-pill__label">{pill.label}</span>
                  <span className="hero-pill__arrow" aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>

        <div className="home-hero__visual">
          <div className="home-hero__decor" aria-hidden="true">
            <div className="home-hero__glow" />
            <div className="home-hero__dots" />
            <svg className="home-hero__waves" viewBox="0 0 420 280" preserveAspectRatio="none">
              <path d="M0 200 C80 140, 160 240, 260 180 S400 120, 420 160" />
              <path d="M0 230 C100 170, 200 260, 300 200 S400 150, 420 190" />
              <path d="M40 120 C120 80, 220 160, 320 100 S400 60, 420 90" />
            </svg>
          </div>
          <div className="home-hero__image-shell">
            <img src={heroHomeTeam} alt="Remote business team collaborating across regions" />
          </div>
          <div className="home-hero__curve-glow" aria-hidden="true" />
        </div>
      </section>

      <section className="home-about" id="home_start">
        <div className="container home-about__grid">
          <Reveal className="home-about__image">
            <img src={illusAboutMountain} alt="Business growth and momentum" />
          </Reveal>
          <Reveal delay={0.1} className="home-about__content">
            <span className="section-label">Who We Are</span>
            <h2 className="section-heading">We Back <span className="accent">Your Ambition.</span></h2>
            <p className="section-subtext">
              Aviora is a remote-first partner for companies that want strong back-office and advisory support without the weight of traditional hiring. We bring together finance, HR, strategy, and creative talent so you can scale with clarity and control costs.
            </p>
            <Link to="/about" className="btn btn-primary home-about__btn">
              Learn Our Story <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
          <RevealStagger className="home-about__stats" stagger={0.1}>
            {stats.map((stat) => (
              <RevealItem key={stat.label}>
                <div className="stat-card">
                  <span className="stat-card__icon">
                    <FontAwesomeIcon icon={stat.icon} />
                  </span>
                  <strong>{stat.value}</strong>
                  <span>{stat.label}</span>
                </div>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>

      <section className="home-why" id="why-aviora">
        <div className="container">
          <Reveal className="home-why__header">
            <h2 className="home-why__title">THE AVIORA DIFFERENCE</h2>
            <div className="home-why__divider" />
          </Reveal>
          <RevealStagger className="home-why__grid" stagger={0.07}>
            {whyCards.map((card) => (
              <RevealItem key={card.title}>
                <Link to={card.link} className="why-card">
                  <span className="why-card__icon">
                    <FontAwesomeIcon icon={card.icon} />
                  </span>
                  <h3>{card.title}</h3>
                  <p>{card.text}</p>
                  <span className="why-card__line" />
                </Link>
              </RevealItem>
            ))}
          </RevealStagger>
          <Reveal className="home-why__cta">
            <Link to="/service" className="btn btn-teal">View All Services</Link>
          </Reveal>
        </div>
      </section>

      <section className="home-global">
        <div className="container home-global__grid">
          <Reveal className="home-global__content">
            <span className="section-label">Worldwide Reach</span>
            <h2 className="section-heading">Where You Operate, <span className="accent">We Show Up.</span></h2>
            <p className="section-subtext">Trusted partnerships across regions, time zones, and regulatory landscapes.</p>
            <Link to="/about" className="btn btn-teal home-global__btn">
              Explore Our Footprint <span aria-hidden="true">→</span>
            </Link>
          </Reveal>
          <Reveal delay={0.12} className="home-global__map">
            <img src={globalGlobe} alt="Global network of Aviora client partnerships" />
          </Reveal>
        </div>
      </section>
    </div>
  )
}

export default Home
