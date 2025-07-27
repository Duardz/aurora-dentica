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
        where('isPublic', '==', true),
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

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  // Close mobile menu when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.closest('.mobile-menu-container')) {
      mobileMenuOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<svelte:head>
  <title>Aurora Dentica - Professional Dental Care Excellence</title>
  <meta name="description" content="Experience exceptional dental care at Aurora Dentica. Professional treatments, modern facility, and personalized service for your oral health needs. Book your appointment today." />
  <meta name="keywords" content="dental care, dentist Auckland, teeth cleaning, dental checkup, oral health, dental clinic" />
</svelte:head>

<!-- Enhanced Header with improved mobile navigation -->
<header class="bg-white/95 backdrop-blur-md shadow-lg border-b border-primary-100 sticky top-0 z-50">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-18">
      <!-- Logo -->
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <a href="/" class="flex items-center gap-3 hover:opacity-90 transition-all duration-300 group">
            <span class="text-3xl sm:text-4xl tooth-icon group-hover:scale-110 transition-transform duration-300">🦷</span>
            <div>
              <h1 class="text-xl sm:text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-700 bg-clip-text text-transparent">
                <span class="hidden xs:inline">Aurora Dentica</span>
                <span class="xs:hidden">Aurora</span>
              </h1>
              <p class="text-xs text-primary-500 font-medium hidden sm:block">Professional Dental Care</p>
            </div>
          </a>
        </div>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden lg:block">
        <div class="ml-10 flex items-center space-x-2">
          <a href="#services" class="nav-link text-gray-700 hover:text-primary-600 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200">
            <span class="mr-2">🏥</span>
            Services
          </a>
          <a href="#promotions" class="nav-link text-gray-700 hover:text-primary-600 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200">
            <span class="mr-2">🎉</span>
            Promotions
          </a>
          <a href="#contact" class="nav-link text-gray-700 hover:text-primary-600 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200">
            <span class="mr-2">📍</span>
            Contact
          </a>
          <div class="ml-4">
            <a href="/contact" class="btn-primary dental-glow">
              <span>📅</span>
              <span>Book Appointment</span>
            </a>
          </div>
        </div>
      </div>

      <!-- Mobile menu button and CTA -->
      <div class="lg:hidden flex items-center gap-3 mobile-menu-container">
        <a href="/contact" class="btn-primary btn-sm">
          <span>📅</span>
          <span class="hidden xs:inline">Book</span>
        </a>
        <button
          on:click={toggleMobileMenu}
          class="relative text-gray-600 hover:text-primary-600 focus:outline-none focus:ring-2 focus:ring-primary-500 rounded-xl p-2 transition-all duration-200 bg-gray-50 hover:bg-primary-50"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
        >
          <div class="w-6 h-6 relative">
            <span class="absolute inset-0 transition-all duration-300 {mobileMenuOpen ? 'rotate-45 translate-y-0' : 'rotate-0 -translate-y-2'}">
              <span class="block w-6 h-0.5 bg-current rounded-full"></span>
            </span>
            <span class="absolute inset-0 transition-all duration-300 {mobileMenuOpen ? 'opacity-0' : 'opacity-100'}">
              <span class="block w-6 h-0.5 bg-current rounded-full"></span>
            </span>
            <span class="absolute inset-0 transition-all duration-300 {mobileMenuOpen ? '-rotate-45 translate-y-0' : 'rotate-0 translate-y-2'}">
              <span class="block w-6 h-0.5 bg-current rounded-full"></span>
            </span>
          </div>
        </button>
      </div>
    </div>

    <!-- Enhanced Mobile Navigation -->
    {#if mobileMenuOpen}
      <div class="lg:hidden mobile-nav border-t border-primary-100 bg-white/95 backdrop-blur-md animate-slide-up">
        <div class="px-2 pt-4 pb-6 space-y-1">
          <a 
            href="#services" 
            on:click={closeMobileMenu} 
            class="mobile-nav-item block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
          >
            <span class="mr-3 text-lg">🏥</span>
            <span>Our Services</span>
          </a>
          <a 
            href="#promotions" 
            on:click={closeMobileMenu} 
            class="mobile-nav-item block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
          >
            <span class="mr-3 text-lg">🎉</span>
            <span>Special Offers</span>
          </a>
          <a 
            href="#contact" 
            on:click={closeMobileMenu} 
            class="mobile-nav-item block px-4 py-3 rounded-xl text-base font-medium text-gray-700 hover:text-primary-600 hover:bg-primary-50 transition-all duration-200"
          >
            <span class="mr-3 text-lg">📍</span>
            <span>Find Us</span>
          </a>
          
          <!-- Mobile CTA -->
          <div class="pt-4">
            <a 
              href="/contact" 
              on:click={closeMobileMenu} 
              class="btn-primary w-full justify-center py-4 text-lg dental-glow"
            >
              <span class="mr-2 text-xl">📅</span>
              <span>Book Your Appointment</span>
            </a>
          </div>

          <!-- Mobile Contact Info -->
          <div class="pt-4 border-t border-primary-100 mt-4">
            <div class="flex items-center justify-between px-4 py-2">
              <a 
                href="tel:+6491234567" 
                class="flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium transition-colors"
              >
                <span class="text-lg">📞</span>
                <span>(09) 123-4567</span>
              </a>
              <a 
                href="tel:+6491234568" 
                class="flex items-center gap-2 text-error-600 hover:text-error-700 font-medium transition-colors"
              >
                <span class="text-lg">🚨</span>
                <span>Emergency</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    {/if}
  </nav>
</header>

<!-- Enhanced Hero Section -->
<section class="relative bg-gradient-hero py-16 sm:py-20 lg:py-28 overflow-hidden dental-glow">
  <!-- Enhanced Background decoration -->
  <div class="absolute inset-0 pointer-events-none">
    <div class="absolute top-20 left-10 w-32 h-32 bg-primary-300/20 rounded-full blur-2xl animate-pulse-subtle"></div>
    <div class="absolute bottom-20 right-10 w-40 h-40 bg-accent-300/20 rounded-full blur-3xl animate-pulse-subtle" style="animation-delay: 1s;"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-200/10 rounded-full blur-3xl"></div>
    
    <!-- Floating elements -->
    <div class="absolute top-1/4 right-1/4 w-4 h-4 bg-accent-400 rounded-full opacity-60 animate-bounce" style="animation-delay: 0.5s;"></div>
    <div class="absolute bottom-1/3 left-1/5 w-3 h-3 bg-primary-400 rounded-full opacity-50 animate-bounce" style="animation-delay: 1.5s;"></div>
    <div class="absolute top-2/3 right-1/5 w-5 h-5 bg-accent-300 rounded-full opacity-40 animate-bounce" style="animation-delay: 2s;"></div>
  </div>
  
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <div class="mb-6 sm:mb-8">
        <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary-100 text-primary-800 border border-primary-200 animate-fade-in">
          <span class="mr-2">✨</span>
          Professional Dental Care Since 2020
        </span>
      </div>
      
      <h2 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 mb-6 sm:mb-8 leading-tight animate-fade-in">
        Your Smile is Our
        <span class="block sm:inline bg-gradient-to-r from-primary-600 via-accent-600 to-primary-700 bg-clip-text text-transparent dental-glow">
          Priority
        </span>
      </h2>
      
      <p class="text-lg sm:text-xl md:text-2xl text-gray-700 mb-8 sm:mb-10 max-w-4xl mx-auto leading-relaxed px-4 animate-fade-in">
        Experience exceptional dental care with our modern facility, advanced technology, and personalized approach to your oral health needs.
      </p>
      
      <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center max-w-lg sm:max-w-none mx-auto animate-fade-in">
        <a href="/contact" class="btn-primary btn-xl w-full sm:w-auto group dental-glow">
          <span class="text-xl group-hover:scale-110 transition-transform duration-300">📅</span>
          <span>Book Appointment</span>
        </a>
        <a href="#services" class="btn-secondary btn-xl w-full sm:w-auto group">
          <span class="text-xl group-hover:scale-110 transition-transform duration-300">🏥</span>
          <span>Learn More</span>
        </a>
      </div>

      <!-- Trust indicators -->
      <div class="mt-12 sm:mt-16 flex flex-wrap justify-center items-center gap-8 opacity-60">
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <span class="text-lg">⭐</span>
          <span class="font-medium">5-Star Rated</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <span class="text-lg">🛡️</span>
          <span class="font-medium">Fully Insured</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600">
          <span class="text-lg">🎓</span>
          <span class="font-medium">Certified Professionals</span>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Enhanced Services Section -->
<section id="services" class="py-16 sm:py-20 lg:py-24 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12 sm:mb-16">
      <div class="mb-4">
        <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-accent-100 text-accent-800 border border-accent-200">
          <span class="mr-2">🏥</span>
          Comprehensive Care
        </span>
      </div>
      <h3 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">Our Services</h3>
      <p class="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Comprehensive dental care services designed to keep your smile healthy, beautiful, and confident.
      </p>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      <!-- General Dentistry -->
      <div class="group card hover:shadow-2xl transition-all duration-500 p-8 hover:border-primary-200 transform hover:-translate-y-3 dental-glow">
        <div class="text-primary-600 text-5xl lg:text-6xl mb-6 group-hover:scale-110 transition-transform duration-500 flex justify-center">🦷</div>
        <h4 class="text-xl lg:text-2xl font-bold text-gray-900 mb-4 text-center">General Dentistry</h4>
        <p class="text-gray-600 mb-6 leading-relaxed text-center">Regular checkups, cleanings, fillings, and preventive care to maintain optimal oral health.</p>
        <ul class="text-sm text-gray-600 space-y-3">
          <li class="flex items-center">
            <span class="text-success-500 mr-3 font-bold text-lg">✓</span>
            <span>Routine cleanings & exams</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-3 font-bold text-lg">✓</span>
            <span>Cavity fillings & repairs</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-3 font-bold text-lg">✓</span>
            <span>Fluoride treatments</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-3 font-bold text-lg">✓</span>
            <span>Oral health education</span>
          </li>
        </ul>
        <div class="mt-6 text-center">
          <a href="/contact" class="text-primary-600 hover:text-primary-700 font-semibold inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
            <span>Book Service</span>
            <span class="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </a>
        </div>
      </div>

      <!-- Cosmetic Dentistry -->
      <div class="group card hover:shadow-2xl transition-all duration-500 p-8 hover:border-primary-200 transform hover:-translate-y-3 dental-glow">
        <div class="text-accent-600 text-5xl lg:text-6xl mb-6 group-hover:scale-110 transition-transform duration-500 flex justify-center">✨</div>
        <h4 class="text-xl lg:text-2xl font-bold text-gray-900 mb-4 text-center">Cosmetic Dentistry</h4>
        <p class="text-gray-600 mb-6 leading-relaxed text-center">Enhance your smile with professional whitening, veneers, and aesthetic treatments.</p>
        <ul class="text-sm text-gray-600 space-y-3">
          <li class="flex items-center">
            <span class="text-success-500 mr-3 font-bold text-lg">✓</span>
            <span>Professional teeth whitening</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-3 font-bold text-lg">✓</span>
            <span>Porcelain veneers</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-3 font-bold text-lg">✓</span>
            <span>Complete smile makeovers</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-3 font-bold text-lg">✓</span>
            <span>Bonding & contouring</span>
          </li>
        </ul>
        <div class="mt-6 text-center">
          <a href="/contact" class="text-accent-600 hover:text-accent-700 font-semibold inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
            <span>Book Service</span>
            <span class="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </a>
        </div>
      </div>

      <!-- Emergency Care -->
      <div class="group card hover:shadow-2xl transition-all duration-500 p-8 hover:border-primary-200 transform hover:-translate-y-3 dental-glow sm:col-span-2 lg:col-span-1">
        <div class="text-error-600 text-5xl lg:text-6xl mb-6 group-hover:scale-110 transition-transform duration-500 flex justify-center">🚨</div>
        <h4 class="text-xl lg:text-2xl font-bold text-gray-900 mb-4 text-center">Emergency Care</h4>
        <p class="text-gray-600 mb-6 leading-relaxed text-center">Urgent dental care when you need it most, with same-day appointments available.</p>
        <ul class="text-sm text-gray-600 space-y-3">
          <li class="flex items-center">
            <span class="text-success-500 mr-3 font-bold text-lg">✓</span>
            <span>24/7 emergency hotline</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-3 font-bold text-lg">✓</span>
            <span>Same-day appointments</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-3 font-bold text-lg">✓</span>
            <span>Pain management</span>
          </li>
          <li class="flex items-center">
            <span class="text-success-500 mr-3 font-bold text-lg">✓</span>
            <span>Trauma & injury care</span>
          </li>
        </ul>
        <div class="mt-6 text-center">
          <a href="tel:+6491234568" class="text-error-600 hover:text-error-700 font-semibold inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
            <span>Emergency Call</span>
            <span class="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Enhanced Promotions Section -->
<section id="promotions" class="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-primary-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12 sm:mb-16">
      <div class="mb-4">
        <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-warning-100 text-warning-800 border border-warning-200">
          <span class="mr-2">🎉</span>
          Limited Time Offers
        </span>
      </div>
      <h3 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">Current Promotions</h3>
      <p class="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">Special offers to help you maintain your dental health affordably.</p>
    </div>

    {#if loading}
      <div class="flex justify-center">
        <div class="text-center">
          <div class="loading-spinner h-16 w-16 text-primary-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Loading current promotions...</p>
        </div>
      </div>
    {:else if promos.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {#each promos as promo}
          <div class="group card hover:shadow-2xl transition-all duration-500 p-6 lg:p-8 hover:border-primary-200 transform hover:-translate-y-3 bg-white dental-glow">
            <div class="flex items-start justify-between mb-6 flex-wrap gap-3">
              <h4 class="text-lg sm:text-xl font-bold text-gray-900 flex-1 min-w-0 group-hover:text-primary-700 transition-colors duration-300">{promo.title}</h4>
              <span class="status-active whitespace-nowrap animate-pulse-subtle">
                Valid until {formatDisplayDate(promo.validUntil)}
              </span>
            </div>
            <p class="text-gray-600 mb-6 leading-relaxed text-sm sm:text-base">{promo.description}</p>
            <div class="mt-auto">
              <a href="/contact" class="inline-flex items-center text-primary-600 font-semibold hover:text-primary-700 transition-all duration-300 group-hover:gap-3 gap-2">
                <span>Book This Offer</span>
                <span class="group-hover:translate-x-1 transition-transform duration-300 text-lg">→</span>
              </a>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="card p-12 sm:p-16 text-center bg-white dental-glow">
        <div class="text-gray-400 text-6xl sm:text-7xl mb-6 animate-pulse-subtle">🎉</div>
        <h3 class="text-xl sm:text-2xl font-bold text-gray-900 mb-4">New Promotions Coming Soon!</h3>
        <p class="text-gray-600 mb-8 max-w-md mx-auto text-lg">We're preparing exciting offers for our patients. Check back soon or book your appointment to stay updated.</p>
        <a href="/contact" class="btn-primary btn-lg dental-glow">
          <span>📅</span>
          <span>Book Appointment</span>
        </a>
      </div>
    {/if}
  </div>
</section>

<!-- Enhanced Contact Section -->
<section id="contact" class="py-16 sm:py-20 lg:py-24 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12 sm:mb-16">
      <div class="mb-4">
        <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-primary-100 text-primary-800 border border-primary-200">
          <span class="mr-2">📍</span>
          Visit Our Modern Clinic
        </span>
      </div>
      <h3 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">Visit Our Clinic</h3>
      <p class="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">We're here to serve you with convenient hours, easy booking, and a comfortable environment.</p>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
      
      <!-- Contact Info - Enhanced -->
      <div class="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        
        <!-- Location -->
        <div class="card p-6 lg:p-8 hover:shadow-lg transition-all duration-300 group dental-glow">
          <div class="flex items-start space-x-4">
            <div class="text-primary-600 text-3xl sm:text-4xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">📍</div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-gray-900 mb-3 text-lg">Our Location</h4>
              <p class="text-gray-600 leading-relaxed mb-4">
                123 Dental Avenue<br>
                Aurora, Philippines<br>
                3200 Philippines
              </p>
              <a 
                href="https://maps.google.com/?q=123+Dental+Avenue+Aurora+Philippines" 
                target="_blank" 
                rel="noopener noreferrer"
                class="inline-flex items-center text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors gap-2"
              >
                <span>🗺️</span>
                <span>View on Google Maps</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Hours -->
        <div class="card p-6 lg:p-8 hover:shadow-lg transition-all duration-300 group dental-glow">
          <div class="flex items-start space-x-4">
            <div class="text-accent-600 text-3xl sm:text-4xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">🕒</div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-gray-900 mb-3 text-lg">Opening Hours</h4>
              <div class="text-gray-600 space-y-2 leading-relaxed">
                <div class="flex justify-between">
                  <span>Monday - Friday</span>
                  <span class="font-medium">8:00 AM - 6:00 PM</span>
                </div>
                <div class="flex justify-between">
                  <span>Saturday</span>
                  <span class="font-medium">9:00 AM - 4:00 PM</span>
                </div>
                <div class="flex justify-between">
                  <span>Sunday</span>
                  <span class="font-medium text-gray-400">Closed</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Phone -->
        <div class="card p-6 lg:p-8 hover:shadow-lg transition-all duration-300 group dental-glow">
          <div class="flex items-start space-x-4">
            <div class="text-blue-600 text-3xl sm:text-4xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">📞</div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-gray-900 mb-3 text-lg">Contact Numbers</h4>
              <div class="text-gray-600 space-y-2 leading-relaxed">
                <div>
                  <a href="tel:+639123456789" class="hover:text-primary-600 transition-colors font-medium text-lg block">
                    +63 9123 456 789</a>
                  <p class="text-sm text-gray-500">General appointments</p>
                </div>
                <div>
                  <a href="mailto:hello@auroradentica.com.ph" class="hover:text-primary-600 transition-colors font-medium block">
                    hello@auroradentica.com.ph</a>
                  <p class="text-sm text-gray-500">Email inquiries</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Emergency -->
        <div class="card p-6 lg:p-8 hover:shadow-lg transition-all duration-300 group dental-glow border-l-4 border-error-500">
          <div class="flex items-start space-x-4">
            <div class="text-error-600 text-3xl sm:text-4xl flex-shrink-0 group-hover:scale-110 transition-transform duration-300">🚨</div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-gray-900 mb-3 text-lg">Emergency Care</h4>
              <div class="text-gray-600 space-y-2 leading-relaxed">
                <div>
                  <a href="tel:+639123456790" class="hover:text-error-600 transition-colors font-bold text-lg block text-error-600">
                    +63 9123 456 790</a>
                  <p class="text-sm text-error-500 font-medium">24/7 Emergency Line</p>
                </div>
                <p class="text-xs text-gray-500 mt-2">
                  For urgent dental issues outside regular hours
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Enhanced CTA Card -->
      <div class="bg-gradient-to-br from-primary-600 via-primary-700 to-accent-600 rounded-2xl p-8 lg:p-10 text-white dental-glow relative overflow-hidden">
        <!-- Background pattern -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-4 right-4 w-20 h-20 border border-white/20 rounded-full"></div>
          <div class="absolute bottom-4 left-4 w-16 h-16 border border-white/20 rounded-full"></div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full"></div>
        </div>
        
        <div class="relative z-10">
          <h4 class="text-2xl sm:text-3xl font-bold mb-4">Ready to Book?</h4>
          <p class="text-primary-100 mb-6 leading-relaxed text-lg">
            Schedule your appointment through Facebook Messenger for quick and easy booking. Our team responds within hours to confirm your preferred time.
          </p>
          
          <a href="/contact" class="btn-secondary btn-lg w-full mb-6 bg-white text-primary-700 hover:bg-gray-50 border-white hover:border-gray-200">
            <span class="text-xl">💬</span>
            <span>Book via Messenger</span>
          </a>
          
          <div class="pt-6 border-t border-white/20">
            <p class="text-sm text-primary-100 mb-3">Follow us for updates and tips:</p>
            <a 
              href="https://facebook.com/auroradentica" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center space-x-2 text-white hover:text-primary-100 transition-colors font-medium group"
            >
              <span class="text-xl">📘</span>
              <span>Aurora Dentica on Facebook</span>
              <span class="group-hover:translate-x-1 transition-transform duration-300">→</span>
            </a>
          </div>

          <!-- Trust badges -->
          <div class="mt-8 flex flex-wrap gap-4 text-sm">
            <div class="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <span>🛡️</span>
              <span>Secure Booking</span>
            </div>
            <div class="flex items-center gap-2 bg-white/10 rounded-lg px-3 py-2">
              <span>⚡</span>
              <span>Quick Response</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Enhanced Footer -->
<footer class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-12 sm:py-16">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
      
      <!-- Company Info -->
      <div class="lg:col-span-2">
        <div class="flex items-center gap-3 mb-6">
          <span class="text-3xl sm:text-4xl tooth-icon">🦷</span>
          <div>
            <h5 class="text-xl sm:text-2xl font-bold">Aurora Dentica</h5>
            <p class="text-gray-400 text-sm">Professional Dental Care</p>
          </div>
        </div>
        <p class="text-gray-300 mb-6 leading-relaxed max-w-md">
          Providing exceptional dental care with modern technology, experienced professionals, and a commitment to your oral health and beautiful smile.
        </p>
        <div class="flex space-x-4">
          <a href="https://facebook.com/auroradentica" target="_blank" rel="noopener noreferrer" 
             class="text-gray-400 hover:text-white transition-colors p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
            📘
          </a>
          <a href="mailto:hello@auroradentica.co.nz" 
             class="text-gray-400 hover:text-white transition-colors p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
            ✉️
          </a>
          <a href="tel:+6491234567" 
             class="text-gray-400 hover:text-white transition-colors p-2 bg-gray-800 rounded-lg hover:bg-gray-700">
            📞
          </a>
        </div>
      </div>

      <!-- Quick Links -->
      <div>
        <h6 class="font-bold text-lg mb-4">Quick Links</h6>
        <ul class="space-y-3">
          <li><a href="#services" class="text-gray-400 hover:text-white transition-colors">Services</a></li>
          <li><a href="#promotions" class="text-gray-400 hover:text-white transition-colors">Promotions</a></li>
          <li><a href="/contact" class="text-gray-400 hover:text-white transition-colors">Book Appointment</a></li>
          <li><a href="#contact" class="text-gray-400 hover:text-white transition-colors">Contact</a></li>
        </ul>
      </div>

      <!-- Contact Info -->
      <div>
        <h6 class="font-bold text-lg mb-4">Contact Info</h6>
        <ul class="space-y-3 text-gray-400">
          <li class="flex items-start gap-2">
            <span class="text-primary-400">📍</span>
            <span class="text-sm">123 Dental Avenue<br>Aurora, Philippines 3200</span>
          </li>
          <li class="flex items-center gap-2">
            <span class="text-primary-400">📞</span>
            <a href="tel:+639123456789" class="hover:text-white transition-colors text-sm">+63 9123 456 789</a>
          </li>
          <li class="flex items-center gap-2">
            <span class="text-error-400">🚨</span>
            <a href="tel:+639123456790" class="hover:text-white transition-colors text-sm">Emergency: +63 9123 456 790</a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="mt-12 pt-8 border-t border-gray-700">
      <div class="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div class="text-center sm:text-left">
          <span class="text-gray-400 text-sm">© 2024 Aurora Dentica. All rights reserved.</span>
        </div>
        <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-sm text-gray-400">
          <span>Auckland, New Zealand</span>
          <span class="hidden sm:inline">•</span>
          <a href="mailto:hello@auroradentica.co.nz" class="hover:text-white transition-colors">
            hello@auroradentica.co.nz
          </a>
        </div>
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

  /* Enhanced mobile navigation styles */
  .mobile-menu-container {
    position: relative;
  }

  /* Custom animations for enhanced UX */
  @keyframes slideDown {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .mobile-nav {
    animation: slideDown 0.3s ease-out;
  }

  /* Enhanced hover effects */

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0, 0, 0);
    }
    40%, 43% {
      transform: translate3d(0, -8px, 0);
    }
    70% {
      transform: translate3d(0, -4px, 0);
    }
    90% {
      transform: translate3d(0, -2px, 0);
    }
  }

  /* Gradient text animation */
  @keyframes gradientShift {
    0% {
      background-position: 0% 50%;
    }
    50% {
      background-position: 100% 50%;
    }
    100% {
      background-position: 0% 50%;
    }
  }

  .dental-glow h2 span {
    background-size: 200% 200%;
    animation: gradientShift 4s ease-in-out infinite;
  }
</style>