<script lang="ts">
  import { onMount } from 'svelte';
  import { db } from '$lib/firebase/config';
  import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
  import { decrypt } from '$lib/encryption';
  import { formatDisplayDate } from '$lib/utils';
  import Navigation from '$lib/components/Navigation.svelte';
  import Footer from '$lib/components/Footer.svelte';

  interface Promo {
    id: string;
    title: string;
    description: string;
    validUntil: string;
    createdAt: any;
  }

  let promos: Promo[] = [];
  let loading = true;
  let currentTestimonial = 0;

  // Enhanced testimonials
  const testimonials = [
    {
      name: "Dr. Sarah Mitchell",
      role: "Orthodontist",
      content: "Aurora Dentica provides exceptional care with cutting-edge technology. Their commitment to patient comfort is remarkable.",
      rating: 5,
      location: "Remuera, Auckland"
    },
    {
      name: "Marcus Chen",
      role: "Business Professional",
      content: "Outstanding service and genuine care. The team transformed my smile and boosted my confidence.",
      rating: 5,
      location: "CBD, Auckland"
    },
    {
      name: "Emma Thompson",
      role: "Teacher & Mother",
      content: "Finally found a dental clinic my whole family trusts. Professional, gentle, and thorough.",
      rating: 5,
      location: "Ponsonby, Auckland"
    },
    {
      name: "James Rodriguez",
      role: "University Student",
      content: "Great experience as a new patient. The staff explained everything clearly and made me feel at ease.",
      rating: 5,
      location: "Mt Eden, Auckland"
    }
  ];

  // Enhanced statistics
  const stats = [
    { 
      number: "15+", 
      label: "Years Experience", 
      description: "Serving Auckland families"
    },
    { 
      number: "2,500+", 
      label: "Happy Patients", 
      description: "Trust in our care"
    },
    { 
      number: "98%", 
      label: "Satisfaction Rate", 
      description: "Exceptional service"
    },
    { 
      number: "24/7", 
      label: "Emergency Care", 
      description: "Always here for you"
    }
  ];

  onMount(async () => {
    await loadPromos();
    startTestimonialRotation();
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
    }, 7000);
  }
</script>

<svelte:head>
  <title>Aurora Dentica - Modern Dental Care Excellence in Auckland</title>
  <meta name="description" content="Experience exceptional dental care at Aurora Dentica. Modern treatments, advanced technology, and personalized service for your oral health needs in Auckland." />
  <meta name="keywords" content="dental care, dentist Auckland, teeth cleaning, dental checkup, oral health, dental clinic, modern dentistry" />
</svelte:head>

<Navigation />

