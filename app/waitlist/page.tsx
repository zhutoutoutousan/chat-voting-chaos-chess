export default function WaitlistPage() {
  return (
    <main className="min-h-screen relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 animate-gradient bg-[linear-gradient(-45deg,#ee7752,#e73c7e,#23a6d5,#23d5ab)]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(0,0,0,0),rgba(0,0,0,0.6))]" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,rgba(0,0,0,0),rgba(0,0,0,0.6))]" />
      </div>

      <div className="relative container mx-auto px-4 py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-5xl font-bold text-white mb-6">
            Join the Chaos Chess Revolution
          </h1>
          <p className="text-xl text-gray-200 mb-8">
            Be among the first to experience the most unpredictable and exciting version of chess ever created. Sign up now to get early access and exclusive benefits.
          </p>
          <div className="space-y-6 text-gray-300 mb-12">
            <p>🎮 Early access to all chaos effects</p>
            <p>🏆 Exclusive tournaments and events</p>
            <p>🎁 Special rewards for early adopters</p>
            <p>🔔 Be the first to know when we launch</p>
          </div>
          
          {/* LaunchList Widget */}
          <form className="launchlist-form space-y-4 max-w-md mx-auto bg-black/30 p-6 rounded-xl backdrop-blur-sm" action="https://getlaunchlist.com/s/tHVmwP" method="POST">
            <div className="space-y-2">
              <input 
                name="name" 
                type="text" 
                placeholder="Your Name"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
            </div>
            <div className="space-y-2">
              <input 
                name="email" 
                type="email" 
                placeholder="Your Email"
                className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder:text-white/50 focus:outline-none focus:ring-2 focus:ring-white/30 transition-all"
              />
            </div>
            <button 
              type="submit"
              className="w-full px-6 py-3 bg-white text-black font-semibold rounded-lg hover:bg-white/90 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Join the Waitlist
            </button>
          </form>
        </div>
      </div>
    </main>
  )
} 