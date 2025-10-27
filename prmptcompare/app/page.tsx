'use client';

import Link from 'next/link';
import { Inter, Poppins, Space_Grotesk } from 'next/font/google';

const inter = Inter({ 
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
});

const poppins = Poppins({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-poppins',
  display: 'swap',
});

const spaceGrotesk = Space_Grotesk({ 
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

export default function LandingPage() {
  return (
    <div className={`min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-indigo-900 relative overflow-hidden ${inter.variable} ${poppins.variable} ${spaceGrotesk.variable}`}>
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Bitcount+Grid+Single:wght@100..900&display=swap');
        @import url('https://fonts.googleapis.com/css2?family=Bricolage+Grotesque:wght@200..800&display=swap');
        
        .bitcount-grid-single-light {
          font-family: "Bitcount Grid Single", system-ui;
          font-optical-sizing: auto;
          font-weight: 100;
          font-style: normal;
          font-variation-settings:
            "slnt" 0,
            "CRSV" 0.5,
            "ELSH" 0,
            "ELXP" 0;
        }
        
        .bitcount-grid-single-normal {
          font-family: "Bitcount Grid Single", system-ui;
          font-optical-sizing: auto;
          font-weight: 100;
          font-style: normal;
          font-variation-settings:
            "slnt" 0,
            "CRSV" 0.5,
            "ELSH" 0,
            "ELXP" 0;
        }
        
        .bitcount-grid-single-medium {
          font-family: "Bitcount Grid Single", system-ui;
          font-optical-sizing: auto;
          font-weight: 500;
          font-style: normal;
          font-variation-settings:
            "slnt" 0,
            "CRSV" 0.5,
            "ELSH" 0,
            "ELXP" 0;
        }
        
        .bitcount-grid-single-semibold {
          font-family: "Bitcount Grid Single", system-ui;
          font-optical-sizing: auto;
          font-weight: 600;
          font-style: normal;
          font-variation-settings:
            "slnt" 0,
            "CRSV" 0.5,
            "ELSH" 0,
            "ELXP" 0;
        }
        
        .bitcount-grid-single-bold {
          font-family: "Bitcount Grid Single", system-ui;
          font-optical-sizing: auto;
          font-weight: 700;
          font-style: normal;
          font-variation-settings:
            "slnt" 0,
            "CRSV" 0.5,
            "ELSH" 0,
            "ELXP" 0;
        }
        
        .bitcount-grid-single-extrabold {
          font-family: "Bitcount Grid Single", system-ui;
          font-optical-sizing: auto;
          font-weight: 800;
          font-style: normal;
          font-variation-settings:
            "slnt" 0,
            "CRSV" 0.5,
            "ELSH" 0,
            "ELXP" 0;
        }
        
        .bitcount-grid-single-black {
          font-family: "Bitcount Grid Single", system-ui;
          font-optical-sizing: auto;
          font-weight: 900;
          font-style: normal;
          font-variation-settings:
            "slnt" 0,
            "CRSV" 0.5,
            "ELSH" 0,
            "ELXP" 0;
        }
        
        .bricolage-grotesque-medium {
          font-family: "Bricolage Grotesque", sans-serif;
          font-optical-sizing: auto;
          font-weight: 500;
          font-style: normal;
          font-variation-settings:
            "wdth" 100;
        }
        
        .bricolage-grotesque-semibold {
          font-family: "Bricolage Grotesque", sans-serif;
          font-optical-sizing: auto;
          font-weight: 600;
          font-style: normal;
          font-variation-settings:
            "wdth" 100;
        }
        
        .bricolage-grotesque-bold {
          font-family: "Bricolage Grotesque", sans-serif;
          font-optical-sizing: auto;
          font-weight: 700;
          font-style: normal;
          font-variation-settings:
            "wdth" 100;
        }
        
        .bricolage-grotesque-extrabold {
          font-family: "Bricolage Grotesque", sans-serif;
          font-optical-sizing: auto;
          font-weight: 800;
          font-style: normal;
          font-variation-settings:
            "wdth" 100;
        }
      `}</style>
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-20 left-10 w-32 h-32 bg-blue-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-40 right-20 w-24 h-24 bg-purple-500/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-40 left-1/4 w-40 h-40 bg-indigo-500/10 rounded-full blur-xl"></div>
        <div className="absolute top-1/2 right-1/3 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-6 py-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center shadow-lg">
              <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
              </svg>
            </div>
            <span className="text-white text-2xl font-bold tracking-tight bitcount-grid-single-bold">PromptCompare</span>
          </div>
          
          <nav className="hidden md:flex items-center space-x-8">
            <a href="#features" className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide bricolage-grotesque-medium">Features</a>
            <Link href="/history" className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide bricolage-grotesque-medium">History</Link>
            <a href="#pricing" className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide bricolage-grotesque-medium">Pricing</a>
            <a href="#about" className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide bricolage-grotesque-medium">About</a>
            <a href="#help" className="text-white/80 hover:text-white transition-colors font-medium text-sm tracking-wide bricolage-grotesque-medium">Help</a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <button className="text-white/80 hover:text-white transition-colors font-medium text-sm bricolage-grotesque-medium">Log in</button>
            <Link 
              href="/test"
              className="bg-white text-slate-900 px-6 py-3 rounded-full font-semibold text-sm hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl bricolage-grotesque-semibold"
            >
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-6 py-20">
        <div className="max-w-7xl mx-auto">

          {/* Main Headline */}
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-7xl lg:text-8xl font-light text-white mb-6 leading-tight tracking-tight bitcount-grid-single-medium">
              Your Haven for
              <br />
              <span className="bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                Seamless AI Testing
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-white/80 max-w-4xl mx-auto leading-relaxed font-medium tracking-wide bricolage-grotesque-medium">
              Empowering you with intelligent, effortless tools to compare prompts, optimize AI performance, and achieve better results—seamlessly.
            </p>
          </div>

          {/* Floating Cards Section */}
          <div className="relative mb-16">
            <div className="flex justify-center items-center space-x-8 mb-8">
              {/* Left Card - Prompt Input */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transform -rotate-3 hover:rotate-0 transition-transform duration-300 max-w-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg bitcount-grid-single-bold">Prompt A</h3>
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                </div>
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <p className="text-sm text-gray-600 font-mono font-inter leading-relaxed">
                    "Write a professional email about {`{{topic}}`}..."
                  </p>
                </div>
                <button className="w-full bg-gray-900 text-white py-3 rounded-lg text-sm font-poppins font-semibold hover:bg-gray-800 transition-all duration-200">
                  Add Prompt
                    </button>
              </div>

              {/* Center Card - Comparison Results */}
              <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl p-6 shadow-2xl transform rotate-2 hover:rotate-0 transition-transform duration-300 max-w-sm">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <div className="w-6 h-6 bg-white/20 rounded flex items-center justify-center">
                      <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M13 7h8v2h-8zm0 4h8v2h-8zm0 4h8v2h-8zM3 17h6v2H3zm0-4h6v2H3zm0-4h6v2H3z"/>
                      </svg>
                    </div>
                    <span className="text-white text-sm font-poppins font-semibold">Results</span>
                  </div>
                  <span className="text-white/80 text-xs font-inter font-medium">2.3s</span>
                </div>
                <div className="space-y-3">
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white text-sm font-poppins font-semibold">Prompt A</span>
                      <span className="text-white/80 text-xs font-inter font-bold">95%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1">
                      <div className="bg-white h-1 rounded-full" style={{width: '95%'}}></div>
                    </div>
                  </div>
                  <div className="bg-white/20 rounded-lg p-3">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-white text-sm font-poppins font-semibold">Prompt B</span>
                      <span className="text-white/80 text-xs font-inter font-bold">87%</span>
                    </div>
                    <div className="w-full bg-white/20 rounded-full h-1">
                      <div className="bg-white h-1 rounded-full" style={{width: '87%'}}></div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Card - Variables */}
              <div className="bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-2xl transform rotate-3 hover:rotate-0 transition-transform duration-300 max-w-sm">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 text-lg bitcount-grid-single-bold">Variables</h3>
                  <span className="text-blue-600 text-sm font-inter font-semibold">3 active</span>
                </div>
                <div className="space-y-2 mb-4">
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <span className="text-sm text-gray-600 font-inter font-medium">topic</span>
                    <span className="text-xs text-gray-500 font-inter">"Project Update"</span>
                  </div>
                  <div className="flex items-center justify-between bg-gray-50 rounded-lg p-2">
                    <span className="text-sm text-gray-600 font-inter font-medium">tone</span>
                    <span className="text-xs text-gray-500 font-inter">"Professional"</span>
                  </div>
                </div>
                <button className="w-full bg-blue-600 text-white py-3 rounded-lg text-sm font-poppins font-semibold hover:bg-blue-700 transition-all duration-200">
                  Check Results
            </button>
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="text-center mb-16">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <Link 
                href="/test"
                className="bg-white text-slate-900 px-8 py-4 rounded-full text-lg font-poppins font-bold hover:bg-white/90 transition-all duration-200 shadow-xl hover:shadow-2xl"
              >
                Start Testing Now
              </Link>
              <button className="flex items-center justify-center w-12 h-12 bg-white/20 backdrop-blur-sm rounded-full hover:bg-white/30 transition-colors">
                <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M8 5v14l11-7z"/>
                </svg>
              </button>
            </div>
            <p className="text-white/60 mt-4 text-sm font-medium tracking-wide bricolage-grotesque-medium">
              Everything related to AI prompt optimization stored in one place. Never miss a detail.
            </p>
          </div>

          {/* Integration Icons */}
          <div className="flex justify-center items-center space-x-8 mb-20">
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="w-6 h-6 bg-orange-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold font-poppins">O</span>
              </div>
              <span className="text-white text-sm font-inter font-semibold">OpenAI</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="w-6 h-6 bg-blue-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold font-poppins">A</span>
              </div>
              <span className="text-white text-sm font-inter font-semibold">Anthropic</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="w-6 h-6 bg-green-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold font-poppins">G</span>
              </div>
              <span className="text-white text-sm font-inter font-semibold">Google</span>
                    </div>
            <div className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2">
              <div className="w-6 h-6 bg-purple-500 rounded flex items-center justify-center">
                <span className="text-white text-xs font-bold font-poppins">M</span>
                </div>
              <span className="text-white text-sm font-inter font-semibold">Microsoft</span>
            </div>
          </div>
        </div>
      </main>

      {/* Features Section */}
      <section id="features" className="relative z-10 py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-20">
            <h2 className="text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-8 tracking-tight bitcount-grid-single-medium">
              We pick the networks we <span className="text-lime-500">support</span> meticulously
            </h2>
            <p className="text-xl md:text-2xl text-gray-600 max-w-4xl mx-auto font-inter font-normal leading-relaxed tracking-wide">
              Jump in early and know them inside-out
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Card 1 - Black Background */}
            <div className="bg-gray-900 text-white p-10 rounded-2xl flex flex-col items-center justify-center aspect-square text-center">
              <p className="text-5xl font-medium leading-relaxed bricolage-grotesque-semibold">
                Compare multiple AI prompts side-by-side with real-time performance metrics
              </p>
              <div className="flex justify-center mt-8">
                <div className="w-16 h-16 bg-lime-500 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                </div>
              </div>
            </div>
            
            {/* Card 2 - Lime Green Background */}
            <div className="bg-lime-500 text-gray-900 p-10 rounded-2xl flex flex-col items-center justify-center aspect-square text-center">
              <p className="text-5xl font-medium leading-relaxed bricolage-grotesque-semibold">
                Test prompts with dynamic variables and see instant results across different AI models
              </p>
              <div className="flex justify-center mt-8">
                <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M3 3h18v18H3V3zm2 2v14h14V5H5zm2 2h10v2H7V7zm0 4h10v2H7v-2zm0 4h7v2H7v-2z"/>
                  </svg>
                </div>
              </div>
              </div>

            {/* Card 3 - Light Gray Background */}
            <div className="bg-gray-100 text-gray-900 p-10 rounded-2xl flex flex-col items-center justify-center aspect-square text-center">
              <p className="text-5xl font-medium leading-relaxed bricolage-grotesque-semibold">
                Optimize your AI applications with data-driven insights and performance analytics
              </p>
              <div className="flex justify-center mt-8">
                <div className="w-16 h-16 bg-gray-900 rounded-lg flex items-center justify-center">
                  <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M9.4 16.6L4.8 12l4.6-4.6L8 6l-6 6 6 6 1.4-1.4zm5.2 0L19.2 12l-4.6-4.6L16 6l6 6-6 6-1.4-1.4z"/>
                  </svg>
                </div>
              </div>
                    </div>
                    
            {/* Card 4 - Text Block */}
            <div className="flex items-center justify-center p-10 aspect-square text-center">
              <p className="text-5xl md:text-6xl font-medium leading-relaxed bricolage-grotesque-bold">
                Ready to find the <span className="text-lime-500 font-semibold">perfect prompt?</span>
              </p>
            </div>
                    </div>
                  </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 bg-black/20 backdrop-blur-sm py-12">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center">
            <div className="flex items-center justify-center mb-6">
              <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center mr-3 shadow-lg">
                <svg className="w-6 h-6 text-gray-900" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
              </div>
              <span className="text-2xl font-bold text-white tracking-tight bitcount-grid-single-bold">PromptCompare</span>
            </div>
            <p className="text-white/60 mb-6 font-inter font-medium tracking-wide">
              Optimize your AI prompts with data-driven insights
            </p>
            <div className="flex justify-center space-x-8 mb-6">
              <a href="#" className="text-white/60 hover:text-white transition-colors font-inter font-medium text-sm tracking-wide">Privacy</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors font-inter font-medium text-sm tracking-wide">Terms</a>
              <a href="#" className="text-white/60 hover:text-white transition-colors font-inter font-medium text-sm tracking-wide">Support</a>
            </div>
            <p className="text-sm text-white/40 font-inter font-normal tracking-wide">
              © 2024 PromptCompare. Built for AI prompt optimization.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}