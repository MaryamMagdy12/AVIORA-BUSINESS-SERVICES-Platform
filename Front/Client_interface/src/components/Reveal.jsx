import { motion } from 'framer-motion'

const ease = [0.22, 1, 0.36, 1]

function Reveal({
  children,
  delay = 0,
  y = 28,
  x = 0,
  immediate = false,
  className,
  style,
  amount = 0.15,
}) {
  const offset = { opacity: 0, y, x }

  return (
    <motion.div
      className={className}
      style={style}
      initial={offset}
      {...(immediate
        ? { animate: { opacity: 1, y: 0, x: 0 } }
        : {
            whileInView: { opacity: 1, y: 0, x: 0 },
            viewport: { once: true, amount },
          })}
      transition={{ duration: 0.65, ease, delay }}
    >
      {children}
    </motion.div>
  )
}

export function RevealStagger({
  children,
  className,
  style,
  stagger = 0.08,
  delayChildren = 0.05,
  amount = 0.12,
}) {
  return (
    <motion.div
      className={className}
      style={style}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount }}
      variants={{
        hidden: {},
        visible: {
          transition: {
            staggerChildren: stagger,
            delayChildren,
          },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export function RevealItem({
  children,
  className,
  style,
  y = 24,
  x = 0,
}) {
  return (
    <motion.div
      className={className}
      style={style}
      variants={{
        hidden: { opacity: 0, y, x },
        visible: {
          opacity: 1,
          y: 0,
          x: 0,
          transition: { duration: 0.55, ease },
        },
      }}
    >
      {children}
    </motion.div>
  )
}

export default Reveal
