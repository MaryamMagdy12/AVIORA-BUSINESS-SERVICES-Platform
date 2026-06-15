import { useEffect } from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import {
  faBullseye,
  faLightbulb,
  faGem,
  faCoins,
  faUsers,
  faShieldHalved,
  faChartLine,
  faGears,
  faChartColumn,
  faLock,
  faGlobe,
  faTrophy,
  faCheck,
} from '@fortawesome/free-solid-svg-icons'
import { aboutHeroGlobe } from '../assets/media'
import Reveal, { RevealStagger, RevealItem } from '../components/Reveal'
import '../assets/css/about.css'

const benefits = [
  {
    icon: faCoins,
    title: 'Leaner Operating Costs',
    text: 'Get senior-level output without the overhead of a traditional in-house department.',
    bullets: [
      'No office or equipment spend',
      'No full-time salary and benefits stack',
      'No recruiting or onboarding cycles',
      'No internal HR administration burden',
    ],
    footer: 'Redirect savings into growth, product, and market expansion.',
  },
  {
    icon: faUsers,
    title: 'Specialists On Demand',
    text: 'Skip the long search for individual hires. We assemble a multidisciplinary team with deep experience in:',
    bullets: ['Accounting & Finance', 'HR & Organizational Development', 'Business Advisory', 'Creative & Digital Solutions'],
    footer: 'You gain expertise without turnover risk or management drag.',
  },
  {
    icon: faShieldHalved,
    title: 'Built-In Compliance',
    text: 'We help you meet expectations across local and international frameworks, including:',
    bullets: ['IFRS and SOCPA', 'Zakat, VAT, and tax reporting', 'HR policy and labor requirements', 'Data privacy and confidentiality'],
    footer: 'Deliverables are accurate, audit-ready, and regulation-aware.',
  },
  {
    icon: faChartLine,
    title: 'Teams That Flex With You',
    text: 'Growth should not wait on hiring timelines. We structure and manage teams to match your stage:',
    bullets: ['Operational support', 'Senior specialists', 'Department leads', 'Executive-level coverage'],
    footer: 'Scale capacity up or down when your business needs change.',
  },
  {
    icon: faGears,
    title: 'One Partner, One Workflow',
    text: 'Finance, HR, advisory, and creative work under a single coordinated model.',
    bullets: ['One accountable partner', 'One clear process', 'One integrated delivery rhythm', 'Fewer handoffs and delays'],
    footer: 'Operations become simpler, faster, and easier to oversee.',
  },
  {
    icon: faChartColumn,
    title: 'Live Insight, Not Lagging Reports',
    text: 'See what matters when it matters—with dashboards, financials, and people data updated in real time.',
    bullets: [
      'Clearer decisions with current data',
      'Transparent view of performance',
      'Earlier warning on risks and gaps',
      'Access to insights from anywhere',
    ],
    footer: 'Technology replaces manual reporting bottlenecks.',
  },
  {
    icon: faLock,
    title: 'Your Data, Protected',
    text: 'Confidentiality is non-negotiable. We safeguard financial, HR, and business information through:',
    bullets: ['Secure infrastructure', 'Role-based access controls', 'Documented privacy procedures', 'Professional handling of sensitive records'],
    footer: 'Your information stays controlled and protected.',
  },
  {
    icon: faGlobe,
    title: 'Global Mindset, Local Fit',
    text: 'We support clients across markets and adapt to different business cultures and regulatory contexts.',
    bullets: ['Cross-border experience', 'Region-aware execution', 'International best practices', 'Practical, flexible delivery'],
    footer: '',
  },
  {
    icon: faBullseye,
    title: 'Strategy Shaped Around You',
    text: 'We do not offer one-size-fits-all packages. Solutions are designed around your:',
    bullets: ['Industry', 'Company size', 'Target markets', 'Current priorities', 'Long-term goals'],
    footer: 'We aim to be a long-term growth partner—not a transactional vendor.',
  },
  {
    icon: faTrophy,
    title: 'Results You Can Measure',
    text: 'Clients work with us because outcomes are visible. We have helped organizations:',
    bullets: [
      'Lower operating expenses',
      'Improve process efficiency',
      'Strengthen financial position',
      'Stand up complete remote departments',
      'Enter and expand in new markets',
    ],
    footer: 'Impact is practical, measurable, and sustained.',
  },
]

