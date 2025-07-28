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
  let currentTestimonial = 0;
  let heroVideoLoaded = false;

  // Enhanced testimonials
  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Patient since 2020",
      content: "Aurora Dentica transformed my smile completely. The staff is incredibly professional and the technology they use is cutting-edge. Highly recommend!",
      rating: 5,
      image: "👩🏼‍💼"
    },
    {
      name: "Michael Chen",
      role: "Family Patient",
      content: "Best dental experience I've ever had. The modern facility and gentle approach made my entire family comfortable. Our kids actually look forward to visits!",
      rating: 5,
      image: "👨🏻‍💻"
    },
    {
      name: "Emma Wilson",
      role: "New Patient",
      content: "The online booking system is so convenient, and the care I received was exceptional. The team goes above and beyond for patient comfort.",
      rating: 5,
      image: "👩🏽‍🎨"
    }
  ];

  // Statistics
  const stats = [
    { number: "5000+", label: "Happy Patients", icon: "😊" },
    { number: "15+", label: "Years Experience", icon: "🏆" },
    { number: "99%", label: "Satisfaction Rate", icon: "⭐" },
    { number: "24/7", label: "Emergency Care", icon: "🚑" }
  ];

  onMount(async () => {
    await loadPromos();
    startTestimonialRotation();
    setTimeout(() => heroVideoLoaded = true, 1000);
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

  function startTestimonialRotation() {
    setInterval(() => {
      currentTestimonial = (currentTestimonial + 1) % testimonials.length;
    }, 5000);
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }

  // Enhanced scroll-triggered animations
  function handleScroll() {
    const elements = document.querySelectorAll('.scroll-animate');
    elements.forEach(el => {
      const rect = el.getBoundingClientRect();
      if (rect.top < window.innerHeight - 100) {
        el.classList.add('animate-fade-in-up');
      }
    });
  }

  onMount(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  });
</script>

<svelte:head>
  <title>Aurora Dentica - Professional Dental Care Excellence</title>
  <meta name="description" content="Experience exceptional dental care at Aurora Dentica. Professional treatments, modern facility, and personalized service for your oral health needs. Book your appointment today." />
  <meta name="keywords" content="dental care, dentist Auckland, teeth cleaning, dental checkup, oral health, dental clinic" />
</svelte:head>

<!-- Ultra-Modern Navigation -->
<nav class="fixed top-0 w-full z-50 transition-all duration-500">
  <!-- Main navigation bar -->
  <div class="bg-white/90 backdrop-blur-2xl border-b border-gray-200/50 shadow-xl shadow-blue-500/5">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div class="flex justify-between items-center h-20">
        
        <!-- Enhanced Logo -->
        <div class="flex items-center group">
          <a href="/" class="flex items-center space-x-4 transition-all duration-300 group-hover:scale-105">
            <!-- Animated Logo -->
            <div class="relative">
              <div class="w-14 h-14 bg-gradient-to-br from-blue-500 via-blue-600 to-teal-500 rounded-2xl shadow-2xl flex items-center justify-center transform rotate-3 group-hover:rotate-6 transition-all duration-500">
                <span class="text-white text-2xl font-bold transform -rotate-3 group-hover:-rotate-6 transition-all duration-500">AD</span>
              </div>
              <!-- Enhanced glow effect -->
              <div class="absolute inset-0 bg-gradient-to-br from-blue-400 to-teal-400 rounded-2xl blur-xl opacity-0 group-hover:opacity-40 transition-all duration-500 -z-10"></div>
            </div>
            
            <div class="hidden sm:block">
              <h1 class="text-2xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-teal-700 bg-clip-text text-transparent">
                Aurora Dentica
              </h1>
              <p class="text-sm text-blue-600 font-semibold -mt-1">Professional Dental Care</p>
            </div>
          </a>
        </div>

        <!-- Desktop Navigation with enhanced spacing -->
        <div class="hidden lg:flex items-center space-x-2">
          {#each [
            { name: 'Services', href: '#services', icon: '🏥' },
            { name: 'Promotions', href: '#promotions', icon: '🎉' },
            { name: 'About', href: '#about', icon: '👥' },
            { name: 'Contact', href: '#contact', icon: '📍' }
          ] as item}
            <a 
              href={item.href} 
              class="group relative px-5 py-3 rounded-2xl font-semibold text-gray-700 hover:text-blue-600 transition-all duration-300 hover:bg-blue-50/80 backdrop-blur-sm"
            >
              <span class="flex items-center space-x-2">
                <span class="text-lg opacity-0 group-hover:opacity-100 transform translate-x-2 group-hover:translate-x-0 transition-all duration-300">{item.icon}</span>
                <span class="text-base">{item.name}</span>
              </span>
              <!-- Enhanced hover indicator -->
              <div class="absolute bottom-1 left-1/2 w-0 h-1 bg-gradient-to-r from-blue-500 to-teal-500 rounded-full group-hover:w-10 group-hover:left-1/2 group-hover:-translate-x-1/2 transition-all duration-300"></div>
            </a>
          {/each}
        </div>

        <!-- Enhanced CTA Button with better visibility -->
        <div class="hidden lg:flex items-center space-x-4">
          <a 
            href="/contact" 
            class="group relative bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/30 hover:-translate-y-1 overflow-hidden border-2 border-white/20"
          >
            <!-- Animated background -->
            <div class="absolute inset-0 bg-gradient-to-r from-teal-600 via-blue-700 to-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div class="relative flex items-center space-x-3">
              <span class="text-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-transform duration-300">📅</span>
              <span class="font-bold">Book Now</span>
            </div>
            <!-- Enhanced shine effect -->
            <div class="absolute inset-0 -top-2 -bottom-2 bg-gradient-to-r from-transparent via-white/30 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
            <!-- Pulse ring -->
            <div class="absolute inset-0 rounded-2xl border-2 border-white/30 group-hover:border-white/50 group-hover:scale-105 transition-all duration-500"></div>
          </a>
        </div>

        <!-- Enhanced Mobile Menu Button & CTA -->
        <div class="lg:hidden flex items-center space-x-3">
          <!-- Mobile CTA -->
          <a 
            href="/contact"
            class="bg-gradient-to-r from-blue-600 to-teal-600 text-white px-4 py-2.5 rounded-xl font-bold text-sm hover:shadow-lg transition-all duration-300 flex items-center space-x-2"
          >
            <span>Book</span>
          </a>
          
          <!-- Mobile Menu Button -->
          <button
            on:click={toggleMobileMenu}
            class="relative p-3 rounded-2xl bg-gradient-to-br from-blue-50 to-teal-50 hover:from-blue-100 hover:to-teal-100 transition-all duration-300 group shadow-lg border border-blue-200/50"
            aria-label="Toggle menu"
          >
            <div class="w-6 h-6 relative">
              <span class="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full transition-all duration-300 {mobileMenuOpen ? 'rotate-45 translate-y-2.5' : 'rotate-0 translate-y-0'}"></span>
              <span class="absolute top-2.5 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full transition-all duration-300 {mobileMenuOpen ? 'opacity-0' : 'opacity-100'}"></span>
              <span class="absolute top-5 left-0 w-full h-0.5 bg-gradient-to-r from-blue-600 to-teal-600 rounded-full transition-all duration-300 {mobileMenuOpen ? '-rotate-45 -translate-y-2.5' : 'rotate-0 translate-y-0'}"></span>
            </div>
          </button>
        </div>
      </div>

      <!-- Enhanced Mobile Navigation -->
      {#if mobileMenuOpen}
        <div class="lg:hidden absolute top-full left-0 right-0 bg-white/95 backdrop-blur-2xl border-b border-gray-200/50 shadow-2xl">
          <div class="px-4 py-8 space-y-3">
            {#each [
              { name: 'Services', href: '#services', icon: '🏥', desc: 'Our dental treatments' },
              { name: 'Promotions', href: '#promotions', icon: '🎉', desc: 'Special offers & deals' },
              { name: 'About', href: '#about', icon: '👥', desc: 'Meet our team' },
              { name: 'Contact', href: '#contact', icon: '📍', desc: 'Visit our clinic' }
            ] as item}
              <a 
                href={item.href} 
                on:click={closeMobileMenu}
                class="group flex items-center space-x-4 px-6 py-4 rounded-2xl font-semibold text-gray-700 hover:text-blue-600 hover:bg-gradient-to-r hover:from-blue-50 hover:to-teal-50 transition-all duration-300 border border-transparent hover:border-blue-200/50"
              >
                <div class="w-12 h-12 bg-gradient-to-br from-blue-100 to-teal-100 rounded-2xl flex items-center justify-center group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                  <span class="text-2xl">{item.icon}</span>
                </div>
                <div class="flex-1">
                  <div class="text-lg font-bold">{item.name}</div>
                  <div class="text-sm text-gray-500">{item.desc}</div>
                </div>
                <div class="text-blue-400 transform group-hover:translate-x-1 transition-transform duration-300">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                  </svg>
                </div>
              </a>
            {/each}
            
            <!-- Mobile CTA - Enhanced -->
            <div class="pt-6 border-t border-gray-200/50">
              <a 
                href="/contact" 
                on:click={closeMobileMenu}
                class="group block w-full bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 text-white text-center py-5 px-6 rounded-2xl font-bold text-xl transition-all duration-300 hover:shadow-2xl hover:-translate-y-1 relative overflow-hidden"
              >
                <!-- Background animation -->
                <div class="absolute inset-0 bg-gradient-to-r from-teal-600 via-blue-700 to-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div class="relative flex items-center justify-center space-x-3">
                  <span class="text-3xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">📅</span>
                  <span>Book Your Appointment</span>
                </div>
                <!-- Shine effect -->
                <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              </a>
            </div>
          </div>
        </div>
      {/if}
    </div>
  </div>
