import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import { ChevronRight, Pin, PinOff, Home, Zap, Rocket, Shield, Star } from 'lucide-react'
import { Button } from './ui/button'

interface NavigationItem {
  id: string
  label: string
  icon: React.ReactNode
  href: string
}

const navigationItems: NavigationItem[] = [
  { id: 'homepage', label: 'Home', icon: <Home size={16} />, href: '#homepage' },
  { id: 'fast-track', label: 'Fast-Track AI', icon: <Zap size={16} />, href: '#fast-track' },
  {
    id: 'accelerated-innovation',
    label: 'Accelerated Innovation',
    icon: <Rocket size={16} />,
    href: '#accelerated-innovation'
  },
  {
    id: 'trusted-acceleration',
    label: 'Trusted Acceleration',
    icon: <Shield size={16} />,
    href: '#trusted-acceleration'
  },
  { id: 'why-seneca', label: 'Why Seneca', icon: <Star size={16} />, href: '#why-seneca' }
]

export function FloatingNavigation() {
  const [isExpanded, setIsExpanded] = useState(false)
  const [isPinned, setIsPinned] = useState(false)
  const [activeSection, setActiveSection] = useState('homepage')

  // Track active section based on scroll position
  useEffect(() => {
    const observerOptions = {
      root: null,
      rootMargin: '-20% 0px -70% 0px',
      threshold: 0.1
    }

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          setActiveSection(entry.target.id)
        }
      })
    }, observerOptions)

    navigationItems.forEach(({ id }) => {
      const element = document.getElementById(id)
      if (element) {
        observer.observe(element)
      }
    })

    return () => observer.disconnect()
  }, [])

  const handleNavClick = (href: string) => {
    const element = document.querySelector(href)
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
    if (!isPinned) {
      setIsExpanded(false)
    }
  }

  const togglePin = () => {
    setIsPinned(!isPinned)
    if (!isPinned) {
      setIsExpanded(true)
    }
  }

  return (
    <motion.div
      className="fixed right-6 top-1/2 z-40 -translate-y-1/2"
      initial={{ opacity: 0, x: 100 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 1 }}
    >
      <div
        className="relative"
        onMouseEnter={() => !isPinned && setIsExpanded(true)}
        onMouseLeave={() => !isPinned && setIsExpanded(false)}
      >
        {/* Main Navigation Container */}
        <motion.div
          className="bg-background/95 border-border overflow-hidden rounded-2xl border shadow-lg backdrop-blur-md"
          animate={{
            width: isExpanded ? '280px' : '60px'
          }}
          transition={{ duration: 0.3, ease: 'easeInOut' }}
        >
          {/* Pin/Unpin Button */}
          <div className="border-border/50 flex items-center justify-between border-b p-3">
            <AnimatePresence>
              {isExpanded && (
                <motion.span
                  className="text-foreground text-sm font-medium"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.2 }}
                >
                  Navigation
                </motion.span>
              )}
            </AnimatePresence>
            <Button
              variant="ghost"
              size="sm"
              onClick={togglePin}
              className="hover:bg-primary/10 h-8 w-8 p-0"
            >
              {isPinned ? (
                <PinOff size={14} className="text-primary" />
              ) : (
                <Pin size={14} className="text-muted-foreground" />
              )}
            </Button>
          </div>

          {/* Navigation Items */}
          <div className="p-2">
            {navigationItems.map((item, index) => (
              <motion.button
                key={item.id}
                onClick={() => handleNavClick(item.href)}
                className={`group mb-1 flex w-full cursor-pointer items-center rounded-xl p-3 transition-all duration-200 ${
                  activeSection === item.id
                    ? 'text-primary border-primary/20 border bg-gradient-to-r from-orange-500/10 to-pink-500/10'
                    : 'hover:bg-muted text-muted-foreground hover:text-foreground'
                }`}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3, delay: index * 0.1 }}
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center">
                  {item.icon}
                </div>

                <AnimatePresence>
                  {isExpanded && (
                    <motion.div
                      className="ml-3 flex w-full items-center justify-between"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      transition={{ duration: 0.2 }}
                    >
                      <span className="truncate text-sm font-medium">{item.label}</span>
                      <ChevronRight
                        size={12}
                        className={`ml-2 transition-transform duration-200 ${
                          activeSection === item.id
                            ? 'text-primary'
                            : 'text-muted-foreground group-hover:text-foreground'
                        }`}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Active indicator dot for collapsed state */}
                {!isExpanded && activeSection === item.id && (
                  <motion.div
                    className="absolute right-1 h-2 w-2 rounded-full bg-gradient-to-r from-orange-500 to-pink-500"
                    layoutId="activeIndicator"
                    transition={{ duration: 0.3 }}
                  />
                )}
              </motion.button>
            ))}
          </div>
        </motion.div>

        {/* Floating indicator when collapsed */}
        <AnimatePresence>
          {!isExpanded && (
            <motion.div
              className="absolute -left-3 top-1/2 h-8 w-1 -translate-y-1/2 rounded-full bg-gradient-to-b from-orange-500 to-pink-500 shadow-md"
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              transition={{ duration: 0.2 }}
            />
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