const values = [
  'Integrity in every engagement',
  'Accountability and continuous improvement',
  'Standards that travel globally',
  'Solutions that scale with you',
  'Confidentiality by design',
]

function About() {
  useEffect(() => {
    const hash = window.location.hash
    if (hash) {
      setTimeout(() => {
        document.querySelector(hash)?.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 100)
    }
  }, [])

  return (
    <div className="about-page">
      <section className="about-hero" style={{ backgroundImage: `url(${aboutHeroGlobe})` }}>
        <div className="container about-hero__grid">
          <Reveal immediate className="about-hero__content">
            <span className="about-hero__label">About Aviora</span>
            <h1>
              Designed for <span className="accent">Momentum.</span>
              <br />
              Grounded in <span className="accent">Precision.</span>
            </h1>
            <p>
              Founded in 2025, Aviora Business Services helps organizations run smarter through remote expertise in accounting, finance, HR, advisory, and creative delivery.
            </p>
            <p>
              We partner with clients in many countries, offering flexible capacity that adapts as priorities shift—so teams can move faster without sacrificing quality.
            </p>
            <p>
              Our model is simple: world-class specialists, modern systems, and disciplined processes—without the cost and complexity of building everything internally.
            </p>
            <p>
              Whether you need a finance function, HR support, strategic guidance, or creative execution, Aviora provides the people and structure to help you compete globally.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="about-vmv">
        <RevealStagger className="container about-vmv__grid" stagger={0.12}>
          <RevealItem>
          <article className="vmv-card">
            <span className="vmv-card__icon">
              <FontAwesomeIcon icon={faBullseye} />
            </span>
            <h3>Our Mission</h3>
            <p>
              To give businesses trusted remote capability across accounting, finance, HR, advisory, and creative work—so they can operate with confidence, stay compliant, and grow sustainably.
            </p>
          </article>
          </RevealItem>

          <RevealItem>
          <article className="vmv-card">
            <span className="vmv-card__icon">
              <FontAwesomeIcon icon={faLightbulb} />
            </span>
            <h3>Our Vision</h3>
            <p>
              To be the partner leaders turn to when they want to reduce operational drag, unlock efficiency, and scale through integrated remote expertise.
            </p>
          </article>
          </RevealItem>

          <RevealItem>
          <article className="vmv-card vmv-card--values">
            <span className="vmv-card__icon">
              <FontAwesomeIcon icon={faGem} />
            </span>
            <h3>What We Stand For</h3>
            <ul>
              {values.map((value) => (
                <li key={value}>
                  <FontAwesomeIcon icon={faCheck} className="vmv-card__check" />
                  {value}
                </li>
              ))}
            </ul>
          </article>
          </RevealItem>
        </RevealStagger>
      </section>

      <section className="about-why" id="why-aviora">
        <div className="container">
          <Reveal className="about-why__header">
            <h2 className="about-why__title">
              Why Teams Choose <span className="accent">Aviora</span>
            </h2>
            <p className="about-why__intro">
              Companies partner with us when they want capable remote teams, cleaner operations, and room to focus on what drives revenue.
            </p>
          </Reveal>

          <RevealStagger className="about-why__grid" stagger={0.06}>
            {benefits.map((item) => (
              <RevealItem key={item.title}>
              <article
                className="benefit-card"
                id={item.title.includes('Cost') || item.title.includes('Leaner') ? 'cost-reduction' : undefined}
              >
                <span className="benefit-card__icon">
                  <FontAwesomeIcon icon={item.icon} />
                </span>
                <div className="benefit-card__body">
                  <h4>{item.title}</h4>
                  <p>{item.text}</p>
                  {item.bullets.length > 0 && (
                    <ul>
                      {item.bullets.map((bullet) => (
                        <li key={bullet}>
                          <FontAwesomeIcon icon={faCheck} className="benefit-card__check" />
                          {bullet}
                        </li>
                      ))}
                    </ul>
                  )}
                  {item.footer && <p className="benefit-card__footer">{item.footer}</p>}
                </div>
              </article>
              </RevealItem>
            ))}
          </RevealStagger>
        </div>
      </section>
    </div>
  )
}

export default About