</nav>

<!-- Hero Section with Advanced Design -->
<section class="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-blue-50 via-white to-teal-50">
  
  <!-- Animated Background Elements -->
  <div class="absolute inset-0 overflow-hidden">
    <!-- Floating geometric shapes -->
    <div class="absolute top-20 left-10 w-72 h-72 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-3xl animate-float"></div>
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-gradient-to-tl from-teal-200/20 to-transparent rounded-full blur-3xl animate-float" style="animation-delay: 2s;"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-100/10 via-teal-100/10 to-blue-100/10 rounded-full blur-3xl animate-pulse-subtle"></div>
    
    <!-- Dental pattern overlay -->
    <div class="absolute inset-0 dental-pattern opacity-30"></div>
    
    <!-- Gradient mesh -->
    <div class="absolute top-0 right-0 w-1/2 h-1/2 bg-gradient-to-bl from-blue-400/10 to-transparent"></div>
    <div class="absolute bottom-0 left-0 w-1/2 h-1/2 bg-gradient-to-tr from-teal-400/10 to-transparent"></div>
  </div>

  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center min-h-[80vh]">
      
      <!-- Content Column -->
      <div class="text-center lg:text-left space-y-8">
        
        <!-- Trust Badge -->
        <div class="inline-flex items-center px-4 py-2 bg-white/80 backdrop-blur-sm rounded-full border border-blue-200/50 shadow-lg animate-fade-in-up">
          <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse mr-3"></div>
          <span class="text-sm font-semibold text-blue-800">Auckland's Premier Dental Clinic</span>
          <span class="ml-2">⭐⭐⭐⭐⭐</span>
        </div>
        
        <!-- Main Headline -->
        <div class="space-y-6">
          <h1 class="text-5xl sm:text-6xl lg:text-7xl font-bold leading-tight">
            <span class="block text-gray-900 animate-fade-in-up">Your Perfect</span>
            <span class="block bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 bg-clip-text text-transparent animate-fade-in-up" style="animation-delay: 0.1s;">
              Smile Awaits
            </span>
          </h1>
          
          <p class="text-xl sm:text-2xl text-gray-600 leading-relaxed max-w-2xl animate-fade-in-up" style="animation-delay: 0.2s;">
            Experience next-generation dental care with <span class="font-semibold text-blue-700">cutting-edge technology</span>, 
            <span class="font-semibold text-teal-700">personalized treatment</span>, and a team that truly cares about your comfort.
          </p>
        </div>
        
        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 sm:gap-6 animate-fade-in-up" style="animation-delay: 0.3s;">
          <a 
            href="/contact" 
            class="group relative bg-gradient-to-r from-blue-600 via-blue-700 to-teal-600 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-500 hover:shadow-2xl hover:shadow-blue-500/25 hover:-translate-y-2 overflow-hidden"
          >
            <!-- Animated background -->
            <div class="absolute inset-0 bg-gradient-to-r from-teal-600 via-blue-700 to-blue-600 opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
            <div class="relative flex items-center justify-center space-x-3">
              <span class="text-2xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">🚀</span>
              <span>Book Your Visit</span>
            </div>
            <!-- Shine effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
          </a>
          
          <a 
            href="#services" 
            class="group bg-white/80 backdrop-blur-sm border-2 border-blue-200 text-blue-700 px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:bg-blue-50 hover:border-blue-300 hover:shadow-xl hover:-translate-y-1"
          >
            <div class="flex items-center justify-center space-x-3">
              <span class="text-2xl transform group-hover:scale-110 transition-all duration-300">🔍</span>
              <span>Explore Services</span>
            </div>
          </a>
        </div>
        
        <!-- Stats Row -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-6 pt-8 animate-fade-in-up" style="animation-delay: 0.4s;">
          {#each stats as stat}
            <div class="text-center group cursor-pointer">
              <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-4 border border-blue-100 shadow-lg group-hover:shadow-xl group-hover:-translate-y-1 transition-all duration-300">
                <div class="text-3xl mb-2 transform group-hover:scale-110 transition-all duration-300">{stat.icon}</div>
                <div class="text-2xl sm:text-3xl font-bold text-blue-700 mb-1">{stat.number}</div>
                <div class="text-sm text-gray-600 font-medium">{stat.label}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- Visual Column -->
      <div class="relative animate-fade-in-up" style="animation-delay: 0.5s;">
        
        <!-- Main Image Container -->
        <div class="relative group">
          <!-- Floating elements around the main visual -->
          <div class="absolute -top-8 -left-8 w-24 h-24 bg-gradient-to-br from-blue-400 to-blue-500 rounded-3xl shadow-2xl transform rotate-12 group-hover:rotate-6 transition-all duration-500 flex items-center justify-center">
            <span class="text-white text-3xl transform -rotate-12">🦷</span>
          </div>
          
          <div class="absolute -bottom-6 -right-6 w-32 h-32 bg-gradient-to-br from-teal-400 to-teal-500 rounded-full shadow-2xl transform group-hover:scale-110 transition-all duration-500 flex items-center justify-center">
            <span class="text-white text-4xl">✨</span>
          </div>
          
          <div class="absolute top-1/2 -left-12 w-16 h-16 bg-gradient-to-br from-green-400 to-green-500 rounded-2xl shadow-xl transform -rotate-12 group-hover:rotate-0 transition-all duration-500 flex items-center justify-center">
            <span class="text-white text-2xl transform rotate-12">💚</span>
          </div>
          
          <!-- Main Visual -->
          <div class="relative bg-white rounded-3xl shadow-2xl shadow-blue-500/20 p-8 border border-blue-100 group-hover:shadow-3xl group-hover:shadow-blue-500/30 transition-all duration-500">
            <!-- Glow effect -->
            <div class="absolute inset-0 bg-gradient-to-br from-blue-400/20 to-teal-400/20 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-all duration-500 -z-10"></div>
            
            <!-- Content -->
            <div class="space-y-6">
              <!-- Header -->
              <div class="text-center">
                <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl shadow-xl mx-auto mb-4 flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
                  <span class="text-white text-3xl">🏥</span>
                </div>
                <h3 class="text-2xl font-bold text-gray-900 mb-2">Modern Dental Care</h3>
                <p class="text-gray-600">State-of-the-art facility</p>
              </div>
              
              <!-- Features -->
              <div class="space-y-4">
                {#each [
                  { icon: '🔬', text: 'Advanced Technology' },
                  { icon: '👨‍⚕️', text: 'Expert Dentists' },
                  { icon: '💎', text: 'Premium Materials' },
                  { icon: '🛡️', text: 'Safe & Hygienic' }
                ] as feature}
                  <div class="flex items-center space-x-4 bg-blue-50 rounded-xl p-3 group/item hover:bg-blue-100 transition-all duration-300">
                    <div class="w-10 h-10 bg-white rounded-xl shadow-md flex items-center justify-center group-hover/item:scale-110 transition-all duration-300">
                      <span class="text-lg">{feature.icon}</span>
                    </div>
                    <span class="font-medium text-gray-800">{feature.text}</span>
                  </div>
                {/each}
              </div>
              
              <!-- Progress bars -->
              <div class="space-y-3">
                {#each [
                  { label: 'Patient Satisfaction', value: 99 },
                  { label: 'Treatment Success', value: 98 },
                  { label: 'Modern Equipment', value: 100 }
                ] as metric}
                  <div>
                    <div class="flex justify-between text-sm font-medium text-gray-700 mb-1">
                      <span>{metric.label}</span>
                      <span>{metric.value}%</span>
                    </div>
                    <div class="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        class="h-full bg-gradient-to-r from-blue-500 to-teal-500 rounded-full transition-all duration-1000 ease-out"
                        style="width: {metric.value}%"
                      ></div>
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  
  <!-- Scroll Indicator -->
  <div class="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
    <div class="w-6 h-10 border-2 border-blue-400 rounded-full flex justify-center">
      <div class="w-1 h-3 bg-blue-400 rounded-full mt-2 animate-pulse"></div>
    </div>
  </div>