<!-- Hero Section -->
<section class="relative min-h-screen flex items-center overflow-hidden bg-gradient-to-br from-stone-50 via-amber-50/30 to-orange-50/20">
  <!-- Geometric Background -->
  <div class="absolute inset-0">
    <div class="absolute top-20 left-20 w-96 h-96 bg-gradient-to-br from-amber-600/10 to-orange-600/10 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-20 right-20 w-80 h-80 bg-gradient-to-br from-stone-800/10 to-amber-800/10 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-amber-300/5 to-stone-300/5 rounded-full blur-3xl"></div>
  </div>

  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      
      <!-- Content Column -->
      <div class="text-center lg:text-left space-y-8">
        
        <!-- Trust Badge -->
        <div class="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-amber-200/50">
          <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
          <span class="font-semibold text-stone-700">Auckland's Premier Dental Practice Since 2009</span>
        </div>
        
        <!-- Main Headline -->
        <div class="space-y-6">
          <h1 class="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
            <span class="block text-stone-900">Excellence in</span>
            <span class="block bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 bg-clip-text text-transparent">Dental Care</span>
          </h1>
          <div class="w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full mx-auto lg:mx-0"></div>
        </div>
        
        <p class="text-xl lg:text-2xl text-stone-600 leading-relaxed max-w-2xl">
          Experience comprehensive dental care with our team of qualified professionals. 
          We combine advanced technology with personalized treatment for optimal oral health.
        </p>
        
        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-6 pt-4">
          <a 
            href="/contact" 
            class="group relative overflow-hidden bg-gradient-to-r from-amber-700 via-orange-700 to-amber-800 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3"
          >
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <svg class="relative w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 012 0v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H4a1 1 0 110-2h4z"/>
            </svg>
            <span class="relative">Schedule Consultation</span>
          </a>
          <a 
            href="#services" 
            class="group bg-white/80 backdrop-blur-sm text-stone-700 border-2 border-stone-200 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3"
          >
            <svg class="w-6 h-6 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
            </svg>
            <span>Explore Services</span>
          </a>
        </div>
        
        <!-- Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          {#each stats as stat}
            <div class="group text-center">
              <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-stone-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div class="text-3xl font-bold text-stone-900 mb-2">{stat.number}</div>
                <div class="text-sm font-semibold text-stone-600 mb-1">{stat.label}</div>
                <div class="text-xs text-stone-500">{stat.description}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- Visual Column -->
      <div class="relative lg:pl-8">
        <div class="relative">
          <!-- Main card -->
          <div class="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-stone-200/50">
            
            <!-- Header -->
            <div class="text-center mb-8">
              <div class="w-20 h-20 bg-gradient-to-r from-amber-700 to-orange-700 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <h3 class="text-2xl font-bold text-stone-900 mb-3">Professional Excellence</h3>
              <p class="text-stone-600">Trusted by thousands of Auckland families</p>
            </div>
            
            <!-- Features */
            <div class="space-y-4 mb-8">
              {#each [
                { text: 'Licensed Dental Professionals', color: 'text-amber-700' },
                { text: 'Advanced Technology', color: 'text-orange-700' },
                { text: 'Sterilization Protocols', color: 'text-stone-700' },
                { text: 'Patient-Centered Care', color: 'text-amber-600' }
              ] as feature}
                <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-stone-50 to-amber-50 rounded-2xl border border-stone-200/50 hover:shadow-md transition-all duration-300 group">
                  <div class="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <svg class="w-6 h-6 {feature.color}" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                    </svg>
                  </div>
                  <span class="font-semibold {feature.color} text-lg">{feature.text}</span>
                </div>
              {/each}
            </div>
            
            <!-- Trust indicators -->
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50">
                <div class="text-3xl font-bold text-green-700 mb-1">98%</div>
                <div class="text-sm text-green-600 font-medium">Patient Satisfaction</div>
              </div>
              <div class="text-center p-4 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/50">
                <div class="text-3xl font-bold text-amber-700 mb-1">15+</div>
                <div class="text-sm text-amber-600 font-medium">Years Experience</div>
              </div>
            </div>
          </div>

          <!-- Floating elements -->
          <div class="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl animate-bounce">
            <svg class="w-12 h-12" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
          </div>
          <div class="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-xl shadow-xl animate-pulse">
            <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M9 11H7v2h2v-2zm4 0h-2v2h2v-2zm4 0h-2v2h2v-2zm2-7h-1V2h-2v2H8V2H6v2H5c-1.1 0-1.99.9-1.99 2L3 20c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 16H5V9h14v11z"/>
            </svg>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Services Section -->
