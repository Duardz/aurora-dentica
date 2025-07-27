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
    if (!target.closest('.mobile-menu-container') && !target.closest('button[aria-label="Toggle menu"]')) {
      mobileMenuOpen = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    
    // Also close menu when clicking on navigation links
    const handleNavClick = () => {
      mobileMenuOpen = false;
    };
    
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

<!-- Enhanced Professional Header -->
<header class="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16 sm:h-20">
      <!-- Enhanced Logo -->
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <a href="/" class="flex items-center gap-3 hover:opacity-90 transition-all duration-300 group">
            <!-- Logo Placeholder - Replace with actual logo -->
            <div class="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-lg sm:text-xl shadow-md">
              AD
            </div>
            <div class="hidden sm:block">
              <h1 class="text-xl sm:text-2xl font-bold text-gray-900">
                Aurora Dentica
              </h1>
              <p class="text-xs text-gray-600 font-medium">Professional Dental Care</p>
            </div>
          </a>
        </div>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden lg:block">
        <div class="ml-10 flex items-center space-x-1">
          <a href="#services" class="px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium">
            Services
          </a>
          <a href="#promotions" class="px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium">
            Promotions
          </a>
          <a href="#contact" class="px-4 py-2 rounded-lg text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200 font-medium">
            Contact
          </a>
          <div class="ml-4">
            <a href="/contact" class="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-semibold transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5">
              Book Appointment
            </a>
          </div>
        </div>
      </div>

      <!-- Mobile menu button and CTA -->
      <div class="lg:hidden flex items-center gap-3 mobile-menu-container">
        <a href="/contact" class="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200">
          Book
        </a>
        <button
          on:click={toggleMobileMenu}
          class="relative text-gray-600 hover:text-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-lg p-2 transition-all duration-200 hover:bg-gray-100"
          aria-label="Toggle menu"
          aria-expanded={mobileMenuOpen}
          type="button"
        >
          <div class="w-6 h-6 relative">
            <span class="absolute top-0 left-0 w-6 h-0.5 bg-current rounded-full transition-all duration-300 {mobileMenuOpen ? 'rotate-45 translate-y-2.5' : 'rotate-0 translate-y-0'}"></span>
            <span class="absolute top-2.5 left-0 w-6 h-0.5 bg-current rounded-full transition-all duration-300 {mobileMenuOpen ? 'opacity-0' : 'opacity-100'}"></span>
            <span class="absolute top-5 left-0 w-6 h-0.5 bg-current rounded-full transition-all duration-300 {mobileMenuOpen ? '-rotate-45 -translate-y-2.5' : 'rotate-0 translate-y-0'}"></span>
          </div>
        </button>
      </div>
    </div>

    <!-- Enhanced Mobile Navigation -->
    {#if mobileMenuOpen}
      <div class="lg:hidden border-t border-gray-200 bg-white">
        <div class="px-2 pt-4 pb-6 space-y-1">
          <!-- Navigation Items -->
          <a 
            href="#services" 
            on:click={closeMobileMenu} 
            class="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            Our Services
          </a>
          <a 
            href="#promotions" 
            on:click={closeMobileMenu} 
            class="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            Special Offers
          </a>
          <a 
            href="#contact" 
            on:click={closeMobileMenu} 
            class="block px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50 transition-all duration-200"
          >
            Find Us
          </a>
          
          <!-- Mobile CTA -->
          <div class="pt-4">
            <a 
              href="/contact" 
              on:click={closeMobileMenu} 
              class="block w-full bg-blue-600 hover:bg-blue-700 text-white text-center py-3 px-4 rounded-lg font-semibold text-lg transition-all duration-200"
            >
              Book Your Appointment
            </a>
          </div>
        </div>
      </div>
    {/if}
  </nav>
</header>

<!-- Enhanced Hero Section -->
<section class="relative bg-gradient-to-br from-blue-50 via-white to-teal-50 py-16 sm:py-20 lg:py-28 overflow-hidden">
  <!-- Enhanced Background decoration -->
  <div class="absolute inset-0 pointer-events-none">
    <!-- Floating elements -->
    <div class="absolute top-20 left-10 w-32 h-32 bg-blue-200/20 rounded-full blur-2xl animate-pulse"></div>
    <div class="absolute bottom-20 right-10 w-40 h-40 bg-teal-200/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 1s;"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-100/10 rounded-full blur-3xl"></div>
    
    <!-- Decorative elements -->
    <div class="absolute top-1/4 right-1/4 w-4 h-4 bg-teal-400 rounded-full opacity-60 animate-bounce" style="animation-delay: 0.5s;"></div>
    <div class="absolute bottom-1/3 left-1/5 w-3 h-3 bg-blue-400 rounded-full opacity-50 animate-bounce" style="animation-delay: 1.5s;"></div>
    <div class="absolute top-2/3 right-1/5 w-5 h-5 bg-teal-300 rounded-full opacity-40 animate-bounce" style="animation-delay: 2s;"></div>
  </div>
  
  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center space-y-8 sm:space-y-10">
      <!-- Trust Badge -->
      <div class="animate-fade-in">
        <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-white/80 text-blue-800 border border-blue-200 shadow-sm backdrop-blur-sm">
          <span class="mr-2">✨</span>
          <span>Professional Dental Care Since 2020</span>
        </span>
      </div>
      
      <!-- Main Heading -->
      <h2 class="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-bold text-gray-900 leading-tight animate-fade-in">
        Your Smile is Our
        <span class="block bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">
          Priority
        </span>
      </h2>
      
      <!-- Lead Text -->
      <p class="text-lg sm:text-xl md:text-2xl text-gray-700 max-w-4xl mx-auto leading-relaxed animate-fade-in">
        Experience exceptional dental care with our modern facility, advanced technology, and personalized approach to your oral health needs.
      </p>
      
      <!-- CTA Buttons -->
      <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center max-w-lg sm:max-w-none mx-auto animate-fade-in">
        <a href="/contact" class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 group">
          <span class="text-xl mr-2 group-hover:scale-110 transition-transform duration-300">📅</span>
          <span>Book Appointment</span>
        </a>
        <a href="#services" class="w-full sm:w-auto bg-white hover:bg-gray-50 text-blue-600 px-8 py-4 rounded-xl font-bold text-lg border-2 border-blue-600 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 group">
          <span class="text-xl mr-2 group-hover:scale-110 transition-transform duration-300">🏥</span>
          <span>Learn More</span>
        </a>
      </div>

      <!-- Trust indicators -->
      <div class="mt-16 flex flex-wrap justify-center items-center gap-8 opacity-70">
        <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/60 px-4 py-2 rounded-full backdrop-blur-sm">
          <span class="text-lg">⭐</span>
          <span class="font-medium">5-Star Rated</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/60 px-4 py-2 rounded-full backdrop-blur-sm">
          <span class="text-lg">🛡️</span>
          <span class="font-medium">Fully Insured</span>
        </div>
        <div class="flex items-center gap-2 text-sm text-gray-600 bg-white/60 px-4 py-2 rounded-full backdrop-blur-sm">
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
    <!-- Section Header -->
    <div class="text-center mb-12 sm:mb-16">
      <div class="mb-4">
        <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-teal-100 text-teal-800 border border-teal-200">
          <span class="mr-2">🏥</span>
          <span>Comprehensive Care</span>
        </span>
      </div>
      <h3 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">Our Services</h3>
      <p class="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Comprehensive dental care services designed to keep your smile healthy, beautiful, and confident.
      </p>
    </div>
    
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
      <!-- General Dentistry -->
      <div class="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
        <div class="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
          🦷
        </div>
        <h4 class="text-xl lg:text-2xl font-bold text-gray-900 mb-4">General Dentistry</h4>
        <p class="text-gray-600 mb-6 leading-relaxed">Regular checkups, cleanings, fillings, and preventive care to maintain optimal oral health.</p>
        <ul class="text-sm text-gray-600 space-y-3 mb-6">
          <li class="flex items-center">
            <span class="text-green-500 mr-3 font-bold text-lg">✓</span>
            <span>Routine cleanings & exams</span>
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-3 font-bold text-lg">✓</span>
            <span>Cavity fillings & repairs</span>
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-3 font-bold text-lg">✓</span>
            <span>Fluoride treatments</span>
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-3 font-bold text-lg">✓</span>
            <span>Oral health education</span>
          </li>
        </ul>
        <div class="mt-auto">
          <a href="/contact" class="text-blue-600 hover:text-blue-700 font-semibold inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
            <span>Book Service</span>
            <span class="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </a>
        </div>
      </div>

      <!-- Cosmetic Dentistry -->
      <div class="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
        <div class="w-16 h-16 bg-teal-100 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
          ✨
        </div>
        <h4 class="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Cosmetic Dentistry</h4>
        <p class="text-gray-600 mb-6 leading-relaxed">Enhance your smile with professional whitening, veneers, and aesthetic treatments.</p>
        <ul class="text-sm text-gray-600 space-y-3 mb-6">
          <li class="flex items-center">
            <span class="text-green-500 mr-3 font-bold text-lg">✓</span>
            <span>Professional teeth whitening</span>
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-3 font-bold text-lg">✓</span>
            <span>Porcelain veneers</span>
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-3 font-bold text-lg">✓</span>
            <span>Complete smile makeovers</span>
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-3 font-bold text-lg">✓</span>
            <span>Bonding & contouring</span>
          </li>
        </ul>
        <div class="mt-auto">
          <a href="/contact" class="text-teal-600 hover:text-teal-700 font-semibold inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
            <span>Book Service</span>
            <span class="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </a>
        </div>
      </div>

      <!-- Emergency Care -->
      <div class="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group sm:col-span-2 lg:col-span-1">
        <div class="w-16 h-16 bg-red-100 rounded-xl flex items-center justify-center text-2xl mb-6 group-hover:scale-110 transition-transform duration-300">
          🚨
        </div>
        <h4 class="text-xl lg:text-2xl font-bold text-gray-900 mb-4">Emergency Care</h4>
        <p class="text-gray-600 mb-6 leading-relaxed">Urgent dental care when you need it most, with same-day appointments available.</p>
        <ul class="text-sm text-gray-600 space-y-3 mb-6">
          <li class="flex items-center">
            <span class="text-green-500 mr-3 font-bold text-lg">✓</span>
            <span>24/7 emergency hotline</span>
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-3 font-bold text-lg">✓</span>
            <span>Same-day appointments</span>
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-3 font-bold text-lg">✓</span>
            <span>Pain management</span>
          </li>
          <li class="flex items-center">
            <span class="text-green-500 mr-3 font-bold text-lg">✓</span>
            <span>Trauma & injury care</span>
          </li>
        </ul>
        <div class="mt-auto">
          <a href="tel:+6491234568" class="text-red-600 hover:text-red-700 font-semibold inline-flex items-center gap-2 group-hover:gap-3 transition-all duration-300">
            <span>Emergency Call</span>
            <span class="group-hover:translate-x-1 transition-transform duration-300">→</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Enhanced Promotions Section -->
<section id="promotions" class="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-gray-50 to-blue-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Section Header -->
    <div class="text-center mb-12 sm:mb-16">
      <div class="mb-4">
        <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-orange-100 text-orange-800 border border-orange-200">
          <span class="mr-2">🎉</span>
          <span>Limited Time Offers</span>
        </span>
      </div>
      <h3 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">Current Promotions</h3>
      <p class="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">Special offers to help you maintain your dental health affordably.</p>
    </div>

    {#if loading}
      <div class="flex justify-center">
        <div class="text-center">
          <div class="animate-spin rounded-full h-16 w-16 border-4 border-blue-200 border-t-blue-600 mx-auto mb-4"></div>
          <p class="text-gray-600">Loading current promotions...</p>
        </div>
      </div>
    {:else if promos.length > 0}
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
        {#each promos as promo}
          <div class="bg-white rounded-2xl p-6 sm:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
            <div class="flex items-start justify-between mb-6 flex-wrap gap-3">
              <h4 class="text-xl font-bold text-gray-900 flex-1 min-w-0 group-hover:text-blue-700 transition-colors duration-300">{promo.title}</h4>
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-green-100 text-green-800 border border-green-200 whitespace-nowrap">
                Valid until {formatDisplayDate(promo.validUntil)}
              </span>
            </div>
            <p class="text-gray-600 mb-6 leading-relaxed">{promo.description}</p>
            <div class="mt-auto">
              <a href="/contact" class="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-all duration-300 group-hover:gap-3 gap-2">
                <span>Book This Offer</span>
                <span class="group-hover:translate-x-1 transition-transform duration-300 text-lg">→</span>
              </a>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="bg-white rounded-2xl p-12 sm:p-16 text-center shadow-lg border border-gray-100">
        <div class="text-gray-400 text-6xl sm:text-7xl mb-6 animate-pulse">🎉</div>
        <h3 class="text-2xl font-bold text-gray-900 mb-4">New Promotions Coming Soon!</h3>
        <p class="text-gray-600 mb-8 max-w-md mx-auto text-lg">We're preparing exciting offers for our patients. Check back soon or book your appointment to stay updated.</p>
        <a href="/contact" class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
          <span class="mr-2">📅</span>
          <span>Book Appointment</span>
        </a>
      </div>
    {/if}
  </div>
</section>

<!-- Enhanced Contact Section -->
<section id="contact" class="py-16 sm:py-20 lg:py-24 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <!-- Section Header -->
    <div class="text-center mb-12 sm:mb-16">
      <div class="mb-4">
        <span class="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-blue-100 text-blue-800 border border-blue-200">
          <span class="mr-2">📍</span>
          <span>Visit Our Modern Clinic</span>
        </span>
      </div>
      <h3 class="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 mb-4 sm:mb-6">Visit Our Clinic</h3>
      <p class="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto">We're here to serve you with convenient hours, easy booking, and a comfortable environment.</p>
    </div>

    <div class="grid grid-cols-1 xl:grid-cols-3 gap-8 lg:gap-12">
      
      <!-- Contact Info Cards -->
      <div class="xl:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8">
        
        <!-- Location -->
        <div class="bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
              📍
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-gray-900 mb-3 text-lg">Our Location</h4>
              <p class="text-gray-600 leading-relaxed mb-4">
                123 Dental Avenue<br>
                Auckland, New Zealand<br>
                1010 New Zealand
              </p>
              <a 
                href="https://maps.google.com/?q=123+Dental+Avenue+Auckland+New+Zealand" 
                target="_blank" 
                rel="noopener noreferrer"
                class="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium text-sm transition-colors gap-2"
              >
                <span>🗺️</span>
                <span>View on Google Maps</span>
              </a>
            </div>
          </div>
        </div>

        <!-- Hours -->
        <div class="bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-teal-100 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
              🕒
            </div>
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
        <div class="bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
              📞
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-gray-900 mb-3 text-lg">Contact Numbers</h4>
              <div class="text-gray-600 space-y-3 leading-relaxed">
                <div>
                  <a href="tel:+6491234567" class="hover:text-blue-600 transition-colors font-medium text-lg block">
                    (09) 123-4567</a>
                  <p class="text-sm text-gray-500">General appointments</p>
                </div>
                <div>
                  <a href="mailto:hello@auroradentica.co.nz" class="hover:text-blue-600 transition-colors font-medium block">
                    hello@auroradentica.co.nz</a>
                  <p class="text-sm text-gray-500">Email inquiries</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Emergency -->
        <div class="bg-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group border-l-4 border-red-500">
          <div class="flex items-start space-x-4">
            <div class="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center text-xl group-hover:scale-110 transition-transform duration-300">
              🚨
            </div>
            <div class="flex-1 min-w-0">
              <h4 class="font-bold text-gray-900 mb-3 text-lg">Emergency Care</h4>
              <div class="text-gray-600 space-y-2 leading-relaxed">
                <div>
                  <a href="tel:+6491234568" class="hover:text-red-600 transition-colors font-bold text-lg block text-red-600">
                    (09) 123-4568</a>
                  <p class="text-sm text-red-500 font-medium">24/7 Emergency Line</p>
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
      <div class="bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 rounded-3xl p-8 lg:p-10 text-white relative overflow-hidden">
        <!-- Background pattern -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-6 right-6 w-20 h-20 border border-white/20 rounded-full"></div>
          <div class="absolute bottom-6 left-6 w-16 h-16 border border-white/20 rounded-full"></div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 border border-white/10 rounded-full"></div>
        </div>
        
        <div class="relative z-10 space-y-6">
          <h4 class="text-2xl sm:text-3xl font-bold">Ready to Book?</h4>
          <p class="text-blue-100 leading-relaxed text-lg">
            Schedule your appointment through Facebook Messenger for quick and easy booking. Our team responds within hours to confirm your preferred time.
          </p>
          
          <a href="/contact" class="block w-full bg-white hover:bg-gray-50 text-blue-700 text-center py-4 px-6 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1">
            <span class="text-xl mr-2">💬</span>
            <span>Book via Messenger</span>
          </a>
          
          <div class="pt-6 border-t border-white/20">
            <p class="text-sm text-blue-100 mb-3">Follow us for updates and tips:</p>
            <a 
              href="https://facebook.com/auroradentica" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center space-x-2 text-white hover:text-blue-100 transition-colors font-medium group"
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
<footer class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-16 sm:py-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">
      
      <!-- Company Info -->
      <div class="lg:col-span-2">
        <div class="flex items-center gap-4 mb-6">
          <div class="w-12 h-12 bg-white/10 rounded-xl flex items-center justify-center text-white font-bold text-xl">
            AD
          </div>
          <div>
            <h5 class="text-2xl font-bold text-white">Aurora Dentica</h5>
            <p class="text-gray-300 text-sm">Professional Dental Care</p>
          </div>
        </div>
        <p class="text-gray-300 mb-6 leading-relaxed max-w-md">
          Providing exceptional dental care with modern technology, experienced professionals, and a commitment to your oral health and beautiful smile.
        </p>
        <div class="flex space-x-4">
          <a href="https://facebook.com/auroradentica" target="_blank" rel="noopener noreferrer" 
             class="text-gray-400 hover:text-white transition-colors p-3 bg-white/10 rounded-xl hover:bg-white/20">
            📘
          </a>
          <a href="mailto:hello@auroradentica.co.nz" 
             class="text-gray-400 hover:text-white transition-colors p-3 bg-white/10 rounded-xl hover:bg-white/20">
            ✉️
          </a>
          <a href="tel:+6491234567" 
             class="text-gray-400 hover:text-white transition-colors p-3 bg-white/10 rounded-xl hover:bg-white/20">
            📞
          </a>
        </div>
      </div>

      <!-- Quick Links -->
      <div>
        <h6 class="font-bold text-lg mb-6 text-white">Quick Links</h6>
        <ul class="space-y-4">
          <li><a href="#services" class="text-gray-300 hover:text-white transition-colors">Services</a></li>
          <li><a href="#promotions" class="text-gray-300 hover:text-white transition-colors">Promotions</a></li>
          <li><a href="/contact" class="text-gray-300 hover:text-white transition-colors">Book Appointment</a></li>
          <li><a href="#contact" class="text-gray-300 hover:text-white transition-colors">Contact</a></li>
        </ul>
      </div>

      <!-- Contact Info -->
      <div>
        <h6 class="font-bold text-lg mb-6 text-white">Contact Info</h6>
        <ul class="space-y-4 text-gray-300">
          <li class="flex items-start gap-3">
            <span class="text-blue-400 text-lg">📍</span>
            <span class="text-sm">123 Dental Avenue<br>Auckland, New Zealand 1010</span>
          </li>
          <li class="flex items-center gap-3">
            <span class="text-blue-400 text-lg">📞</span>
            <a href="tel:+6491234567" class="hover:text-white transition-colors text-sm">(09) 123-4567</a>
          </li>
          <li class="flex items-center gap-3">
            <span class="text-red-400 text-lg">🚨</span>
            <a href="tel:+6491234568" class="hover:text-white transition-colors text-sm">Emergency: (09) 123-4568</a>
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

  /* Animation keyframes */
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

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

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  /* Apply animations */
  .animate-fade-in {
    animation: fadeIn 0.6s ease-out;
  }

  .animate-slide-up {
    animation: slideUp 0.3s ease-out;
  }

  /* Enhanced hover effects */
  .group:hover .group-hover\:scale-110 {
    transform: scale(1.1);
  }

  .group:hover .group-hover\:gap-3 {
    gap: 0.75rem;
  }

  .group:hover .group-hover\:translate-x-1 {
    transform: translateX(0.25rem);
  }

  /* Mobile responsive improvements */
  @media (max-width: 640px) {
    .space-y-8 > * + * {
      margin-top: 1.5rem;
    }
    
    .space-y-10 > * + * {
      margin-top: 2rem;
    }
  }

  /* Service card enhancements */
  .bg-white.rounded-2xl {
    min-height: 400px;
    display: flex;
    flex-direction: column;
  }

  .bg-white.rounded-2xl .mt-auto {
    margin-top: auto;
  }

  /* Better focus states for accessibility */
  a:focus,
  button:focus {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 0.5rem;
  }

  /* Loading spinner */
  .animate-spin {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Smooth scrolling for anchor links */
  html {
    scroll-behavior: smooth;
  }

  /* Better text rendering */
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }
</style>