</section>

<!-- Enhanced Services Section -->
<section id="services" class="py-24 bg-white scroll-animate">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <!-- Section Header -->
    <div class="text-center mb-20">
      <div class="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold mb-6">
        <span class="mr-2">🏥</span>
        <span>Our Expertise</span>
      </div>
      <h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
        Comprehensive 
        <span class="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Dental Care</span>
      </h2>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        From routine cleanings to complex procedures, we offer the complete spectrum of dental services 
        using the latest technology and techniques.
      </p>
    </div>
    
    <!-- Services Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      <!-- General Dentistry -->
      <div class="group relative bg-white rounded-3xl p-8 shadow-xl shadow-blue-500/10 border border-blue-100 hover:shadow-2xl hover:shadow-blue-500/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
        <!-- Background gradient -->
        <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
        
        <!-- Floating icon -->
        <div class="relative mb-6">
          <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-blue-600 rounded-3xl shadow-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <span class="text-white text-3xl">🦷</span>
          </div>
          <!-- Glow effect -->
          <div class="absolute inset-0 bg-gradient-to-br from-blue-400 to-blue-600 rounded-3xl blur-lg opacity-0 group-hover:opacity-30 transition-all duration-500 -z-10"></div>
        </div>
        
        <h3 class="text-2xl font-bold text-gray-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">
          General Dentistry
        </h3>
        <p class="text-gray-600 mb-6 leading-relaxed">
          Comprehensive oral health care including cleanings, examinations, fillings, and preventive treatments.
        </p>
        
        <!-- Features list -->
        <ul class="space-y-3 mb-8">
          {#each [
            'Regular checkups & cleanings',
            'Digital X-rays & diagnostics',
            'Fluoride treatments',
            'Cavity prevention & fillings'
          ] as feature}
            <li class="flex items-center text-sm text-gray-700">
              <div class="w-2 h-2 bg-blue-500 rounded-full mr-3"></div>
              <span>{feature}</span>
            </li>
          {/each}
        </ul>
        
        <!-- CTA -->
        <a 
          href="/contact" 
          class="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors group/cta"
        >
          <span>Learn More</span>
          <span class="ml-2 transform group-hover/cta:translate-x-1 transition-transform duration-300">→</span>
        </a>
      </div>
      
      <!-- Cosmetic Dentistry -->
      <div class="group relative bg-white rounded-3xl p-8 shadow-xl shadow-teal-500/10 border border-teal-100 hover:shadow-2xl hover:shadow-teal-500/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden">
        <!-- Background gradient -->
        <div class="absolute inset-0 bg-gradient-to-br from-teal-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
        
        <div class="relative mb-6">
          <div class="w-20 h-20 bg-gradient-to-br from-teal-500 to-teal-600 rounded-3xl shadow-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <span class="text-white text-3xl">✨</span>
          </div>
          <div class="absolute inset-0 bg-gradient-to-br from-teal-400 to-teal-600 rounded-3xl blur-lg opacity-0 group-hover:opacity-30 transition-all duration-500 -z-10"></div>
        </div>
        
        <h3 class="text-2xl font-bold text-gray-900 mb-4 group-hover:text-teal-700 transition-colors duration-300">
          Cosmetic Dentistry
        </h3>
        <p class="text-gray-600 mb-6 leading-relaxed">
          Transform your smile with professional whitening, veneers, and aesthetic treatments.
        </p>
        
        <ul class="space-y-3 mb-8">
          {#each [
            'Professional teeth whitening',
            'Porcelain veneers',
            'Smile makeovers',
            'Bonding & contouring'
          ] as feature}
            <li class="flex items-center text-sm text-gray-700">
              <div class="w-2 h-2 bg-teal-500 rounded-full mr-3"></div>
              <span>{feature}</span>
            </li>
          {/each}
        </ul>
        
        <a 
          href="/contact" 
          class="inline-flex items-center text-teal-600 font-semibold hover:text-teal-700 transition-colors group/cta"
        >
          <span>Learn More</span>
          <span class="ml-2 transform group-hover/cta:translate-x-1 transition-transform duration-300">→</span>
        </a>
      </div>
      
      <!-- Emergency Care -->
      <div class="group relative bg-white rounded-3xl p-8 shadow-xl shadow-red-500/10 border border-red-100 hover:shadow-2xl hover:shadow-red-500/20 transition-all duration-500 hover:-translate-y-2 overflow-hidden md:col-span-2 lg:col-span-1">
        <!-- Background gradient -->
        <div class="absolute inset-0 bg-gradient-to-br from-red-50/50 to-transparent opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
        
        <div class="relative mb-6">
          <div class="w-20 h-20 bg-gradient-to-br from-red-500 to-red-600 rounded-3xl shadow-xl flex items-center justify-center transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <span class="text-white text-3xl">🚨</span>
          </div>
          <div class="absolute inset-0 bg-gradient-to-br from-red-400 to-red-600 rounded-3xl blur-lg opacity-0 group-hover:opacity-30 transition-all duration-500 -z-10"></div>
        </div>
        
        <h3 class="text-2xl font-bold text-gray-900 mb-4 group-hover:text-red-700 transition-colors duration-300">
          Emergency Care
        </h3>
        <p class="text-gray-600 mb-6 leading-relaxed">
          24/7 urgent dental care when you need it most, with same-day appointments available.
        </p>
        
        <ul class="space-y-3 mb-8">
          {#each [
            '24/7 emergency hotline',
            'Same-day appointments',
            'Pain management',
            'Trauma & injury care'
          ] as feature}
            <li class="flex items-center text-sm text-gray-700">
              <div class="w-2 h-2 bg-red-500 rounded-full mr-3"></div>
              <span>{feature}</span>
            </li>
          {/each}
        </ul>
        
        <a 
          href="tel:+6491234568" 
          class="inline-flex items-center text-red-600 font-semibold hover:text-red-700 transition-colors group/cta"
        >
          <span>Emergency Call</span>
          <span class="ml-2 transform group-hover/cta:translate-x-1 transition-transform duration-300">→</span>
        </a>
      </div>
    </div>
  </div>
