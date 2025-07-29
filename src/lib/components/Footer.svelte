<!-- Enhanced Professional Footer -->
<footer class="bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 text-white py-20 relative overflow-hidden">
  
  <!-- Background pattern -->
  <div class="absolute inset-0 opacity-5">
    <div class="absolute top-10 left-10% w-32 h-32 bg-blue-400 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-20 right-10% w-40 h-40 bg-purple-400 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-400 rounded-full blur-3xl opacity-10"></div>
  </div>

  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
      
      <!-- Company Info -->
      <div class="lg:col-span-2">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 via-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-2xl">
            <span class="text-white font-bold text-2xl">AD</span>
          </div>
          <div>
            <h5 class="text-3xl font-bold text-white mb-1">Aurora Dentica</h5>
            <p class="text-slate-300 text-lg">Professional Dental Care Since 2009</p>
          </div>
        </div>
        <p class="text-slate-300 mb-8 leading-relaxed max-w-md text-lg">
          Providing exceptional dental care with modern technology, experienced professionals, 
          and a commitment to your oral health and beautiful smile in Auckland.
        </p>
        
        <!-- Enhanced Professional Certifications -->
        <div class="space-y-4">
          <h6 class="font-semibold text-white text-lg flex items-center gap-2">
            <span class="text-xl">🏆</span>
            <span>Professional Memberships</span>
          </h6>
          <div class="grid grid-cols-2 gap-3">
            {#each [
              { name: 'NZ Dental Council', icon: '🇳🇿' },
              { name: 'NZDA Member', icon: '🦷' },
              { name: 'Continuing Education', icon: '📚' },
              { name: 'Quality Assurance', icon: '✅' }
            ] as cert}
              <div class="flex items-center gap-3 p-3 bg-white/10 backdrop-blur-sm rounded-xl border border-white/20 hover:bg-white/20 transition-all duration-300 group">
                <span class="text-lg group-hover:scale-110 transition-transform duration-300">{cert.icon}</span>
                <span class="text-slate-300 text-sm font-medium">{cert.name}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- Enhanced Services -->
      <div>
        <h6 class="font-bold text-2xl mb-8 text-white flex items-center gap-2">
          <span class="text-2xl">🏥</span>
          <span>Services</span>
        </h6>
        <ul class="space-y-4">
          {#each [
            'General Dentistry',
            'Preventive Care',
            'Cosmetic Dentistry',
            'Emergency Care',
            'Professional Cleaning',
            'Oral Health Assessment'
          ] as service}
            <li>
              <a 
                href="/#services" 
                class="text-slate-300 hover:text-white transition-all duration-300 text-lg hover:translate-x-2 transform inline-flex items-center gap-2 group"
              >
                <span class="w-2 h-2 bg-blue-400 rounded-full group-hover:bg-white transition-colors duration-300"></span>
                <span>{service}</span>
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Enhanced Contact Info -->
      <div>
        <h6 class="font-bold text-2xl mb-8 text-white flex items-center gap-2">
          <span class="text-2xl">📞</span>
          <span>Contact</span>
        </h6>
        <ul class="space-y-6 text-slate-300">
          
          <!-- Location -->
          <li class="group">
            <div class="flex items-start gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div class="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform duration-300">
                <span class="text-white text-lg">📍</span>
              </div>
              <div class="text-lg">
                <div class="text-white font-semibold mb-1">Visit Our Clinic</div>
                <div class="text-slate-300">123 Dental Avenue</div>
                <div class="text-slate-300">Auckland Central, Auckland 1010</div>
                <div class="text-slate-300">New Zealand</div>
              </div>
            </div>
          </li>

          <!-- Phone -->
          <li class="group">
            <div class="flex items-center gap-4 p-4 bg-white/5 rounded-xl hover:bg-white/10 transition-all duration-300">
              <div class="w-10 h-10 bg-gradient-to-r from-green-500 to-emerald-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                <span class="text-white text-lg">📞</span>
              </div>
              <div>
                <a href="tel:+6491234567" class="hover:text-white transition-colors text-lg font-semibold block">
                  (09) 123-4567
                </a>
                <span class="text-sm text-slate-400">General inquiries</span>
              </div>
            </div>
          </li>

          <!-- Emergency -->
          <li class="group">
            <div class="flex items-center gap-4 p-4 bg-red-500/20 rounded-xl border border-red-500/30 hover:bg-red-500/30 transition-all duration-300">
              <div class="w-10 h-10 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center animate-pulse group-hover:scale-110 transition-transform duration-300">
                <span class="text-white text-lg">🚨</span>
              </div>
              <div>
                <div class="text-red-200 text-sm font-medium mb-1">24/7 Emergency</div>
                <a href="tel:+6491234568" class="hover:text-white transition-colors text-lg font-bold block">
                  (09) 123-4568
                </a>
              </div>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Enhanced Bottom Section -->
    <div class="mt-16 pt-8 border-t border-slate-700">
      <div class="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
        
        <!-- Copyright -->
        <div class="text-center lg:text-left">
          <span class="text-slate-400 text-lg">© 2024 Aurora Dentica. All rights reserved.</span>
          <div class="text-sm text-slate-500 mt-2 flex items-center justify-center lg:justify-start gap-2">
            <span class="text-green-400">🟢</span>
            <span>Licensed dental practice in Auckland, New Zealand</span>
          </div>
        </div>

        <!-- Contact & Social -->
        <div class="flex flex-col sm:flex-row items-center space-y-3 sm:space-y-0 sm:space-x-8">
          <a 
            href="mailto:info@auroradentica.co.nz" 
            class="text-slate-400 hover:text-white transition-all duration-300 hover:scale-105 flex items-center gap-2"
          >
            <span class="text-lg">📧</span>
            <span>info@auroradentica.co.nz</span>
          </a>
          
          <!-- Quality Badges -->
          <div class="flex items-center space-x-4">
            <div class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
              <span class="text-green-400">✓</span>
              <span class="text-xs font-semibold text-slate-300">Licensed</span>
            </div>
            <div class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
              <span class="text-blue-400">✓</span>
              <span class="text-xs font-semibold text-slate-300">Insured</span>
            </div>
            <div class="flex items-center gap-2 bg-white/10 px-3 py-1 rounded-full">
              <span class="text-purple-400">✓</span>
              <span class="text-xs font-semibold text-slate-300">Professional</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Trust Indicators -->
      <div class="mt-8 pt-6 border-t border-slate-700/50">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div class="p-4 bg-white/5 rounded-xl border border-white/10">
            <div class="text-2xl mb-2">🏆</div>
            <div class="text-white font-bold">15+</div>
            <div class="text-slate-400 text-sm">Years Experience</div>
          </div>
          <div class="p-4 bg-white/5 rounded-xl border border-white/10">
            <div class="text-2xl mb-2">👥</div>
            <div class="text-white font-bold">2,500+</div>
            <div class="text-slate-400 text-sm">Patients Served</div>
          </div>
          <div class="p-4 bg-white/5 rounded-xl border border-white/10">
            <div class="text-2xl mb-2">⭐</div>
            <div class="text-white font-bold">98%</div>
            <div class="text-slate-400 text-sm">Satisfaction Rate</div>
          </div>
          <div class="p-4 bg-white/5 rounded-xl border border-white/10">
            <div class="text-2xl mb-2">🩺</div>
            <div class="text-white font-bold">24/7</div>
            <div class="text-slate-400 text-sm">Emergency Support</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</footer>

<style>
  /* Enhanced hover effects */
  footer a:hover {
    transform: translateX(4px);
  }

  /* Smooth animations */
  footer div, footer a {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Focus states */
  footer a:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 0.5rem;
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    footer {
      padding-top: 3rem;
      padding-bottom: 2rem;
    }
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      transition-duration: 0.01ms !important;
    }
    
    .animate-pulse {
      animation: none;
    }
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    footer {
      background: #000 !important;
      color: #fff !important;
    }
    
    footer div {
      border: 1px solid #fff;
    }
  }
</style>