<section id="services" class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <!-- Section Header -->
    <div class="text-center mb-20">
      <div class="inline-flex items-center gap-3 bg-amber-50 px-6 py-3 rounded-full mb-8 border border-amber-200">
        <svg class="w-6 h-6 text-amber-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
        </svg>
        <span class="font-semibold text-amber-800">Comprehensive Dental Services</span>
      </div>
      <h2 class="text-4xl lg:text-5xl font-bold text-stone-900 mb-6">
        Modern 
        <span class="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">Dental Care</span>
      </h2>
      <p class="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
        Our experienced team provides comprehensive dental services using cutting-edge techniques 
        and state-of-the-art equipment for optimal patient care.
      </p>
      <div class="w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full mx-auto mt-6"></div>
    </div>
    
    <!-- Services Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      <!-- General & Preventive -->
      <div class="group bg-white rounded-3xl p-8 shadow-lg border border-stone-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div class="relative">
          <div class="w-16 h-16 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-stone-900 mb-4 group-hover:text-amber-700 transition-colors duration-300">General & Preventive</h3>
          <p class="text-stone-600 mb-6 leading-relaxed">
            Comprehensive oral health care including routine cleanings, examinations, 
            and preventive treatments to maintain optimal dental health.
          </p>
          <ul class="space-y-3 mb-8">
            {#each [
              'Professional cleanings',
              'Comprehensive examinations',
              'Fluoride treatments',
              'Oral health education'
            ] as service}
              <li class="flex items-center text-stone-700">
                <div class="w-2 h-2 bg-amber-600 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></div>
                <span class="text-sm font-medium">{service}</span>
              </li>
            {/each}
          </ul>
          <a href="/contact" class="inline-flex items-center gap-2 text-amber-700 font-semibold hover:text-amber-800 transition-colors group-hover:translate-x-2 duration-300">
            <span>Learn More</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
      
      <!-- Cosmetic Dentistry -->
      <div class="group bg-white rounded-3xl p-8 shadow-lg border border-stone-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-amber-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div class="relative">
          <div class="w-16 h-16 bg-gradient-to-r from-orange-600 to-amber-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-stone-900 mb-4 group-hover:text-orange-700 transition-colors duration-300">Cosmetic Dentistry</h3>
          <p class="text-stone-600 mb-6 leading-relaxed">
            Enhance your smile with professional cosmetic treatments designed 
            to improve appearance while maintaining function and health.
          </p>
          <ul class="space-y-3 mb-8">
            {#each [
              'Professional whitening',
              'Porcelain veneers',
              'Cosmetic bonding',
              'Smile design'
            ] as service}
              <li class="flex items-center text-stone-700">
                <div class="w-2 h-2 bg-orange-600 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></div>
                <span class="text-sm font-medium">{service}</span>
              </li>
            {/each}
          </ul>
          <a href="/contact" class="inline-flex items-center gap-2 text-orange-700 font-semibold hover:text-orange-800 transition-colors group-hover:translate-x-2 duration-300">
            <span>Learn More</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
      
      <!-- Emergency Care -->
      <div class="group bg-white rounded-3xl p-8 shadow-lg border border-stone-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-red-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div class="relative">
          <div class="w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg animate-pulse">
            <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"/>
            </svg>
          </div>
          <h3 class="text-2xl font-bold text-stone-900 mb-4 group-hover:text-red-700 transition-colors duration-300">Emergency Care</h3>
          <p class="text-stone-600 mb-6 leading-relaxed">
            Prompt, professional emergency dental care when you need it most, 
            with same-day appointments available for urgent situations.
          </p>
          <ul class="space-y-3 mb-8">
            {#each [
              '24/7 emergency contact',
              'Same-day appointments',
              'Pain management',
              'Urgent treatment'
            ] as service}
              <li class="flex items-center text-stone-700">
                <div class="w-2 h-2 bg-red-600 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></div>
                <span class="text-sm font-medium">{service}</span>
              </li>
            {/each}
          </ul>
          <a href="tel:+6491234568" class="inline-flex items-center gap-2 text-red-700 font-semibold hover:text-red-800 transition-colors group-hover:translate-x-2 duration-300">
            <span>Emergency Contact</span>
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"/>
            </svg>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- About Section -->