</section>

<!-- Technology Showcase -->
<section class="py-24 bg-gradient-to-br from-gray-50 to-blue-50 scroll-animate">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="text-center mb-20">
      <div class="inline-flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-full font-semibold mb-6">
        <span class="mr-2">🔬</span>
        <span>Advanced Technology</span>
      </div>
      <h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
        State-of-the-Art 
        <span class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Equipment</span>
      </h2>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        We invest in the latest dental technology to provide you with the most accurate, 
        comfortable, and effective treatments available.
      </p>
    </div>
    
    <!-- Technology Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
      {#each [
        { icon: '📱', title: 'Digital Imaging', desc: 'High-resolution intraoral cameras' },
        { icon: '🔬', title: 'Laser Dentistry', desc: 'Precise, minimally invasive treatments' },
        { icon: '🖥️', title: '3D Scanning', desc: 'Accurate digital impressions' },
        { icon: '⚡', title: 'Painless Injections', desc: 'Computer-controlled anesthesia' }
      ] as tech}
        <div class="group bg-white rounded-2xl p-6 shadow-lg hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-gray-100">
          <div class="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl shadow-lg flex items-center justify-center mb-4 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <span class="text-white text-2xl">{tech.icon}</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-2">{tech.title}</h3>
          <p class="text-gray-600 text-sm">{tech.desc}</p>
        </div>
      {/each}
    </div>
  </div>
