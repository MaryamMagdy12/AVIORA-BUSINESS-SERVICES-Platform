import {
  bgAccounting,
  bgFinancing,
  bgHrServices,
  bgCreativeDigital,
  bgManagedTeams,
  illustrationChecklist,
  iconCoins,
} from '../assets/media'
import {
  faCalculator,
  faDollarSign,
  faUsers,
  faPenNib,
  faDisplay,
} from '@fortawesome/free-solid-svg-icons'

const serviceMatchers = [
  {
    keys: ['accounting', 'financial'],
    icon: faCalculator,
    bg: bgAccounting,
    cartIcon: iconCoins,
    cartPosition: 'right center',
  },
  {
    keys: ['financing', 'finance', 'business support'],
    icon: faDollarSign,
    bg: bgFinancing,
    cartIcon: iconCoins,
    cartPosition: 'right center',
  },
  {
    keys: ['hr', 'organizational', 'human'],
    icon: faUsers,
    bg: bgHrServices,
    cartPosition: 'center',
  },
  {
    keys: ['creative', 'digital'],
    icon: faPenNib,
    bg: bgCreativeDigital,
    cartPosition: 'right center',
  },
  {
    keys: ['remote', 'managed', 'team'],
    icon: faDisplay,
    bg: bgManagedTeams,
    cartPosition: 'right center',
  },
]

const defaultMeta = {
  icon: faCalculator,
  bg: bgAccounting,
  cartPosition: 'center',
}

export function getServiceMeta(name = '') {
  const key = name.toLowerCase()
  const match = serviceMatchers.find((item) =>
    item.keys.some((token) => key.includes(token))
  )
  return match ?? defaultMeta
}

export const iconAppointment = illustrationChecklist
