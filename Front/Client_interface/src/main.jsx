import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App.jsx';

// 🔽 Font Awesome setup
import { library } from '@fortawesome/fontawesome-svg-core';
import { 
  faUser, 
  faHome, 
  faCartShopping, 
  faCalendarCheck, 
  faRightToBracket,
  faRightFromBracket,
  faScroll,
  faEnvelope,
  faPeopleGroup,
  faPhone,
  faLocationDot,
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
  faBullseye,
  faLightbulb,
  faGem,
  faGears,
  faTrophy,
  faCheck,
} from '@fortawesome/free-solid-svg-icons';
import { faGithub, faFacebook, faTwitter, faInstagram, faLinkedin, faYoutube } from '@fortawesome/free-brands-svg-icons';

library.add(
  faUser, faHome, faCartShopping, faCalendarCheck, faRightToBracket, faRightFromBracket,
  faScroll, faEnvelope, faPeopleGroup, faPhone, faLocationDot,
  faUsers, faShieldHalved, faChartLine, faCoins, faArrowsUpDown, faLock,
  faUserTie, faGlobe, faShield, faChartColumn, faPiggyBank,
  faBullseye, faLightbulb, faGem, faGears, faTrophy, faCheck,
  faGithub, faFacebook, faTwitter, faInstagram, faLinkedin, faYoutube
);

// 🔽 Render app
createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>
);