</section>

<!-- Testimonials Carousel -->
<section class="py-24 bg-white scroll-animate">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="text-center mb-20">
      <div class="inline-flex items-center px-4 py-2 bg-green-100 text-green-800 rounded-full font-semibold mb-6">
        <span class="mr-2">💬</span>
        <span>Patient Stories</span>
      </div>
      <h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
        What Our Patients 
        <span class="bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">Say</span>
      </h2>
    </div>
    
    <!-- Testimonial Cards -->
    <div class="relative max-w-4xl mx-auto">
      <div class="bg-gradient-to-br from-blue-50 to-teal-50 rounded-3xl p-8 md:p-12 shadow-2xl border border-blue-100">
        
        {#each testimonials as testimonial, i}
          <div class="testimonial-slide {i === currentTestimonial ? 'active' : 'inactive'} text-center">
            
            <!-- Avatar -->
            <div class="w-20 h-20 bg-gradient-to-br from-blue-500 to-teal-500 rounded-full shadow-xl mx-auto mb-6 flex items-center justify-center transform transition-all duration-500">
              <span class="text-white text-3xl">{testimonial.image}</span>
            </div>
            
            <!-- Stars -->
            <div class="flex justify-center mb-6">
              {#each Array(testimonial.rating) as _}
                <span class="text-yellow-400 text-2xl">⭐</span>
              {/each}
            </div>
            
            <!-- Quote -->
            <blockquote class="text-xl md:text-2xl text-gray-700 leading-relaxed mb-6 font-medium">
              "{testimonial.content}"
            </blockquote>
            
            <!-- Author -->
            <div>
              <div class="font-bold text-gray-900 text-lg">{testimonial.name}</div>
              <div class="text-gray-600">{testimonial.role}</div>
            </div>
          </div>
        {/each}
        
        <!-- Navigation Dots -->
        <div class="flex justify-center mt-8 space-x-2">
          {#each testimonials as _, i}
            <button 
              class="w-3 h-3 rounded-full transition-all duration-300 {i === currentTestimonial ? 'bg-blue-500' : 'bg-gray-300'}"
              on:click={() => currentTestimonial = i}
            ></button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Promotions Section -->
<section id="promotions" class="py-24 bg-gradient-to-br from-orange-50 to-red-50 scroll-animate">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="text-center mb-20">
      <div class="inline-flex items-center px-4 py-2 bg-orange-100 text-orange-800 rounded-full font-semibold mb-6">
        <span class="mr-2">🎉</span>
        <span>Special Offers</span>
      </div>
      <h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
        Current 
        <span class="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Promotions</span>
      </h2>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Take advantage of our special offers and make quality dental care more affordable.
      </p>
    </div>

    {#if loading}
      <div class="flex justify-center">
        <div class="text-center">
          <div class="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-gray-600">Loading current promotions...</p>
        </div>
      </div>
    {:else if promos.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each promos as promo}
          <div class="group bg-white rounded-3xl p-8 shadow-xl hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 border border-orange-100 relative overflow-hidden">
            
            <!-- Decorative elements -->
            <div class="absolute top-4 right-4 w-12 h-12 bg-gradient-to-br from-orange-400 to-red-400 rounded-full flex items-center justify-center transform rotate-12 group-hover:rotate-0 transition-all duration-500">
              <span class="text-white text-xl transform -rotate-12 group-hover:rotate-0 transition-all duration-500">🎁</span>
            </div>
            
            <div class="mb-6">
              <h3 class="text-2xl font-bold text-gray-900 mb-3 group-hover:text-orange-700 transition-colors duration-300">
                {promo.title}
              </h3>
              <div class="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-semibold">
                <span class="mr-1">⏰</span>
                <span>Valid until {formatDisplayDate(promo.validUntil)}</span>
              </div>
            </div>
            
            <p class="text-gray-600 mb-6 leading-relaxed">{promo.description}</p>
            
            <a 
              href="/contact" 
              class="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white px-6 py-3 rounded-2xl font-semibold hover:from-orange-600 hover:to-red-600 transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
            >
              <span class="mr-2">🚀</span>
              <span>Book This Offer</span>
            </a>
          </div>
        {/each}
      </div>
    {:else}
      <div class="bg-white rounded-3xl p-16 text-center shadow-xl border border-orange-100">
        <div class="text-gray-400 text-8xl mb-8 animate-pulse">🎉</div>
        <h3 class="text-3xl font-bold text-gray-900 mb-4">New Promotions Coming Soon!</h3>
        <p class="text-gray-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
          We're preparing exciting offers for our patients. Check back soon or book your appointment to stay updated.
        </p>
        <a 
          href="/contact" 
          class="bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 hover:shadow-xl hover:-translate-y-1 inline-flex items-center"
        >
          <span class="mr-2">📅</span>
          <span>Book Appointment</span>
        </a>
      </div>
    {/if}
  </div>
</section>

<!-- Contact Section -->
<section id="contact" class="py-24 bg-white scroll-animate">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="text-center mb-20">
      <div class="inline-flex items-center px-4 py-2 bg-blue-100 text-blue-800 rounded-full font-semibold mb-6">
        <span class="mr-2">📍</span>
        <span>Get In Touch</span>
      </div>
      <h2 class="text-4xl sm:text-5xl lg:text-6xl font-bold text-gray-900 mb-6">
        Visit Our Modern 
        <span class="bg-gradient-to-r from-blue-600 to-teal-600 bg-clip-text text-transparent">Clinic</span>
      </h2>
      <p class="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
        Experience our state-of-the-art facility with convenient hours, easy booking, and a comfortable environment.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      
      <!-- Contact Cards -->
      <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- Location -->
        <div class="group bg-gradient-to-br from-blue-50 to-blue-100 rounded-3xl p-8 border border-blue-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <div class="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-lg flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <span class="text-white text-2xl">📍</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Our Location</h3>
          <div class="space-y-2 text-gray-700 mb-6">
            <p class="font-semibold">123 Dental Avenue</p>
            <p>Auckland, New Zealand</p>
            <p>1010 New Zealand</p>
          </div>
          <a 
            href="https://maps.google.com/?q=123+Dental+Avenue+Auckland+New+Zealand" 
            target="_blank" 
            rel="noopener noreferrer"
            class="inline-flex items-center text-blue-600 font-semibold hover:text-blue-700 transition-colors group/link"
          >
            <span class="mr-2">🗺️</span>
            <span>View on Google Maps</span>
            <span class="ml-2 transform group-hover/link:translate-x-1 transition-transform duration-300">→</span>
          </a>
        </div>

        <!-- Hours -->
        <div class="group bg-gradient-to-br from-teal-50 to-teal-100 rounded-3xl p-8 border border-teal-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <div class="w-16 h-16 bg-gradient-to-br from-teal-500 to-teal-600 rounded-2xl shadow-lg flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <span class="text-white text-2xl">🕒</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Opening Hours</h3>
          <div class="space-y-3 text-gray-700">
            <div class="flex justify-between items-center">
              <span>Monday - Friday</span>
              <span class="font-semibold">8:00 AM - 6:00 PM</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Saturday</span>
              <span class="font-semibold">9:00 AM - 4:00 PM</span>
            </div>
            <div class="flex justify-between items-center">
              <span>Sunday</span>
              <span class="font-semibold text-gray-500">Closed</span>
            </div>
          </div>
        </div>

        <!-- Phone -->
        <div class="group bg-gradient-to-br from-green-50 to-green-100 rounded-3xl p-8 border border-green-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <div class="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl shadow-lg flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <span class="text-white text-2xl">📞</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Contact Numbers</h3>
          <div class="space-y-4 text-gray-700">
            <div>
              <a href="tel:+6491234567" class="text-xl font-bold text-green-600 hover:text-green-700 transition-colors block">
                (09) 123-4567
              </a>
              <p class="text-sm text-gray-600">General appointments</p>
            </div>
            <div>
              <a href="mailto:hello@auroradentica.co.nz" class="font-semibold text-green-600 hover:text-green-700 transition-colors block">
                hello@auroradentica.co.nz
              </a>
              <p class="text-sm text-gray-600">Email inquiries</p>
            </div>
          </div>
        </div>

        <!-- Emergency -->
        <div class="group bg-gradient-to-br from-red-50 to-red-100 rounded-3xl p-8 border border-red-200 hover:shadow-2xl transition-all duration-500 hover:-translate-y-2">
          <div class="w-16 h-16 bg-gradient-to-br from-red-500 to-red-600 rounded-2xl shadow-lg flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-500">
            <span class="text-white text-2xl">🚨</span>
          </div>
          <h3 class="text-2xl font-bold text-gray-900 mb-4">Emergency Care</h3>
          <div class="space-y-4 text-gray-700">
            <div>
              <a href="tel:+6491234568" class="text-xl font-bold text-red-600 hover:text-red-700 transition-colors block">
                (09) 123-4568
              </a>
              <p class="text-sm text-red-600 font-semibold">24/7 Emergency Line</p>
            </div>
            <p class="text-sm text-gray-600">
              For urgent dental issues outside regular hours
            </p>
          </div>
        </div>
      </div>

      <!-- Main CTA Card -->
      <div class="bg-gradient-to-br from-blue-600 via-blue-700 to-teal-600 rounded-3xl p-10 text-white relative overflow-hidden shadow-2xl">
        <!-- Background pattern -->
        <div class="absolute inset-0 opacity-10">
          <div class="absolute top-6 right-6 w-24 h-24 border border-white/20 rounded-full"></div>
          <div class="absolute bottom-6 left-6 w-20 h-20 border border-white/20 rounded-full"></div>
          <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 border border-white/10 rounded-full"></div>
        </div>
        
        <div class="relative z-10 space-y-8">
          <div>
            <h3 class="text-3xl font-bold mb-4">Ready to Transform Your Smile?</h3>
            <p class="text-blue-100 leading-relaxed text-lg">
              Book your appointment through Facebook Messenger for quick and easy scheduling. 
              Our team responds within hours to confirm your preferred time.
            </p>
          </div>
          
          <a 
            href="/contact" 
            class="group block w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-center py-6 px-8 rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 border border-white/30"
          >
            <div class="flex items-center justify-center space-x-3">
              <span class="text-3xl transform group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">💬</span>
              <span>Book via Messenger</span>
            </div>
          </a>
          
          <div class="pt-8 border-t border-white/20">
            <p class="text-blue-100 mb-4 font-semibold">Follow us for updates and tips:</p>
            <a 
              href="https://facebook.com/auroradentica" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center space-x-3 text-white hover:text-blue-100 transition-colors font-semibold group/social"
            >
              <span class="text-2xl">📘</span>
              <span>Aurora Dentica on Facebook</span>
              <span class="transform group-hover/social:translate-x-1 transition-transform duration-300">→</span>
            </a>
          </div>

          <!-- Trust badges -->
          <div class="flex flex-wrap gap-4 pt-6">
            {#each [
              { icon: '🛡️', text: 'Secure Booking' },
              { icon: '⚡', text: 'Quick Response' },
              { icon: '👨‍⚕️', text: 'Expert Care' }
            ] as badge}
              <div class="flex items-center gap-2 bg-white/10 rounded-xl px-4 py-2 border border-white/20">
                <span class="text-lg">{badge.icon}</span>
                <span class="text-sm font-medium">{badge.text}</span>
              </div>
            {/each}
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Footer -->
<footer class="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white py-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
      
      <!-- Company Info -->
      <div class="lg:col-span-2">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-14 h-14 bg-gradient-to-br from-blue-500 to-teal-500 rounded-2xl flex items-center justify-center shadow-xl">
            <span class="text-white font-bold text-xl">AD</span>
          </div>
          <div>
            <h5 class="text-2xl font-bold text-white">Aurora Dentica</h5>
            <p class="text-gray-300">Professional Dental Care</p>
          </div>
        </div>
        <p class="text-gray-300 mb-8 leading-relaxed max-w-md text-lg">
          Providing exceptional dental care with modern technology, experienced professionals, 
          and a commitment to your oral health and beautiful smile.
        </p>
        <div class="flex space-x-4">
          <a href="https://facebook.com/auroradentica" target="_blank" rel="noopener noreferrer" 
             class="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110">
            <span class="text-xl">📘</span>
          </a>
          <a href="mailto:hello@auroradentica.co.nz" 
             class="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110">
            <span class="text-xl">✉️</span>
          </a>
          <a href="tel:+6491234567" 
             class="w-12 h-12 bg-white/10 hover:bg-white/20 rounded-2xl flex items-center justify-center transition-all duration-300 hover:scale-110">
            <span class="text-xl">📞</span>
          </a>
        </div>
      </div>

      <!-- Quick Links -->
      <div>
        <h6 class="font-bold text-xl mb-8 text-white">Quick Links</h6>
        <ul class="space-y-4">
          {#each [
            { name: 'Services', href: '#services' },
            { name: 'Promotions', href: '#promotions' },
            { name: 'Book Appointment', href: '/contact' },
            { name: 'Contact', href: '#contact' }
          ] as link}
            <li>
              <a href={link.href} class="text-gray-300 hover:text-white transition-colors text-lg hover:translate-x-1 transform duration-300 inline-block">
                {link.name}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Contact Info -->
      <div>
        <h6 class="font-bold text-xl mb-8 text-white">Contact Info</h6>
        <ul class="space-y-6 text-gray-300">
          <li class="flex items-start gap-4">
            <span class="text-blue-400 text-2xl">📍</span>
            <div class="text-lg">
              <div class="text-white font-semibold">123 Dental Avenue</div>
              <div>Auckland, New Zealand 1010</div>
            </div>
          </li>
          <li class="flex items-center gap-4">
            <span class="text-blue-400 text-2xl">📞</span>
            <a href="tel:+6491234567" class="hover:text-white transition-colors text-lg font-semibold">
              (09) 123-4567
            </a>
          </li>
          <li class="flex items-center gap-4">
            <span class="text-red-400 text-2xl">🚨</span>
            <a href="tel:+6491234568" class="hover:text-white transition-colors text-lg font-semibold">
              Emergency: (09) 123-4568
            </a>
          </li>
        </ul>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="mt-16 pt-8 border-t border-gray-700">
      <div class="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div class="text-center sm:text-left">
          <span class="text-gray-400 text-lg">© 2024 Aurora Dentica. All rights reserved.</span>
        </div>
        <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-lg text-gray-400">
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
  /* Enhanced animations */
  @keyframes fadeInUp {
    from {
      opacity: 0;
      transform: translateY(30px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes float {
    0%, 100% {
      transform: translateY(0px);
    }
    50% {
      transform: translateY(-20px);
    }
  }

  @keyframes pulse-subtle {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  @keyframes bounce {
    0%, 20%, 53%, 80%, 100% {
      transform: translateY(0);
    }
    40%, 43% {
      transform: translateY(-30px);
    }
    70% {
      transform: translateY(-15px);
    }
    90% {
      transform: translateY(-4px);
    }
  }

  /* Animation classes */
  .animate-fade-in-up {
    animation: fadeInUp 0.8s ease-out forwards;
  }

  .animate-float {
    animation: float 6s ease-in-out infinite;
  }

  .animate-pulse-subtle {
    animation: pulse-subtle 4s ease-in-out infinite;
  }

  /* Testimonial transitions */
  .testimonial-slide {
    transition: all 0.6s ease-in-out;
  }

  .testimonial-slide.active {
    opacity: 1;
    transform: translateX(0);
  }

  .testimonial-slide.inactive {
    opacity: 0;
    transform: translateX(20px);
    position: absolute;
    pointer-events: none;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f5f9;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #0ea5e9, #14b8a6);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #0284c7, #0d9488);
  }

  /* Glass morphism effects */
  .glass-effect {
    background: rgba(255, 255, 255, 0.25);
    backdrop-filter: blur(10px);
    -webkit-backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.18);
  }

  /* Gradient text utilities */
  .text-gradient-blue {
    background: linear-gradient(135deg, #0ea5e9, #14b8a6);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Enhanced hover effects */
  .hover-lift {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .hover-lift:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  /* Smooth scroll behavior */
  html {
    scroll-behavior: smooth;
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    .mobile-center {
      text-align: center;
    }
    
    .mobile-stack {
      flex-direction: column;
    }
    
    .mobile-full {
      width: 100%;
    }
  }

  /* Focus states for accessibility */
  button:focus-visible,
  a:focus-visible {
    outline: 2px solid #0ea5e9;
    outline-offset: 2px;
    border-radius: 0.5rem;
  }

  /* Reduced motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
    
    .animate-bounce,
    .animate-pulse,
    .animate-spin,
    .animate-float {
      animation: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .bg-gradient-to-br {
      background: #ffffff !important;
      border: 2px solid #000000;
    }
    
    .text-gradient {
      background: none !important;
      color: #000000 !important;
      -webkit-text-fill-color: #000000 !important;
    }
  }

  /* Print styles */
  @media print {
    .no-print {
      display: none !important;
    }
    
    * {
      background: white !important;
      color: black !important;
      box-shadow: none !important;
    }
  }

  /* Advanced grid layouts for larger screens */
  @media (min-width: 1920px) {
    .ultra-wide-grid {
      grid-template-columns: repeat(5, 1fr);
    }
  }

  /* Custom selection colors */
  ::selection {
    background: rgba(14, 165, 233, 0.2);
    color: #0f172a;
  }

  ::-moz-selection {
    background: rgba(14, 165, 233, 0.2);
    color: #0f172a;
  }

  /* Loading states */
  .loading-skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: loading 1.5s infinite;
  }

  @keyframes loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* Advanced button hover effects */
  .btn-glow {
    position: relative;
    overflow: hidden;
  }

  .btn-glow::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
    transition: left 0.5s;
  }

  .btn-glow:hover::before {
    left: 100%;
  }

  /* Intersection observer animations */
  .scroll-animate {
    opacity: 0;
    transform: translateY(30px);
    transition: all 0.8s ease-out;
  }

  .scroll-animate.animate-fade-in-up {
    opacity: 1;
    transform: translateY(0);
  }

  /* Enhanced card shadows */
  .card-shadow {
    box-shadow: 
      0 4px 6px -1px rgba(0, 0, 0, 0.1),
      0 2px 4px -1px rgba(0, 0, 0, 0.06),
      0 0 0 1px rgba(0, 0, 0, 0.05);
  }

  .card-shadow-lg {
    box-shadow: 
      0 20px 25px -5px rgba(0, 0, 0, 0.1),
      0 10px 10px -5px rgba(0, 0, 0, 0.04),
      0 0 0 1px rgba(0, 0, 0, 0.05);
  }

  /* Text balance for better typography */
  .text-balance {
    text-wrap: balance;
  }

  /* Container queries support */
  @container (min-width: 768px) {
    .container-md\:grid-cols-2 {
      grid-template-columns: repeat(2, 1fr);
    }
  }

  /* Advanced backdrop filters */
  .backdrop-blur-dental {
    backdrop-filter: blur(10px) saturate(180%);
    -webkit-backdrop-filter: blur(10px) saturate(180%);
  }

  /* Improved focus rings */
  .focus-ring-improved {
    transition: all 0.2s ease-in-out;
  }

  .focus-ring-improved:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.3);
    transform: scale(1.02);
  }

  /* Modern scroll snap */
  .scroll-snap-x {
    scroll-snap-type: x mandatory;
    -webkit-overflow-scrolling: touch;
  }

  .scroll-snap-center {
    scroll-snap-align: center;
  }

  /* Enhanced typography scale */
  .text-fluid-sm {
    font-size: clamp(0.875rem, 0.8rem + 0.375vw, 1rem);
  }

  .text-fluid-base {
    font-size: clamp(1rem, 0.9rem + 0.5vw, 1.125rem);
  }

  .text-fluid-lg {
    font-size: clamp(1.125rem, 1rem + 0.625vw, 1.25rem);
  }

  .text-fluid-xl {
    font-size: clamp(1.25rem, 1.1rem + 0.75vw, 1.5rem);
  }

  .text-fluid-2xl {
    font-size: clamp(1.5rem, 1.3rem + 1vw, 2rem);
  }

  .text-fluid-3xl {
    font-size: clamp(1.875rem, 1.5rem + 1.875vw, 2.25rem);
  }

  .text-fluid-4xl {
    font-size: clamp(2.25rem, 1.8rem + 2.25vw, 3rem);
  }

  .text-fluid-5xl {
    font-size: clamp(3rem, 2.4rem + 3vw, 4rem);
  }

  /* Enhanced spacing system */
  .space-y-fluid > * + * {
    margin-top: clamp(1rem, 0.8rem + 1vw, 2rem);
  }

  /* Modern aspect ratios */
  .aspect-golden {
    aspect-ratio: 1.618 / 1;
  }

  .aspect-cinema {
    aspect-ratio: 21 / 9;
  }

  /* Advanced color mixing */
  .text-mixed {
    color: color-mix(in srgb, #0ea5e9 70%, #14b8a6 30%);
  }

  .bg-mixed {
    background-color: color-mix(in srgb, #0ea5e9 70%, #14b8a6 30%);
  }
</style>