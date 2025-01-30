export function ConstructionNotice() {
  return (
    <div className="text-center py-16 border-t border-neutral-800">
      <h2 className="text-4xl md:text-5xl font-bold text-white dark:text-neutral-100 mb-4 tracking-tight">
        🚧 Under Construction 🚧
      </h2>
      <p className="text-xl text-neutral-200 dark:text-neutral-300 mb-8 max-w-2xl mx-auto">
        We're working hard to bring you the best chess experience. Join our waitlist to be notified when we launch!
      </p>
      <a 
        href="/waitlist"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white font-medium text-lg transition-all duration-200 hover:scale-105 shadow-lg hover:shadow-xl"
      >
        Join the Waitlist
        <svg 
          className="w-5 h-5" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M13 7l5 5m0 0l-5 5m5-5H6" 
          />
        </svg>
      </a>
    </div>
  )
} 