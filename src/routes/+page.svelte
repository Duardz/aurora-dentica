<script lang="ts">
  import { onMount } from 'svelte';
  import { db } from '$lib/firebase/config';
  import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
  import { decrypt } from '$lib/encryption';
  import { formatDisplayDate } from '$lib/utils';

  interface Promo {
    id: string;
    title: string;
    description: string;
    validUntil: string;
    createdAt: any;
  }

  let promos: Promo[] = [];
  let loading = true;
  let mobileMenuOpen = false;

  onMount(async () => {
    await loadPromos();
  });

  async function loadPromos() {
    if (!db) {
      loading = false;
      return;
    }

    try {
      const today = new Date().toISOString().split('T')[0];
      const promosRef = collection(db, 'promos');
      const q = query(
        promosRef,
        where('validUntil', '>=', today),
        orderBy('validUntil', 'asc')
      );
      
      const snapshot = await getDocs(q);
      promos = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          title: decrypt(data.title || ''),
          description: decrypt(data.description || ''),
          validUntil: data.validUntil,
          createdAt: data.createdAt
        };
      });
    } catch (error) {
      console.error('Error loading promos:', error);
    } finally {
      loading = false;
    }
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }
</script>

<svelte:head>
  <title>Aurora Dentica - Professional Dental Care</title>
  <meta name="description" content="Experience exceptional dental care at Aurora Dentica. Professional treatments, modern facility, and personalized service for your oral health needs." />
</svelte:head>

