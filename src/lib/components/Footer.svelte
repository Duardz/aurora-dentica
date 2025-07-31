<!-- COMPLETELY REDESIGNED Professional Footer -->
<footer class="relative bg-gradient-to-br from-stone-900 via-stone-800 to-amber-900 text-white overflow-hidden">
  
  <!-- Enhanced Background Elements -->
  <div class="absolute inset-0">
    <!-- Subtle gradient overlays -->
    <div class="absolute inset-0 bg-gradient-to-r from-stone-900/90 to-amber-900/90"></div>
    
    <!-- Animated background elements -->
    <div class="absolute top-10 left-10 w-32 h-32 bg-gradient-to-r from-amber-500/10 to-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-20 right-20 w-40 h-40 bg-gradient-to-r from-orange-500/10 to-red-500/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-r from-amber-400/5 to-orange-400/5 rounded-full blur-3xl"></div>
    
    <!-- Decorative grid pattern -->
    <div class="absolute inset-0 opacity-5">
      <div class="absolute inset-0 bg-[radial-gradient(circle_at_2px_2px,_#f59e0b_2px,_transparent_0)] bg-[length:60px_60px]"></div>
    </div>
  </div>

  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 z-10">
    
    <!-- TOP SECTION: Company Info & Quick Actions -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12 lg:gap-16 mb-16">
      
      <!-- ENHANCED Company Information -->
      <div class="lg:col-span-2 space-y-8">
        <!-- Logo and Brand -->
        <div class="flex flex-col sm:flex-row sm:items-center gap-6">
          <div class="flex items-center gap-4">
            <div class="w-20 h-20 bg-gradient-to-br from-amber-500 via-orange-500 to-red-500 rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white/20 group hover:scale-110 transition-all duration-500">
              <span class="text-white font-bold text-3xl tracking-tight">AD</span>
            </div>
            <div>
              <h3 class="text-3xl lg:text-4xl font-bold text-white mb-2 bg-gradient-to-r from-white to-amber-100 bg-clip-text text-transparent">
                Aurora Dentica
              </h3>
              <div class="flex items-center gap-2">
                <div class="w-3 h-3 bg-emerald-400 rounded-full animate-pulse"></div>
                <p class="text-amber-200 text-lg font-semibold">Professional Dental Care Since 2009</p>
              </div>
            </div>
          </div>
        </div>
        
        <!-- Mission Statement -->
        <div class="bg-white/10 backdrop-blur-sm rounded-3xl p-6 lg:p-8 border border-white/20 hover:bg-white/15 transition-all duration-300">
          <p class="text-stone-200 text-lg lg:text-xl leading-relaxed mb-4">
            Providing exceptional dental care with modern technology, experienced professionals, 
            and a commitment to your oral health and beautiful smile in <span class="text-amber-300 font-semibold">Dingalan, Aurora, Philippines</span>.
          </p>
          
          <!-- Trust indicators -->
          <div class="flex flex-wrap gap-3">
            <div class="inline-flex items-center gap-2 bg-emerald-500/20 px-3 py-1 rounded-full border border-emerald-400/30">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <span class="text-emerald-300 text-sm font-semibold">Licensed & Certified</span>
            </div>
            <div class="inline-flex items-center gap-2 bg-amber-500/20 px-3 py-1 rounded-full border border-amber-400/30">
              <svg class="w-4 h-4 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              <span class="text-amber-300 text-sm font-semibold">15+ Years Experience</span>
            </div>
            <div class="inline-flex items-center gap-2 bg-orange-500/20 px-3 py-1 rounded-full border border-orange-400/30">
              <svg class="w-4 h-4 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/>
              </svg>
              <span class="text-orange-300 text-sm font-semibold">24/7 Emergency</span>
            </div>
          </div>
        </div>

        <!-- Professional Credentials Enhanced -->
        <div>
          <h4 class="text-xl font-bold text-white mb-4 flex items-center gap-2">
            <span class="text-2xl">🏆</span>
            <span>Professional Memberships & Certifications</span>
          </h4>
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {#each [
              { name: 'Philippines Dental Board', icon: '🇵🇭', status: 'Registered' },
              { name: 'NZDA Member', icon: '🦷', status: 'Active' },
              { name: 'Continuing Education', icon: '📚', status: 'Current' },
              { name: 'Quality Assurance', icon: '✅', status: 'Certified' }
            ] as credential}
              <div class="group bg-white/10 hover:bg-white/20 backdrop-blur-sm rounded-2xl p-4 border border-white/20 hover:border-amber-400/50 transition-all duration-300 text-center">
                <div class="text-2xl mb-2 group-hover:scale-110 transition-transform duration-300">{credential.icon}</div>
                <div class="text-stone-300 text-sm font-medium mb-1">{credential.name}</div>
                <div class="text-emerald-400 text-xs font-bold bg-emerald-500/20 px-2 py-1 rounded-full">{credential.status}</div>
              </div>
            {/each}
          </div>
        </div>
      </div>

      <!-- ENHANCED Quick Contact & Emergency -->
      <div class="space-y-6">
        <div class="bg-gradient-to-br from-amber-600/20 to-orange-600/20 backdrop-blur-sm rounded-3xl p-6 lg:p-8 border-2 border-amber-400/30 shadow-2xl">
          <h4 class="text-2xl font-bold text-white mb-6 flex items-center gap-3">
            <span class="text-3xl">📞</span>
            <span>Contact Us</span>
          </h4>
          
          <!-- Main Contact -->
          <div class="space-y-4 mb-6">
            <div class="group bg-white/10 hover:bg-white/20 rounded-2xl p-4 border border-white/20 hover:border-blue-400/50 transition-all duration-300">
              <div class="flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-xl flex items-center justify-center group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
                  </svg>
                </div>
                <div>
                  <div class="text-blue-200 text-sm font-medium">General Appointments</div>
                  <a href="tel:+6391234567" class="text-xl font-bold text-white hover:text-blue-300 transition-colors">
                    (042) 123-4567
                  </a>
                </div>
              </div>
            </div>

            <!-- Emergency Contact - Highlighted -->
            <div class="group bg-gradient-to-r from-red-500/20 to-orange-500/20 rounded-2xl p-4 border-2 border-red-400/50 hover:border-red-300 transition-all duration-300 relative overflow-hidden">
              <div class="absolute inset-0 bg-gradient-to-r from-red-500/10 to-orange-500/10 group-hover:from-red-500/20 group-hover:to-orange-500/20 transition-all duration-300"></div>
              <div class="relative flex items-center gap-4">
                <div class="w-12 h-12 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl flex items-center justify-center animate-pulse group-hover:scale-110 transition-transform duration-300 shadow-lg">
                  <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"/>
                  </svg>
                </div>
                <div>
                  <div class="text-red-200 text-sm font-bold flex items-center gap-1">
                    <span class="w-2 h-2 bg-red-400 rounded-full animate-ping"></span>
                    24/7 Emergency Hotline
                  </div>
                  <a href="tel:+6391234568" class="text-xl font-bold text-white hover:text-red-200 transition-colors">
                    (042) 123-4568
                  </a>
                </div>
              </div>
            </div>
          </div>

          <!-- Location -->
          <div class="bg-white/10 rounded-2xl p-4 border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div class="flex items-start gap-4">
              <div class="w-12 h-12 bg-gradient-to-r from-emerald-500 to-green-500 rounded-xl flex items-center justify-center flex-shrink-0 shadow-lg">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
              </div>
              <div>
                <div class="text-emerald-200 text-sm font-medium mb-1">Visit Our Clinic</div>
                <div class="text-white font-semibold">123 Dental Avenue</div>
                <div class="text-stone-300">Dingalan, Aurora 3205</div>
                <div class="text-stone-300">Philippines</div>
                <a 
                  href="https://maps.google.com/?q=123+Dental+Avenue+Dingalan+Aurora+Philippines" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  class="inline-flex items-center gap-1 text-emerald-400 hover:text-emerald-300 transition-colors text-sm font-medium mt-2"
                >
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
                  </svg>
                  <span>View on Google Maps</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- MIDDLE SECTION: Services & Information -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
      
      <!-- Services -->
      <div>
        <h4 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span class="text-2xl">🏥</span>
          <span>Our Services</span>
        </h4>
        <ul class="space-y-3">
          {#each [
            { name: 'General Dentistry', icon: '🦷' },
            { name: 'Preventive Care', icon: '🛡️' },
            { name: 'Cosmetic Dentistry', icon: '✨' },
            { name: 'Emergency Care', icon: '🚨' },
            { name: 'Professional Cleaning', icon: '🧽' },
            { name: 'Oral Health Assessment', icon: '📋' }
          ] as service}
            <li>
              <a 
                href="/#services" 
                class="group flex items-center gap-3 text-stone-300 hover:text-white transition-all duration-300 hover:translate-x-2 p-2 rounded-xl hover:bg-white/10"
              >
                <span class="text-lg group-hover:scale-110 transition-transform duration-300">{service.icon}</span>
                <span class="group-hover:text-amber-300 transition-colors">{service.name}</span>
                <svg class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Office Hours -->
      <div>
        <h4 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span class="text-2xl">🕐</span>
          <span>Office Hours</span>
        </h4>
        <div class="space-y-3">
          {#each [
            { days: 'Monday - Friday', hours: '8:00 AM - 6:00 PM', status: 'open' },
            { days: 'Saturday', hours: '9:00 AM - 4:00 PM', status: 'open' },
            { days: 'Sunday', hours: 'Closed', status: 'closed' }
          ] as schedule}
            <div class="flex items-center justify-between p-3 bg-white/10 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
              <span class="text-stone-300 font-medium">{schedule.days}</span>
              <span class="font-semibold {schedule.status === 'open' ? 'text-emerald-400' : 'text-stone-400'}">{schedule.hours}</span>
            </div>
          {/each}
          
          <div class="mt-4 p-3 bg-emerald-500/20 rounded-xl border border-emerald-400/30">
            <div class="flex items-center gap-2">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
              </svg>
              <span class="text-emerald-300 text-sm font-medium">Extended evening hours available by appointment</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Patient Resources -->
      <div>
        <h4 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span class="text-2xl">📚</span>
          <span>Patient Resources</span>
        </h4>
        <ul class="space-y-3">
          {#each [
            { name: 'Insurance & Payment', icon: '💳' },
            { name: 'Patient Forms', icon: '📄' },
            { name: 'Appointment Policy', icon: '📅' },
            { name: 'Emergency Instructions', icon: '📋' },
            { name: 'Post-Treatment Care', icon: '🩹' },
            { name: 'Oral Health Tips', icon: '💡' }
          ] as resource}
            <li>
              <a 
                href="/resources" 
                class="group flex items-center gap-3 text-stone-300 hover:text-white transition-all duration-300 hover:translate-x-2 p-2 rounded-xl hover:bg-white/10"
              >
                <span class="text-lg group-hover:scale-110 transition-transform duration-300">{resource.icon}</span>
                <span class="group-hover:text-amber-300 transition-colors">{resource.name}</span>
                <svg class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                </svg>
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- About & Contact -->
      <div>
        <h4 class="text-xl font-bold text-white mb-6 flex items-center gap-2">
          <span class="text-2xl">ℹ️</span>
          <span>About & Contact</span>
        </h4>
        <div class="space-y-4">
          <!-- Email Contact -->
          <div class="p-4 bg-white/10 rounded-xl border border-white/20 hover:bg-white/15 transition-all duration-300">
            <div class="flex items-center gap-3 mb-2">
              <svg class="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
              </svg>
              <span class="text-blue-200 text-sm font-medium">Email Us</span>
            </div>
            <a 
              href="mailto:info@auroradentica.ph" 
              class="font-semibold text-white hover:text-blue-300 transition-colors break-all"
            >
              info@auroradentica.ph
            </a>
          </div>

          <!-- Quick Links -->
          <div class="space-y-2">
            {#each [
              { name: 'About Our Team', href: '#about' },
              { name: 'Privacy Policy', href: '/privacy' },
              { name: 'Terms of Service', href: '/terms' }
            ] as link}
              <a 
                href={link.href} 
                class="block text-stone-300 hover:text-white transition-all duration-300 hover:translate-x-2 p-2 rounded-xl hover:bg-white/10 group"
              >
                <div class="flex items-center justify-between">
                  <span class="group-hover:text-amber-300 transition-colors">{link.name}</span>
                  <svg class="w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
                  </svg>
                </div>
              </a>
            {/each}
          </div>
        </div>
      </div>
    </div>

    <!-- BOTTOM SECTION: Stats & Legal -->
    <div class="border-t border-white/20 pt-12">
      
      <!-- Achievement Stats -->
      <div class="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
        {#each [
          { number: '15+', label: 'Years Experience', description: 'Serving Aurora families', icon: '🏆' },
          { number: '2,500+', label: 'Happy Patients', description: 'Trust in our care', icon: '👥' },
          { number: '98%', label: 'Satisfaction Rate', description: 'Exceptional service', icon: '⭐' },
          { number: '24/7', label: 'Emergency Support', description: 'Always here for you', icon: '🩺' }
        ] as stat}
          <div class="group text-center p-6 bg-white/10 hover:bg-white/15 rounded-2xl border border-white/20 hover:border-amber-400/50 transition-all duration-300 hover:scale-105">
            <div class="text-3xl mb-3 group-hover:scale-110 transition-transform duration-300">{stat.icon}</div>
            <div class="text-2xl lg:text-3xl font-bold text-white mb-1">{stat.number}</div>
            <div class="text-amber-300 font-semibold text-sm mb-1">{stat.label}</div>
            <div class="text-stone-400 text-xs">{stat.description}</div>
          </div>
        {/each}
      </div>

      <!-- Final Footer Info -->
      <div class="flex flex-col lg:flex-row justify-between items-center space-y-6 lg:space-y-0">
        
        <!-- Copyright & Legal -->
        <div class="text-center lg:text-left">
          <div class="text-stone-300 text-lg font-medium mb-2">
            © 2024 Aurora Dentica. All rights reserved.
          </div>
          <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-sm text-stone-400">
            <div class="flex items-center justify-center lg:justify-start gap-2">
              <span class="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
              <span>Licensed dental practice in Aurora, Philippines</span>
            </div>
            <span class="hidden sm:block">•</span>
            <div class="flex items-center justify-center lg:justify-start gap-2">
              <svg class="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
              </svg>
              <span>HIPAA Compliant & Secure</span>
            </div>
          </div>
        </div>

        <!-- Professional Badges & Contact -->
        <div class="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6">
          
          <!-- Professional Quality Badges -->
          <div class="flex items-center space-x-3">
            {#each [
              { label: 'Licensed', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' },
              { label: 'Insured', color: 'bg-blue-500/20 text-blue-300 border-blue-400/30' },
              { label: 'Professional', color: 'bg-amber-500/20 text-amber-300 border-amber-400/30' }
            ] as badge}
              <div class="flex items-center gap-1 {badge.color} px-3 py-1 rounded-full border text-xs font-bold">
                <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
                <span>{badge.label}</span>
              </div>
            {/each}
          </div>

          <!-- Emergency Contact -->
          <div class="flex items-center gap-3 bg-red-500/20 px-4 py-2 rounded-2xl border border-red-400/30">
            <div class="w-8 h-8 bg-gradient-to-r from-red-500 to-orange-500 rounded-lg flex items-center justify-center animate-pulse">
              <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </div>
            <div class="text-left">
              <div class="text-red-200 text-xs font-medium">Emergency</div>
              <a href="tel:+6391234568" class="text-white font-bold text-sm hover:text-red-200 transition-colors">
                (042) 123-4568
              </a>
            </div>
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
    outline: 2px solid #f59e0b;
    outline-offset: 2px;
    border-radius: 0.5rem;
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    footer {
      padding-top: 3rem;
      padding-bottom: 2rem;
    }
    
    .grid {
      gap: 1.5rem;
    }
  }

  /* Animation keyframes */
  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-slide-up {
    animation: slideUp 0.6s ease-out forwards;
  }

  /* Staggered animations for footer sections */
  footer > div > div:nth-child(1) { animation-delay: 0.1s; }
  footer > div > div:nth-child(2) { animation-delay: 0.2s; }
  footer > div > div:nth-child(3) { animation-delay: 0.3s; }
  footer > div > div:nth-child(4) { animation-delay: 0.4s; }

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
    
    .bg-gradient-to-r,
    .bg-gradient-to-br {
      background: #333 !important;
    }
  }

  /* Print styles */
  @media print {
    footer {
      background: white !important;
      color: black !important;
    }
    
    .no-print {
      display: none !important;
    }
  }
</style>