<!-- Simple Clean Footer -->
<footer class="bg-stone-800 text-white">
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
    
    <!-- Main Footer Content -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
      
      <!-- Company Info -->
      <div>
        <div class="flex items-center space-x-3 mb-4">
          <div class="w-10 h-10 bg-gradient-to-r from-amber-500 to-orange-500 rounded-lg flex items-center justify-center">
            <span class="text-white font-bold text-lg">AD</span>
          </div>
          <div>
            <h3 class="text-xl font-bold">Aurora Dentica</h3>
            <p class="text-amber-400 text-sm">Professional Dental Care</p>
          </div>
        </div>
        <p class="text-gray-300 text-sm leading-relaxed">
          Providing quality dental care to the Dingalan community since 2009. 
          Your oral health is our priority.
        </p>
      </div>

      <!-- Contact Info -->
      <div>
        <h4 class="text-lg font-semibold mb-4">Contact Us</h4>
        <div class="space-y-3 text-sm">
          <div class="flex items-center space-x-3">
            <span>📍</span>
            <div>
              <p>123 Dental Avenue</p>
              <p class="text-gray-400">Dingalan, Aurora 3205</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span>📞</span>
            <div>
              <a href="tel:042-123-4567" class="hover:text-amber-400 transition-colors">
                (042) 123-4567
              </a>
              <p class="text-gray-400">General Appointments</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span>🚨</span>
            <div>
              <a href="tel:042-123-4568" class="hover:text-red-400 transition-colors font-semibold">
                (042) 123-4568
              </a>
              <p class="text-gray-400">24/7 Emergency</p>
            </div>
          </div>
          <div class="flex items-center space-x-3">
            <span>✉️</span>
            <a href="mailto:info@auroradentica.ph" class="hover:text-amber-400 transition-colors">
              info@auroradentica.ph
            </a>
          </div>
        </div>
      </div>

      <!-- Office Hours -->
      <div>
        <h4 class="text-lg font-semibold mb-4">Office Hours</h4>
        <div class="space-y-2 text-sm">
          <div class="flex justify-between">
            <span class="text-gray-300">Monday - Friday</span>
            <span class="text-emerald-400">8:00 AM - 6:00 PM</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-300">Saturday</span>
            <span class="text-emerald-400">9:00 AM - 4:00 PM</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-300">Sunday</span>
            <span class="text-gray-500">Closed</span>
          </div>
        </div>
        
        <!-- Quick CTA -->
        <div class="mt-6">
          <a 
            href="#contact" 
            class="inline-block bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-lg font-medium hover:shadow-lg transition-all hover:scale-105"
          >
            Book Appointment
          </a>
        </div>
      </div>
    </div>

    <!-- Bottom Bar -->
    <div class="border-t border-stone-700 pt-6 flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
      <div class="text-sm text-gray-400">
        © 2024 Aurora Dentica. All rights reserved.
      </div>
      <div class="flex items-center space-x-6 text-sm">
        <span class="text-emerald-400 flex items-center space-x-1">
          <span>✓</span>
          <span>Licensed & Insured</span>
        </span>
        <a href="/privacy" class="text-gray-400 hover:text-white transition-colors">Privacy Policy</a>
      </div>
    </div>
  </div>
</footer>

<style>
  /* Simple hover effects */
  footer a:hover {
    transform: translateX(2px);
    transition: all 0.2s ease;
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    .grid {
      gap: 2rem;
    }
    
    .flex.justify-between {
      gap: 1rem;
    }
  }

  /* Focus states */
  footer a:focus {
    outline: 2px solid #d97706;
    outline-offset: 2px;
    border-radius: 0.25rem;
  }
</style>