<section id="about" class="py-24 bg-gradient-to-br from-stone-50 to-amber-50/30">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      
      <!-- Content -->
      <div class="space-y-8">
        <div class="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-stone-200">
          <svg class="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"/>
          </svg>
          <span class="font-semibold text-stone-700">Meet Our Professional Team</span>
        </div>
        
        <div class="space-y-4">
          <h2 class="text-4xl lg:text-5xl font-bold text-stone-900">
            Experienced
            <span class="block bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">Dental Professionals</span>
          </h2>
          <div class="w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full"></div>
        </div>
        
        <p class="text-xl text-stone-600 leading-relaxed">
          Our qualified team of dental professionals is committed to providing 
          exceptional care using the latest techniques and technology in a 
          comfortable, modern environment.
        </p>
        
        <!-- Professional Features -->
        <div class="space-y-6">
          {#each [
            { title: 'Qualified Professionals', desc: 'Licensed dentists and hygienists with years of experience', color: 'from-amber-600 to-orange-600' },
            { title: 'Modern Technology', desc: 'State-of-the-art equipment for accurate diagnosis and treatment', color: 'from-orange-600 to-red-600' },
            { title: 'Patient-Centered Care', desc: 'Personalized treatment plans focused on your specific needs', color: 'from-stone-600 to-amber-600' }
          ] as feature}
            <div class="flex gap-6 group">
              <div class="w-16 h-16 bg-gradient-to-r {feature.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                </svg>
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-stone-900 mb-3 text-xl">{feature.title}</h4>
                <p class="text-stone-600 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          {/each}
        </div>
        
        <a 
          href="/contact" 
          class="inline-flex items-center gap-3 bg-gradient-to-r from-amber-700 to-orange-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 012 0v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H4a1 1 0 110-2h4z"/>
          </svg>
          <span>Schedule Consultation</span>
        </a>
      </div>
      
      <!-- Professional Credentials -->
      <div class="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-stone-200/50">
        <div class="text-center mb-8">
          <h3 class="text-2xl font-bold text-stone-900 mb-4">Professional Standards</h3>
          <div class="w-16 h-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full mx-auto"></div>
        </div>
        
        <div class="space-y-4 mb-8">
          {#each [
            { label: 'New Zealand Dental Council', status: 'Registered', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Continuing Education', status: 'Current', color: 'text-amber-600', bg: 'bg-amber-50' },
            { label: 'Professional Insurance', status: 'Comprehensive', color: 'text-orange-600', bg: 'bg-orange-50' },
            { label: 'Quality Assurance', status: 'Certified', color: 'text-stone-600', bg: 'bg-stone-50' }
          ] as credential}
            <div class="flex justify-between items-center p-4 {credential.bg} rounded-2xl border border-stone-200/50 hover:shadow-md transition-all duration-300">
              <span class="font-semibold text-stone-900">{credential.label}</span>
              <span class="font-bold {credential.color} px-3 py-1 bg-white rounded-full shadow-sm">{credential.status}</span>
            </div>
          {/each}
        </div>
        
        <div class="text-center p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
          <div class="text-4xl mb-3">
            <svg class="w-16 h-16 mx-auto text-amber-600" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
            </svg>
          </div>
          <div class="font-bold text-amber-800 text-2xl mb-1">15+ Years</div>
          <div class="text-amber-600 font-medium">Professional Experience</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Testimonials Section -->