<!-- Header with improved styling -->
<header class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <!-- Logo -->
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <h1 class="text-xl sm:text-2xl font-bold text-primary-600 flex items-center gap-2">
            <span class="text-2xl sm:text-3xl tooth-icon">🦷</span>
            <span class="hidden xs:inline">Aurora Dentica</span>
            <span class="xs:hidden">Aurora</span>
          </h1>
        </div>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden lg:block">
        <div class="ml-10 flex items-baseline space-x-6">
          <a href="#services" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary-50">Services</a>
          <a href="#promotions" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary-50">Promotions</a>
          <a href="#contact" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-primary-50">Contact</a>
          <a href="/contact" class="btn-primary">
            <span>📅</span>
            <span>Book Appointment</span>
          </a>
        </div>
      </div>

      <!-- Mobile menu button -->
      <div class="lg:hidden flex items-center gap-3">
        <a href="/contact" class="btn-primary btn-sm">Book</a>
        <button
          on:click={toggleMobileMenu}
          class="text-gray-600 hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-md p-2"
          aria-label="Toggle menu"
        >
          {#if mobileMenuOpen}
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          {:else}
            <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          {/if}
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    {#if mobileMenuOpen}
      <div class="lg:hidden border-t border-gray-200 bg-white">
        <div class="px-2 pt-2 pb-3 space-y-1">
          <a href="#services" on:click={toggleMobileMenu} class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors">Services</a>
          <a href="#promotions" on:click={toggleMobileMenu} class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors">Promotions</a>
          <a href="#contact" on:click={toggleMobileMenu} class="block px-3 py-2 rounded-md text-base font-medium text-gray-600 hover:text-primary-600 hover:bg-primary-50 transition-colors">Contact</a>
          <a href="/contact" on:click={toggleMobileMenu} class="btn-primary w-full mt-4">
            <span>📅</span>
            <span>Book Appointment</span>
          </a>
        </div>
      </div>
    {/if}
  </nav>
</header>

<!-- Hero Section with better gradients -->
<section class="relative bg-gradient-hero py-12 sm:py-16 lg:py-24 overflow-hidden">
  <!-- Background decoration -->
  <div class="absolute inset-0">
    <div class="absolute top-10 left-10 w-20 h-20 bg-primary-200/30 rounded-full blur-xl"></div>
    <div class="absolute bottom-10 right-10 w-32 h-32 bg-accent-200/30 rounded-full blur-xl"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary-100/20 rounded-full blur-3xl"></div>
  </div>
  
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h2 class="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-4 sm:mb-6 leading-tight">
        Your Smile is Our
        <span class="text-primary-600 block sm:inline">Priority</span>
      </h2>
      <p class="text-lg sm:text-xl text-gray-700 mb-6 sm:mb-8 max-w-3xl mx-auto leading-relaxed px-4">
        Experience exceptional dental care with our modern facility, advanced technology, and personalized approach to your oral health needs.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md sm:max-w-none mx-auto">
        <a href="/contact" class="btn-primary btn-lg w-full sm:w-auto">
          <span>📅</span>
          <span>Book Appointment</span>
        </a>
        <a href="#services" class="btn-secondary btn-lg w-full sm:w-auto">
          Learn More
        </a>
      </div>
    </div>
  </div>
</section>

<!-- Services Section with improved cards -->
<section id="services" class="py-12 sm:py-16 lg:py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-8 sm:mb-12">
      <h3 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Our Services</h3>
      <p class="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
        Comprehensive dental care services designed to keep your smile healthy and beautiful.
      </p>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      <!-- General Dentistry -->
      <div class="group card hover:shadow-card-hover transition-all duration-300 p-6 lg:p-8 hover:border-primary-200 transform hover:-translate-y-2">
        <div class="text-primary-600 text-4xl lg:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🦷</div>
        <h4 class="text-xl lg:text-2xl font-semibold text-gray-900 mb-3">General Dentistry</h4>
        <p class="text-gray-600 mb-4 leading-relaxed">Regular checkups, cleanings, fillings, and preventive care to maintain optimal oral health.</p>
        <ul class="text-sm text-gray-500 space-y-2">
          <li class="flex items-center">
            <span class="text-success-500 mr-2 font-bold">✓</span>
            <span>Routine cleanings</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-2 font-bold">✓</span>
            <span>Dental examinations</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-2 font-bold">✓</span>
            <span>Cavity fillings</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-2 font-bold">✓</span>
            <span>Fluoride treatments</span>
          </li>
        </ul>
      </div>

      <!-- Cosmetic Dentistry -->
      <div class="group card hover:shadow-card-hover transition-all duration-300 p-6 lg:p-8 hover:border-primary-200 transform hover:-translate-y-2">
        <div class="text-primary-600 text-4xl lg:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">✨</div>
        <h4 class="text-xl lg:text-2xl font-semibold text-gray-900 mb-3">Cosmetic Dentistry</h4>
        <p class="text-gray-600 mb-4 leading-relaxed">Enhance your smile with professional whitening, veneers, and aesthetic treatments.</p>
        <ul class="text-sm text-gray-500 space-y-2">
          <li class="flex items-center">
            <span class="text-success-500 mr-2 font-bold">✓</span>
            <span>Teeth whitening</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-2 font-bold">✓</span>
            <span>Dental veneers</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-2 font-bold">✓</span>
            <span>Smile makeovers</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-2 font-bold">✓</span>
            <span>Bonding & contouring</span>
          </li>
        </ul>
      </div>

      <!-- Emergency Care -->
      <div class="group card hover:shadow-card-hover transition-all duration-300 p-6 lg:p-8 hover:border-primary-200 transform hover:-translate-y-2 sm:col-span-2 lg:col-span-1">
        <div class="text-error-600 text-4xl lg:text-5xl mb-4 group-hover:scale-110 transition-transform duration-300">🚨</div>
        <h4 class="text-xl lg:text-2xl font-semibold text-gray-900 mb-3">Emergency Care</h4>
        <p class="text-gray-600 mb-4 leading-relaxed">Urgent dental care when you need it most, with same-day appointments available.</p>
        <ul class="text-sm text-gray-500 space-y-2">
          <li class="flex items-center">
            <span class="text-success-500 mr-2 font-bold">✓</span>
            <span>Toothache relief</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-2 font-bold">✓</span>
            <span>Broken tooth repair</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-2 font-bold">✓</span>
            <span>Same-day appointments</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-2 font-bold">✓</span>
            <span>Pain management</span>
          </li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- Promotions Section -->
<section id="promotions" class="py-12 sm:py-16 lg:py-20 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-8 sm:mb-12">
      <h3 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Current Promotions</h3>
      <p class="text-base sm:text-lg text-gray-600">Special offers to help you maintain your dental health.</p>
    </div>

    {#if loading}
      <div class="flex justify-center">
        <div class="loading-spinner h-12 w-12 text-primary-600"></div>
      </div>
    {:else if promos.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each promos as promo}
          <div class="card hover:shadow-card-hover transition-all duration-300 p-6 hover:border-primary-200 transform hover:-translate-y-1">
            <div class="flex items-start justify-between mb-4 flex-wrap gap-2">
              <h4 class="text-lg sm:text-xl font-semibold text-gray-900 flex-1 min-w-0">{promo.title}</h4>
              <span class="status-active whitespace-nowrap">
                Valid until {formatDisplayDate(promo.validUntil)}
              </span>
            </div>
            <p class="text-gray-600 mb-4 leading-relaxed text-sm sm:text-base">{promo.description}</p>
            <a href="/contact" class="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-colors group">
              <span>Book This Offer</span>
              <span class="ml-1 group-hover:translate-x-1 transition-transform">→</span>
            </a>
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center py-12">
        <div class="text-gray-400 text-4xl sm:text-5xl mb-4">🎉</div>
        <p class="text-gray-500 text-base sm:text-lg">No current promotions available. Check back soon!</p>
      </div>
    {/if}
  </div>
</section>

<!-- Contact Section -->
<section id="contact" class="py-12 sm:py-16 lg:py-20 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-8 sm:mb-12">
      <h3 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">Visit Our Clinic</h3>
      <p class="text-base sm:text-lg text-gray-600">We're here to serve you with convenient hours and easy booking.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
      <!-- Contact Info -->
      <div class="space-y-6 sm:space-y-8">
        <div class="flex items-start space-x-4">
          <div class="text-primary-600 text-2xl sm:text-3xl flex-shrink-0">📍</div>
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-gray-900 mb-2 text-lg">Location</h4>
            <p class="text-gray-600 leading-relaxed">
              123 Dental Avenue<br>
              Auckland, New Zealand 1010
            </p>
          </div>
        </div>

        <div class="flex items-start space-x-4">
          <div class="text-primary-600 text-2xl sm:text-3xl flex-shrink-0">🕒</div>
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-gray-900 mb-2 text-lg">Hours</h4>
            <div class="text-gray-600 space-y-1 leading-relaxed">
              <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
              <p>Saturday: 9:00 AM - 4:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>

        <div class="flex items-start space-x-4">
          <div class="text-primary-600 text-2xl sm:text-3xl flex-shrink-0">📞</div>
          <div class="flex-1 min-w-0">
            <h4 class="font-semibold text-gray-900 mb-2 text-lg">Contact</h4>
            <div class="text-gray-600 space-y-1 leading-relaxed">
              <p><a href="tel:+6491234567" class="hover:text-primary-600 transition-colors font-medium">Phone: (09) 123-4567</a></p>
              <p><a href="tel:+6491234568" class="hover:text-error-600 transition-colors font-medium">Emergency: (09) 123-4568</a></p>
              <p><a href="mailto:hello@auroradentica.co.nz" class="hover:text-primary-600 transition-colors font-medium">Email: hello@auroradentica.co.nz</a></p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Card -->
      <div class="bg-gradient-primary rounded-2xl p-6 sm:p-8 border border-primary-100">
        <h4 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4">Ready to Book?</h4>
        <p class="text-gray-700 mb-6 leading-relaxed">
          Schedule your appointment through Facebook Messenger for quick and easy booking. Our team will respond within hours to confirm your preferred time.
        </p>
        <a href="/contact" class="btn-primary btn-lg w-full sm:w-auto mb-6">
          <span>💬</span>
          <span>Book via Messenger</span>
        </a>
        
        <div class="pt-6 border-t border-primary-200">
          <p class="text-sm text-gray-600 mb-3">Follow us for updates and tips:</p>
          <a 
            href="https://facebook.com/auroradentica" 
            target="_blank" 
            rel="noopener noreferrer"
            class="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors font-medium"
          >
            <span>📘</span>
            <span>Aurora Dentica on Facebook</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="bg-gray-900 text-white py-8 sm:py-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h5 class="text-xl sm:text-2xl font-bold mb-3 sm:mb-4 flex items-center justify-center gap-2">
        <span class="text-2xl sm:text-3xl tooth-icon">🦷</span>
        <span>Aurora Dentica</span>
      </h5>
      <p class="text-gray-400 mb-4 sm:mb-6">Professional dental care you can trust</p>
      <div class="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400">
        <span>© 2024 Aurora Dentica</span>
        <span class="hidden sm:inline">•</span>
        <span>Auckland, New Zealand</span>
        <span class="hidden sm:inline">•</span>
        <a href="mailto:hello@auroradentica.co.nz" class="hover:text-white transition-colors">
          hello@auroradentica.co.nz
        </a>
      </div>
    </div>
  </div>
</footer>

<style>
  /* Custom breakpoint for extra small devices */
  @media (min-width: 475px) {
    .xs\:inline {
      display: inline;
    }
    .xs\:hidden {
      display: none;
    }
  }
</style>