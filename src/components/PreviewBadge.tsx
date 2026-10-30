import { AnimatePresence, motion } from 'motion/react'
import { X } from 'lucide-react'
import { useState } from 'react'

/** Marks the build as a preview. Remove once the contact details in content.ts are real. */
export function PreviewBadge() {
  const [show, setShow] = useState(true)
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="note"
          className="fixed right-4 bottom-4 z-[60] flex items-center gap-2 rounded-full bg-deep/90 py-1.5 pr-1.5 pl-4 text-xs text-on-deep shadow-lg ring-1 ring-on-deep/10 backdrop-blur-md"
          initial={{ y: 40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 40, opacity: 0 }}
          transition={{ delay: 2, duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-soft" aria-hidden />
          <span className="sm:hidden">Preview · placeholder email</span>
          <span className="max-sm:hidden">Preview build · contact email and some social links are placeholders</span>
          <button
            type="button"
            aria-label="Dismiss"
            onClick={() => setShow(false)}
            className="grid h-6 w-6 place-items-center rounded-full hover:bg-page/10"
          >
            <X size={12} aria-hidden />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