<section class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="text-center mb-20">
      <div class="inline-flex items-center gap-3 bg-stone-50 px-6 py-3 rounded-full mb-8 border border-stone-200">
        <svg class="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
        </svg>
        <span class="font-semibold text-stone-700">Patient Testimonials</span>
      </div>
      <h2 class="text-4xl lg:text-5xl font-bold text-stone-900 mb-6">
        What Our Patients
        <span class="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">Say</span>
      </h2>
      <div class="w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full mx-auto"></div>
    </div>
    
    <!-- Testimonial Carousel -->
    <div class="max-w-4xl mx-auto relative">
      <div class="bg-white rounded-3xl p-12 shadow-2xl border border-stone-200/50 relative overflow-hidden">
        
        <!-- Background pattern -->
        <div class="absolute inset-0 opacity-5">
          <div class="absolute top-4 right-4 w-32 h-32 bg-amber-400 rounded-full blur-3xl"></div>
          <div class="absolute bottom-4 left-4 w-24 h-24 bg-orange-400 rounded-full blur-2xl"></div>
        </div>
        
        {#each testimonials as testimonial, i}
          <div class="testimonial-slide {i === currentTestimonial ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute inset-0'} transition-all duration-700 ease-in-out p-12">
            
            <!-- Avatar and Rating -->
            <div class="text-center mb-8">
              <div class="w-24 h-24 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl shadow-2xl text-white font-bold">
                {testimonial.name.charAt(0)}
              </div>
              
              <!-- Stars -->
              <div class="flex justify-center mb-4 space-x-1">
                {#each Array(testimonial.rating) as _}
                  <svg class="w-6 h-6 text-amber-400" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                  </svg>
                {/each}
              </div>
            </div>
            
            <!-- Quote -->
            <blockquote class="text-2xl text-stone-700 leading-relaxed mb-8 text-center font-medium italic">
              "{testimonial.content}"
            </blockquote>
            
            <!-- Author Info -->
            <div class="text-center">
              <div class="font-bold text-stone-900 text-xl mb-1">{testimonial.name}</div>
              <div class="text-amber-600 font-medium mb-2">{testimonial.role}</div>
              <div class="text-stone-500 text-sm flex items-center justify-center gap-2">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
                </svg>
                <span>{testimonial.location}</span>
              </div>
            </div>
          </div>
        {/each}
        
        <!-- Navigation Dots -->
        <div class="flex justify-center mt-8 space-x-3">
          {#each testimonials as _, i}
            <button 
              class="w-4 h-4 rounded-full transition-all duration-300 {i === currentTestimonial ? 'bg-amber-600 scale-125' : 'bg-stone-300 hover:bg-stone-400'}"
              on:click={() => currentTestimonial = i}
            ></button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Promotions Section -->
<section id="promotions" class="py-24 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="text-center mb-20">
      <div class="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-8 border border-orange-200">
        <svg class="w-6 h-6 text-orange-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
        </svg>
        <span class="font-semibold text-orange-800">Special Offers</span>
      </div>
      <h2 class="text-4xl lg:text-5xl font-bold text-stone-900 mb-6">
        Current
        <span class="bg-gradient-to-r from-orange-700 to-red-700 bg-clip-text text-transparent">Promotions</span>
      </h2>
      <p class="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
        Take advantage of our professional dental services with these exclusive special offers.
      </p>
      <div class="w-24 h-1 bg-gradient-to-r from-orange-600 to-red-600 rounded-full mx-auto mt-6"></div>
    </div>

    {#if loading}
      <div class="flex justify-center">
        <div class="text-center">
          <div class="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-stone-600 text-lg">Loading current promotions...</p>
        </div>
      </div>
    {:else if promos.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each promos as promo}
          <div class="group bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-stone-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
            
            <!-- Background gradient -->
            <div class="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div class="relative">
              <!-- Promo Header -->
              <div class="mb-6">
                <div class="w-16 h-16 bg-gradient-to-r from-orange-600 to-red-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
                  </svg>
                </div>
                <h3 class="text-2xl font-bold text-stone-900 mb-3">{promo.title}</h3>
                <div class="inline-flex items-center gap-2 bg-orange-100 px-3 py-1 rounded-full border border-orange-200">
                  <svg class="w-4 h-4 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                  </svg>
                  <span class="text-orange-700 text-sm font-medium">Valid until {formatDisplayDate(promo.validUntil)}</span>
                </div>
              </div>
              
              <p class="text-stone-600 mb-8 leading-relaxed">{promo.description}</p>
              
              <a 
                href="/contact" 
                class="inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 w-full justify-center"
              >
                <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 012 0v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H4a1 1 0 110-2h4z"/>
                </svg>
                <span>Book This Offer</span>
              </a>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center bg-white/90 backdrop-blur-md rounded-3xl p-16 shadow-xl border border-stone-200/50">
        <div class="text-6xl mb-8">
          <svg class="w-24 h-24 mx-auto text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z"/>
          </svg>
        </div>
        <h3 class="text-3xl font-bold text-stone-900 mb-4">New Promotions Coming Soon</h3>
        <p class="text-stone-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
          We're preparing special offers for our patients. Contact us to learn about current availability.
        </p>
        <a 
          href="/contact" 
          class="inline-flex items-center gap-3 bg-gradient-to-r from-amber-700 to-orange-700 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
          </svg>
          <span>Contact Us</span>
        </a>
      </div>
    {/if}
  </div>
</section>

<!-- Contact Section -->
<section id="contact" class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="text-center mb-20">
      <div class="inline-flex items-center gap-3 bg-stone-50 px-6 py-3 rounded-full mb-8 border border-stone-200">
        <svg class="w-6 h-6 text-stone-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
        </svg>
        <span class="font-semibold text-stone-700">Visit Our Modern Clinic</span>
      </div>
      <h2 class="text-4xl lg:text-5xl font-bold text-stone-900 mb-6">
        Professional Dental
        <span class="bg-gradient-to-r from-amber-700 to-orange-700 bg-clip-text text-transparent">Practice</span>
      </h2>
      <p class="text-xl text-stone-600 max-w-3xl mx-auto leading-relaxed">
        Visit our modern clinic in Auckland for comprehensive dental care in a comfortable, 
        professional environment with the latest technology.
      </p>
      <div class="w-24 h-1 bg-gradient-to-r from-amber-600 to-orange-600 rounded-full mx-auto mt-6"></div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      
      <!-- Contact Information Cards -->
      <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- Location -->
        <div class="group bg-white rounded-3xl p-8 shadow-lg border border-stone-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-amber-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div class="relative">
            <div class="w-16 h-16 bg-gradient-to-r from-amber-600 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-stone-900 mb-4">Our Location</h3>
            <div class="space-y-2 text-stone-700 mb-6">
              <p class="font-semibold text-lg">123 Dental Avenue</p>
              <p>Auckland Central</p>
              <p>Auckland 1010, New Zealand</p>
            </div>
            <a 
              href="https://maps.google.com/?q=123+Dental+Avenue+Auckland+New+Zealand" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-amber-700 font-semibold hover:text-amber-800 transition-colors group-hover:translate-x-2 duration-300"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"/>
              </svg>
              <span>View on Google Maps</span>
            </a>
          </div>
        </div>

        <!-- Office Hours -->
        <div class="group bg-white rounded-3xl p-8 shadow-lg border border-stone-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-green-50/50 to-emerald-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div class="relative">
            <div class="w-16 h-16 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-stone-900 mb-4">Office Hours</h3>
            <div class="space-y-3 text-stone-700">
              <div class="flex justify-between items-center p-3 bg-stone-50 rounded-xl">
                <span class="font-medium">Monday - Friday</span>
                <span class="font-semibold text-green-600">8:00 AM - 6:00 PM</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-stone-50 rounded-xl">
                <span class="font-medium">Saturday</span>
                <span class="font-semibold text-green-600">9:00 AM - 4:00 PM</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-stone-50 rounded-xl">
                <span class="font-medium">Sunday</span>
                <span class="text-stone-500">Closed</span>
              </div>
              <div class="pt-3 border-t border-stone-200">
                <div class="flex items-center gap-2 text-sm text-emerald-600">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span class="font-medium">Extended evening hours available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Phone Contact -->
        <div class="group bg-white rounded-3xl p-8 shadow-lg border border-stone-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div class="relative">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-stone-900 mb-4">Contact Numbers</h3>
            <div class="space-y-4 text-stone-700">
              <div class="p-4 bg-stone-50 rounded-xl">
                <a href="tel:+6491234567" class="text-2xl font-bold text-blue-600 hover:text-blue-700 transition-colors block">
                  (09) 123-4567
                </a>
                <p class="text-sm text-stone-600 mt-1">General appointments & inquiries</p>
              </div>
              <div class="p-4 bg-stone-50 rounded-xl">
                <a href="mailto:info@auroradentica.co.nz" class="font-semibold text-blue-600 hover:text-blue-700 transition-colors block text-lg">
                  info@auroradentica.co.nz
                </a>
                <p class="text-sm text-stone-600 mt-1">Email consultations</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Emergency Contact -->
        <div class="group bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 shadow-lg border-2 border-red-200 hover:shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-red-100/50 to-orange-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div class="relative">
            <div class="w-16 h-16 bg-gradient-to-r from-red-600 to-orange-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg animate-pulse">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"/>
              </svg>
            </div>
            <h3 class="text-2xl font-bold text-stone-900 mb-4">Emergency Care</h3>
            <div class="space-y-4 text-stone-700">
              <div class="p-4 bg-white/80 rounded-xl">
                <a href="tel:+6491234568" class="text-2xl font-bold text-red-700 hover:text-red-800 transition-colors block">
                  (09) 123-4568
                </a>
                <p class="text-sm text-red-600 font-semibold mt-1">24/7 Emergency Hotline</p>
              </div>
              <p class="text-sm text-stone-600 bg-white/60 p-3 rounded-xl">
                For urgent dental emergencies outside regular office hours
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main CTA Card -->
      <div class="relative">
        <div class="bg-gradient-to-br from-amber-700 via-orange-700 to-red-700 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
          
          <!-- Background pattern -->
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute bottom-6 left-6 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse" style="animation-delay: 2s;"></div>
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full blur-3xl opacity-5"></div>
          </div>
          
          <div class="relative z-10 space-y-8">
            <div class="text-center">
              <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mx-auto mb-6 flex items-center justify-center border border-white/30 shadow-2xl">
                <svg class="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 012 0v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H4a1 1 0 110-2h4z"/>
                </svg>
              </div>
              <h3 class="text-3xl font-bold mb-4">Schedule Your Visit</h3>
              <p class="text-orange-100 leading-relaxed text-lg">
                Book your appointment through our convenient online system or call our office. 
                We'll confirm your preferred time within hours.
              </p>
            </div>
            
            <a 
              href="/contact" 
              class="group block w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-center py-6 px-8 rounded-3xl font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl border border-white/30 relative overflow-hidden"
            >
              <!-- Shimmer effect -->
              <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
              <div class="relative flex items-center justify-center space-x-3">
                <svg class="w-8 h-8 group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"/>
                </svg>
                <span>Book Online Now</span>
              </div>
            </a>
            
            <div class="pt-6 border-t border-white/20">
              <div class="grid grid-cols-2 gap-4 text-sm">
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span>Quick Response</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span>Professional Care</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span>Modern Facility</span>
                </div>
                <div class="flex items-center gap-2">
                  <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  </svg>
                  <span>Flexible Hours</span>
                </div>
              </div>
            </div>

            <!-- Insurance Information -->
            <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"/>
                </svg>
                <span>Insurance & Payment</span>
              </h4>
              <div class="text-sm space-y-2 text-orange-100">
                <p>• Most dental insurance plans accepted</p>
                <p>• Flexible payment plans available</p>
                <p>• EFTPOS, credit cards welcome</p>
                <p>• Interest-free options available</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<Footer />

<style>
  /* Enhanced animations for modern design */
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

  @keyframes slideUp {
    from {
      opacity: 0;
      transform: translateY(40px);
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

  @keyframes pulse-gentle {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
    }
  }

  @keyframes shimmer {
    0% {
      transform: translateX(-100%);
    }
    100% {
      transform: translateX(100%);
    }
  }

  /* Modern card effects */
  .service-card:hover .service-icon {
    transform: scale(1.1) rotate(12deg);
  }

  .contact-card:hover .contact-icon {
    transform: scale(1.1) rotate(12deg);
  }

  /* Testimonial transitions */
  .testimonial-slide {
    transition: all 0.7s cubic-bezier(0.4, 0, 0.2, 1);
  }

  /* Enhanced focus states */
  button:focus-visible,
  a:focus-visible {
    outline: 3px solid #d97706;
    outline-offset: 2px;
    border-radius: 1rem;
  }

  /* Smooth scrolling */
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
  }

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
    
    .animate-pulse,
    .animate-bounce {
      animation: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .bg-gradient-to-r,
    .bg-gradient-to-br {
      background: #000 !important;
      color: #fff !important;
    }
    
    .card {
      border: 3px solid #000;
    }
  }

  /* Print styles */
  @media print {
    .no-print {
      display: none !important;
    }
    
    section {
      break-inside: avoid;
    }
  }

  /* Enhanced selection colors */
  ::selection {
    background: rgba(217, 119, 6, 0.2);
    color: #1c1917;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f5f5f4;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #d97706, #ea580c);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #c2410c, #dc2626);
  }
</style>