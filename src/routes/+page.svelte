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

  // Professional testimonials
  const testimonials = [
    {
      name: "Dr. Sarah Mitchell",
      role: "Auckland Orthodontist",
      content: "Aurora Dentica provides exceptional care with state-of-the-art technology. Their commitment to patient comfort and professional excellence is remarkable.",
      rating: 5,
      avatar: "👩🏼‍⚕️"
    },
    {
      name: "Marcus Chen",
      role: "Business Professional",
      content: "Outstanding service and professionalism. The team at Aurora Dentica transformed my smile and boosted my confidence. Highly recommended for quality dental care.",
      rating: 5,
      avatar: "👨🏻‍💼"
    },
    {
      name: "Emma Thompson",
      role: "Teacher & Mother",
      content: "Finally found a dental clinic my whole family trusts. Professional, gentle, and thorough. The modern facility and caring staff make every visit comfortable.",
      rating: 5,
      avatar: "👩🏽‍🏫"
    }
  ];

  // Professional statistics
  const stats = [
    { number: "15+", label: "Years Experience", icon: "🏆", color: "from-primary-500 to-primary-600" },
    { number: "2,500+", label: "Patients Served", icon: "👥", color: "from-accent-500 to-accent-600" },
    { number: "98%", label: "Satisfaction Rate", icon: "⭐", color: "from-secondary-500 to-secondary-600" },
    { number: "24/7", label: "Emergency Support", icon: "🩺", color: "from-medical-trust-600 to-medical-trust-700" }
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
    }, 6000);
  }

  function toggleMobileMenu() {
    mobileMenuOpen = !mobileMenuOpen;
  }

  function closeMobileMenu() {
    mobileMenuOpen = false;
  }
</script>

<svelte:head>
  <title>Aurora Dentica - Professional Dental Care Excellence in Auckland</title>
  <meta name="description" content="Experience exceptional dental care at Aurora Dentica. Professional treatments, modern facility, and personalized service for your oral health needs in Auckland. Book your appointment today." />
  <meta name="keywords" content="dental care, dentist Auckland, teeth cleaning, dental checkup, oral health, dental clinic, professional dentistry" />
</svelte:head>

<!-- Professional Navigation -->
<nav class="fixed top-0 w-full z-50 bg-white/95 backdrop-blur-sm shadow-md border-b border-primary-100">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-20">
      
      <!-- Professional Logo -->
      <div class="flex items-center group">
        <a href="/" class="flex items-center space-x-3 transition-all duration-300">
          <div class="relative">
            <div class="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl shadow-lg flex items-center justify-center transform group-hover:scale-105 transition-all duration-300">
              <span class="text-white text-xl font-bold">AD</span>
            </div>
            <div class="absolute -top-1 -right-1 w-4 h-4 bg-accent-500 rounded-full border-2 border-white"></div>
          </div>
          <div>
            <h1 class="text-xl font-bold text-primary-800">Aurora Dentica</h1>
            <p class="text-xs text-primary-600 font-medium">Professional Dental Care</p>
          </div>
        </a>
      </div>

      <!-- Desktop Navigation -->
      <div class="hidden lg:flex items-center space-x-8">
        {#each [
          { name: 'Services', href: '#services' },
          { name: 'About', href: '#about' },
          { name: 'Promotions', href: '#promotions' },
          { name: 'Contact', href: '#contact' }
        ] as item}
          <a 
            href={item.href} 
            class="text-gray-700 hover:text-primary-700 font-medium transition-colors duration-300 relative group"
          >
            {item.name}
            <span class="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary-600 transition-all duration-300 group-hover:w-full"></span>
          </a>
        {/each}
      </div>

      <!-- CTA Button -->
      <div class="hidden lg:flex items-center">
        <a 
          href="/contact" 
          class="btn-primary flex items-center gap-2"
        >
          <span>📅</span>
          <span>Book Appointment</span>
        </a>
      </div>

      <!-- Mobile Menu Button -->
      <div class="lg:hidden">
        <button
          on:click={toggleMobileMenu}
          class="p-2 rounded-lg bg-primary-50 hover:bg-primary-100 transition-colors"
          aria-label="Toggle menu"
        >
          <div class="w-6 h-6 relative">
            <span class="absolute top-0 left-0 w-full h-0.5 bg-primary-700 rounded-full transition-all duration-300 {mobileMenuOpen ? 'rotate-45 translate-y-2.5' : ''}"></span>
            <span class="absolute top-2.5 left-0 w-full h-0.5 bg-primary-700 rounded-full transition-all duration-300 {mobileMenuOpen ? 'opacity-0' : ''}"></span>
            <span class="absolute top-5 left-0 w-full h-0.5 bg-primary-700 rounded-full transition-all duration-300 {mobileMenuOpen ? '-rotate-45 -translate-y-2.5' : ''}"></span>
          </div>
        </button>
      </div>
    </div>

    <!-- Mobile Navigation -->
    {#if mobileMenuOpen}
      <div class="lg:hidden bg-white border-t border-primary-100">
        <div class="px-4 py-6 space-y-4">
          {#each [
            { name: 'Services', href: '#services', desc: 'Our dental treatments' },
            { name: 'About', href: '#about', desc: 'Meet our team' },
            { name: 'Promotions', href: '#promotions', desc: 'Special offers' },
            { name: 'Contact', href: '#contact', desc: 'Visit our clinic' }
          ] as item}
            <a 
              href={item.href} 
              on:click={closeMobileMenu}
              class="block p-4 rounded-xl hover:bg-primary-50 transition-colors group"
            >
              <div class="font-semibold text-gray-900 group-hover:text-primary-700">{item.name}</div>
              <div class="text-sm text-gray-600">{item.desc}</div>
            </a>
          {/each}
          
          <div class="pt-4 border-t border-primary-100">
            <a 
              href="/contact" 
              on:click={closeMobileMenu}
              class="btn-primary w-full text-center"
            >
              📅 Book Your Appointment
            </a>
          </div>
        </div>
      </div>
    {/if}
  </div>
</nav>

<!-- Hero Section -->
<section class="relative min-h-screen flex items-center pt-20 bg-gradient-hero pattern-medical">
  
  <!-- Background Elements -->
  <div class="absolute inset-0">
    <div class="absolute top-20 left-10 w-72 h-72 bg-primary-200/20 rounded-full blur-3xl animate-float"></div>
    <div class="absolute bottom-20 right-10 w-96 h-96 bg-accent-200/20 rounded-full blur-3xl animate-float" style="animation-delay: 2s;"></div>
  </div>

  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
      
      <!-- Content Column -->
      <div class="text-center lg:text-left">
        
        <!-- Trust Badge -->
        <div class="trust-badge inline-flex mb-8">
          <span class="text-accent-600">🏆</span>
          <span>Auckland's Trusted Dental Practice Since 2009</span>
        </div>
        
        <!-- Main Headline -->
        <h1 class="heading-xl mb-6">
          <span class="block text-gray-900">Professional</span>
          <span class="block text-gradient-brown">Dental Excellence</span>
        </h1>
        
        <p class="text-lead mb-8 max-w-2xl">
          Experience comprehensive dental care with our team of qualified professionals. 
          We combine advanced technology with personalized treatment to ensure your 
          optimal oral health and beautiful smile.
        </p>
        
        <!-- CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-4 mb-12">
          <a href="/contact" class="btn-medical">
            <span>📅</span>
            <span>Schedule Consultation</span>
          </a>
          <a href="#services" class="btn-secondary">
            <span>🔍</span>
            <span>View Services</span>
          </a>
        </div>
        
        <!-- Professional Stats -->
        <div class="grid grid-cols-2 sm:grid-cols-4 gap-6">
          {#each stats as stat}
            <div class="text-center group">
              <div class="card-medical p-4 mb-3">
                <div class="w-12 h-12 bg-gradient-to-r {stat.color} rounded-xl mx-auto mb-2 flex items-center justify-center text-white text-xl">
                  {stat.icon}
                </div>
                <div class="text-2xl font-bold text-gray-900">{stat.number}</div>
              </div>
              <div class="text-sm text-gray-600 font-medium">{stat.label}</div>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- Visual Column -->
      <div class="relative">
        <div class="card-medical p-8 bg-white">
          <!-- Professional Credentials -->
          <div class="text-center mb-8">
            <div class="w-20 h-20 bg-gradient-medical rounded-2xl mx-auto mb-4 flex items-center justify-center shadow-medical">
              <span class="text-white text-3xl">🏥</span>
            </div>
            <h3 class="text-2xl font-bold text-gray-900 mb-2">Professional Care</h3>
            <p class="text-gray-600">Qualified, experienced dental professionals</p>
          </div>
          
          <!-- Certifications -->
          <div class="space-y-4 mb-8">
            {#each [
              { icon: '🎓', text: 'Licensed Dental Professionals', color: 'text-primary-600' },
              { icon: '🔬', text: 'Advanced Technology', color: 'text-accent-600' },
              { icon: '🛡️', text: 'Sterilization Protocols', color: 'text-medical-trust-600' },
              { icon: '⭐', text: 'Patient-Centered Care', color: 'text-secondary-600' }
            ] as cert}
              <div class="flex items-center gap-4 p-3 bg-gray-50 rounded-xl">
                <div class="w-10 h-10 bg-white rounded-xl shadow-sm flex items-center justify-center">
                  <span class="text-lg">{cert.icon}</span>
                </div>
                <span class="font-medium {cert.color}">{cert.text}</span>
              </div>
            {/each}
          </div>
          
          <!-- Quality Indicators -->
          <div class="grid grid-cols-2 gap-4">
            <div class="text-center p-4 bg-primary-50 rounded-xl">
              <div class="text-2xl font-bold text-primary-700">98%</div>
              <div class="text-xs text-primary-600">Patient Satisfaction</div>
            </div>
            <div class="text-center p-4 bg-accent-50 rounded-xl">
              <div class="text-2xl font-bold text-accent-700">15+</div>
              <div class="text-xs text-accent-600">Years Experience</div>
            </div>
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
      <div class="trust-badge mb-6">
        <span class="text-primary-600">🏥</span>
        <span>Comprehensive Dental Services</span>
      </div>
      <h2 class="heading-lg mb-6">
        Professional 
        <span class="text-gradient-brown">Dental Care</span>
      </h2>
      <p class="text-lead max-w-3xl mx-auto">
        Our experienced team provides comprehensive dental services using modern techniques 
        and state-of-the-art equipment for optimal patient care.
      </p>
    </div>
    
    <!-- Services Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      <!-- General & Preventive -->
      <div class="service-card">
        <div class="service-icon bg-gradient-to-br from-primary-100 to-primary-200">
          <span class="text-primary-700 text-2xl">🦷</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-4">General & Preventive</h3>
        <p class="text-gray-600 mb-6 leading-relaxed">
          Comprehensive oral health care including routine cleanings, examinations, 
          and preventive treatments to maintain optimal dental health.
        </p>
        <ul class="space-y-2 mb-8">
          {#each [
            'Professional cleanings',
            'Comprehensive examinations',
            'Fluoride treatments',
            'Oral health education'
          ] as service}
            <li class="flex items-center text-gray-700">
              <span class="w-2 h-2 bg-primary-500 rounded-full mr-3"></span>
              <span class="text-sm">{service}</span>
            </li>
          {/each}
        </ul>
        <a href="/contact" class="text-primary-600 font-semibold hover:text-primary-700 transition-colors">
          Learn More →
        </a>
      </div>
      
      <!-- Cosmetic Dentistry -->
      <div class="service-card">
        <div class="service-icon bg-gradient-to-br from-accent-100 to-accent-200">
          <span class="text-accent-700 text-2xl">✨</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Cosmetic Dentistry</h3>
        <p class="text-gray-600 mb-6 leading-relaxed">
          Enhance your smile with professional cosmetic treatments designed 
          to improve appearance while maintaining function and health.
        </p>
        <ul class="space-y-2 mb-8">
          {#each [
            'Professional whitening',
            'Porcelain veneers',
            'Cosmetic bonding',
            'Smile design'
          ] as service}
            <li class="flex items-center text-gray-700">
              <span class="w-2 h-2 bg-accent-500 rounded-full mr-3"></span>
              <span class="text-sm">{service}</span>
            </li>
          {/each}
        </ul>
        <a href="/contact" class="text-accent-600 font-semibold hover:text-accent-700 transition-colors">
          Learn More →
        </a>
      </div>
      
      <!-- Emergency Care -->
      <div class="service-card">
        <div class="service-icon bg-gradient-to-br from-medical-trust-100 to-medical-trust-200">
          <span class="text-medical-trust-700 text-2xl">🚨</span>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Emergency Care</h3>
        <p class="text-gray-600 mb-6 leading-relaxed">
          Prompt, professional emergency dental care when you need it most, 
          with same-day appointments available for urgent situations.
        </p>
        <ul class="space-y-2 mb-8">
          {#each [
            '24/7 emergency contact',
            'Same-day appointments',
            'Pain management',
            'Urgent treatment'
          ] as service}
            <li class="flex items-center text-gray-700">
              <span class="w-2 h-2 bg-medical-trust-500 rounded-full mr-3"></span>
              <span class="text-sm">{service}</span>
            </li>
          {/each}
        </ul>
        <a href="tel:+6491234568" class="text-medical-trust-600 font-semibold hover:text-medical-trust-700 transition-colors">
          Emergency Contact →
        </a>
      </div>
    </div>
  </div>
</section>

<!-- About Section -->
<section id="about" class="py-24 bg-gradient-primary pattern-trust">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      
      <!-- Content -->
      <div>
        <div class="trust-badge mb-8">
          <span class="text-primary-600">👥</span>
          <span>Professional Team</span>
        </div>
        
        <h2 class="heading-lg mb-8">
          Experienced
          <span class="text-gradient-brown">Dental Professionals</span>
        </h2>
        
        <p class="text-lead mb-8">
          Our qualified team of dental professionals is committed to providing 
          exceptional care using the latest techniques and technology in a 
          comfortable, modern environment.
        </p>
        
        <!-- Professional Features -->
        <div class="space-y-6 mb-10">
          {#each [
            { title: 'Qualified Professionals', desc: 'Licensed dentists and hygienists with years of experience', icon: '🎓' },
            { title: 'Modern Technology', desc: 'State-of-the-art equipment for accurate diagnosis and treatment', icon: '🔬' },
            { title: 'Patient-Centered Care', desc: 'Personalized treatment plans focused on your specific needs', icon: '💚' }
          ] as feature}
            <div class="flex gap-4">
              <div class="w-12 h-12 bg-white rounded-xl shadow-sm flex items-center justify-center flex-shrink-0">
                <span class="text-xl">{feature.icon}</span>
              </div>
              <div>
                <h4 class="font-bold text-gray-900 mb-2">{feature.title}</h4>
                <p class="text-gray-600">{feature.desc}</p>
              </div>
            </div>
          {/each}
        </div>
        
        <a href="/contact" class="btn-medical">
          <span>📅</span>
          <span>Schedule Consultation</span>
        </a>
      </div>
      
      <!-- Professional Credentials -->
      <div class="card-trust p-8">
        <h3 class="text-2xl font-bold text-gray-900 mb-8 text-center">Professional Standards</h3>
        
        <div class="space-y-6">
          {#each [
            { label: 'New Zealand Dental Council', status: 'Registered', color: 'text-green-600' },
            { label: 'Continuing Education', status: 'Current', color: 'text-blue-600' },
            { label: 'Professional Insurance', status: 'Comprehensive', color: 'text-purple-600' },
            { label: 'Quality Assurance', status: 'Certified', color: 'text-primary-600' }
          ] as credential}
            <div class="flex justify-between items-center p-4 bg-white rounded-xl border border-gray-100">
              <span class="font-medium text-gray-900">{credential.label}</span>
              <span class="font-bold {credential.color}">{credential.status}</span>
            </div>
          {/each}
        </div>
        
        <div class="mt-8 p-6 bg-accent-50 rounded-xl border border-accent-200">
          <div class="text-center">
            <div class="text-3xl mb-2">🏆</div>
            <div class="font-bold text-accent-800 text-lg">15+ Years</div>
            <div class="text-accent-600 text-sm">Professional Experience</div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Testimonials Section -->
<section class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="text-center mb-20">
      <div class="trust-badge mb-6">
        <span class="text-accent-600">💬</span>
        <span>Patient Testimonials</span>
      </div>
      <h2 class="heading-lg mb-6">
        What Our Patients
        <span class="text-gradient-brown">Say</span>
      </h2>
    </div>
    
    <!-- Testimonial Carousel -->
    <div class="max-w-4xl mx-auto">
      <div class="card-medical p-12 relative overflow-hidden">
        
        {#each testimonials as testimonial, i}
          <div class="testimonial-slide {i === currentTestimonial ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute inset-0'} transition-all duration-700 ease-in-out">
            
            <!-- Avatar -->
            <div class="text-center mb-8">
              <div class="w-20 h-20 bg-gradient-medical rounded-full mx-auto mb-4 flex items-center justify-center text-3xl shadow-medical">
                {testimonial.avatar}
              </div>
              
              <!-- Stars -->
              <div class="flex justify-center mb-4">
                {#each Array(testimonial.rating) as _}
                  <span class="text-secondary-500 text-2xl">⭐</span>
                {/each}
              </div>
            </div>
            
            <!-- Quote -->
            <blockquote class="text-xl text-gray-700 leading-relaxed mb-8 text-center font-medium">
              "{testimonial.content}"
            </blockquote>
            
            <!-- Author -->
            <div class="text-center">
              <div class="font-bold text-gray-900 text-lg">{testimonial.name}</div>
              <div class="text-primary-600 font-medium">{testimonial.role}</div>
            </div>
          </div>
        {/each}
        
        <!-- Navigation Dots -->
        <div class="flex justify-center mt-8 space-x-2">
          {#each testimonials as _, i}
            <button 
              class="w-3 h-3 rounded-full transition-all duration-300 {i === currentTestimonial ? 'bg-primary-600' : 'bg-gray-300'}"
              on:click={() => currentTestimonial = i}
            ></button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Promotions Section -->
<section id="promotions" class="py-24 bg-gradient-warm">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="text-center mb-20">
      <div class="trust-badge mb-6">
        <span class="text-secondary-700">🎉</span>
        <span>Special Offers</span>
      </div>
      <h2 class="heading-lg mb-6 text-white">
        Current
        <span class="text-secondary-200">Promotions</span>
      </h2>
      <p class="text-xl text-secondary-100 max-w-3xl mx-auto">
        Take advantage of our professional dental services with these special offers.
      </p>
    </div>

    {#if loading}
      <div class="flex justify-center">
        <div class="text-center">
          <div class="w-16 h-16 border-4 border-secondary-200 border-t-white rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-white">Loading current promotions...</p>
        </div>
      </div>
    {:else if promos.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each promos as promo}
          <div class="card-medical bg-white p-8 group hover:shadow-glow-lg transition-all duration-500">
            
            <!-- Promo Header -->
            <div class="mb-6">
              <div class="w-12 h-12 bg-gradient-to-br from-secondary-500 to-secondary-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                <span class="text-white text-xl">🎁</span>
              </div>
              <h3 class="text-2xl font-bold text-gray-900 mb-2">{promo.title}</h3>
              <div class="trust-badge text-xs">
                <span class="text-accent-600">⏰</span>
                <span>Valid until {formatDisplayDate(promo.validUntil)}</span>
              </div>
            </div>
            
            <p class="text-gray-600 mb-8 leading-relaxed">{promo.description}</p>
            
            <a 
              href="/contact" 
              class="btn-medical w-full text-center"
            >
              <span>📅</span>
              <span>Book This Offer</span>
            </a>
          </div>
        {/each}
      </div>
    {:else}
      <div class="card-medical text-center p-16">
        <div class="text-secondary-300 text-6xl mb-8">🎉</div>
        <h3 class="text-3xl font-bold text-gray-900 mb-4">New Promotions Coming Soon</h3>
        <p class="text-gray-600 mb-8 max-w-md mx-auto text-lg">
          We're preparing special offers for our patients. Contact us to learn about current availability.
        </p>
        <a href="/contact" class="btn-medical">
          <span>📞</span>
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
      <div class="trust-badge mb-6">
        <span class="text-primary-600">📍</span>
        <span>Visit Our Clinic</span>
      </div>
      <h2 class="heading-lg mb-6">
        Professional Dental
        <span class="text-gradient-brown">Practice</span>
      </h2>
      <p class="text-lead max-w-3xl mx-auto">
        Visit our modern clinic in Auckland for comprehensive dental care in a comfortable, 
        professional environment.
      </p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      
      <!-- Contact Information -->
      <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- Location -->
        <div class="contact-card">
          <div class="contact-icon bg-gradient-to-br from-primary-100 to-primary-200">
            <span class="text-primary-700 text-xl">📍</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-4">Our Location</h3>
          <div class="space-y-2 text-gray-700 mb-6">
            <p class="font-semibold">123 Dental Avenue</p>
            <p>Auckland Central</p>
            <p>Auckland 1010, New Zealand</p>
          </div>
          <a 
            href="https://maps.google.com/?q=123+Dental+Avenue+Auckland+New+Zealand" 
            target="_blank" 
            rel="noopener noreferrer"
            class="text-primary-600 font-semibold hover:text-primary-700 transition-colors flex items-center gap-2"
          >
            <span>🗺️</span>
            <span>View on Google Maps</span>
          </a>
        </div>

        <!-- Office Hours -->
        <div class="contact-card">
          <div class="contact-icon bg-gradient-to-br from-accent-100 to-accent-200">
            <span class="text-accent-700 text-xl">🕒</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-4">Office Hours</h3>
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
              <span class="text-gray-500">Closed</span>
            </div>
            <div class="pt-3 border-t border-gray-200">
              <div class="flex items-center gap-2 text-sm text-accent-600">
                <span>✓</span>
                <span>Extended evening hours available</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Phone Contact -->
        <div class="contact-card">
          <div class="contact-icon bg-gradient-to-br from-medical-trust-100 to-medical-trust-200">
            <span class="text-medical-trust-700 text-xl">📞</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-4">Contact Numbers</h3>
          <div class="space-y-4 text-gray-700">
            <div>
              <a href="tel:+6491234567" class="text-xl font-bold text-medical-trust-600 hover:text-medical-trust-700 transition-colors block">
                (09) 123-4567
              </a>
              <p class="text-sm text-gray-600">General appointments & inquiries</p>
            </div>
            <div>
              <a href="mailto:info@auroradentica.co.nz" class="font-semibold text-medical-trust-600 hover:text-medical-trust-700 transition-colors block">
                info@auroradentica.co.nz
              </a>
              <p class="text-sm text-gray-600">Email consultations</p>
            </div>
          </div>
        </div>

        <!-- Emergency Contact -->
        <div class="contact-card bg-gradient-to-br from-secondary-50 to-secondary-100 border-secondary-200">
          <div class="contact-icon bg-gradient-to-br from-secondary-500 to-secondary-600">
            <span class="text-white text-xl">🚨</span>
          </div>
          <h3 class="text-xl font-bold text-gray-900 mb-4">Emergency Care</h3>
          <div class="space-y-4 text-gray-700">
            <div>
              <a href="tel:+6491234568" class="text-xl font-bold text-secondary-700 hover:text-secondary-800 transition-colors block">
                (09) 123-4568
              </a>
              <p class="text-sm text-secondary-600 font-semibold">24/7 Emergency Hotline</p>
            </div>
            <p class="text-sm text-gray-600">
              For urgent dental emergencies outside regular office hours
            </p>
          </div>
        </div>
      </div>

      <!-- Main CTA Card -->
      <div class="cta-gradient rounded-3xl p-10 text-white relative overflow-hidden shadow-medical-lg">
        <!-- Background pattern -->
        <div class="absolute inset-0 opacity-10 pattern-medical"></div>
        
        <div class="relative z-10 space-y-8">
          <div class="text-center">
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl mx-auto mb-6 flex items-center justify-center border border-white/30">
              <span class="text-3xl">📅</span>
            </div>
            <h3 class="text-3xl font-bold mb-4">Schedule Your Visit</h3>
            <p class="text-primary-100 leading-relaxed text-lg">
              Book your appointment through our convenient online system or call our office. 
              We'll confirm your preferred time within hours.
            </p>
          </div>
          
          <a 
            href="/contact" 
            class="block w-full bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white text-center py-6 px-8 rounded-2xl font-bold text-xl transition-all duration-300 shadow-lg hover:shadow-2xl border border-white/30 group"
          >
            <div class="flex items-center justify-center space-x-3">
              <span class="text-3xl group-hover:scale-110 transition-transform duration-300">💬</span>
              <span>Book Online Now</span>
            </div>
          </a>
          
          <div class="pt-6 border-t border-white/20">
            <div class="flex items-center justify-center gap-6 text-sm">
              <div class="flex items-center gap-2">
                <span class="text-lg">✓</span>
                <span>Quick Response</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-lg">✓</span>
                <span>Professional Care</span>
              </div>
              <div class="flex items-center gap-2">
                <span class="text-lg">✓</span>
                <span>Modern Facility</span>
              </div>
            </div>
          </div>

          <!-- Insurance Information -->
          <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
            <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
              <span class="text-xl">🛡️</span>
              <span>Insurance & Payment</span>
            </h4>
            <div class="text-sm space-y-2 text-primary-100">
              <p>• Most dental insurance plans accepted</p>
              <p>• Payment plans available</p>
              <p>• EFTPOS, credit cards welcome</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Professional Footer -->
<footer class="bg-gradient-to-br from-gray-900 to-primary-900 text-white py-20">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
      
      <!-- Company Info -->
      <div class="lg:col-span-2">
        <div class="flex items-center gap-4 mb-8">
          <div class="w-14 h-14 bg-gradient-medical rounded-2xl flex items-center justify-center shadow-lg">
            <span class="text-white font-bold text-xl">AD</span>
          </div>
          <div>
            <h5 class="text-2xl font-bold text-white">Aurora Dentica</h5>
            <p class="text-gray-300">Professional Dental Care Since 2009</p>
          </div>
        </div>
        <p class="text-gray-300 mb-8 leading-relaxed max-w-md text-lg">
          Providing exceptional dental care with modern technology, experienced professionals, 
          and a commitment to your oral health and beautiful smile in Auckland.
        </p>
        
        <!-- Professional Certifications -->
        <div class="space-y-3">
          <h6 class="font-semibold text-white text-lg">Professional Memberships</h6>
          <div class="flex flex-wrap gap-4 text-sm text-gray-300">
            <span class="flex items-center gap-2">
              <span class="text-accent-400">✓</span>
              <span>NZ Dental Council</span>
            </span>
            <span class="flex items-center gap-2">
              <span class="text-accent-400">✓</span>
              <span>NZDA Member</span>
            </span>
            <span class="flex items-center gap-2">
              <span class="text-accent-400">✓</span>
              <span>Continuing Education</span>
            </span>
          </div>
        </div>
      </div>

      <!-- Quick Links -->
      <div>
        <h6 class="font-bold text-xl mb-8 text-white">Services</h6>
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
              <a href="/#services" class="text-gray-300 hover:text-white transition-colors text-lg hover:translate-x-1 transform duration-300 inline-block">
                {service}
              </a>
            </li>
          {/each}
        </ul>
      </div>

      <!-- Contact Info -->
      <div>
        <h6 class="font-bold text-xl mb-8 text-white">Contact</h6>
        <ul class="space-y-6 text-gray-300">
          <li class="flex items-start gap-4">
            <span class="text-primary-400 text-2xl flex-shrink-0">📍</span>
            <div class="text-lg">
              <div class="text-white font-semibold">123 Dental Avenue</div>
              <div>Auckland Central, Auckland 1010</div>
              <div>New Zealand</div>
            </div>
          </li>
          <li class="flex items-center gap-4">
            <span class="text-primary-400 text-2xl">📞</span>
            <div>
              <a href="tel:+6491234567" class="hover:text-white transition-colors text-lg font-semibold block">
                (09) 123-4567
              </a>
              <span class="text-sm text-gray-400">General inquiries</span>
            </div>
          </li>
          <li class="flex items-center gap-4">
            <span class="text-secondary-400 text-2xl">🚨</span>
            <div>
              <a href="tel:+6491234568" class="hover:text-white transition-colors text-lg font-semibold block">
                Emergency: (09) 123-4568
              </a>
              <span class="text-sm text-gray-400">24/7 emergency care</span>
            </div>
          </li>
        </ul>
      </div>
    </div>

    <!-- Bottom bar -->
    <div class="mt-16 pt-8 border-t border-gray-700">
      <div class="flex flex-col sm:flex-row justify-between items-center space-y-4 sm:space-y-0">
        <div class="text-center sm:text-left">
          <span class="text-gray-400 text-lg">© 2024 Aurora Dentica. All rights reserved.</span>
          <div class="text-sm text-gray-500 mt-1">
            Professional dental care in Auckland, New Zealand
          </div>
        </div>
        <div class="flex flex-col sm:flex-row items-center space-y-2 sm:space-y-0 sm:space-x-6 text-lg text-gray-400">
          <a href="mailto:info@auroradentica.co.nz" class="hover:text-white transition-colors">
            info@auroradentica.co.nz
          </a>
          <span class="hidden sm:inline">•</span>
          <span>Licensed Dental Practice</span>
        </div>
      </div>
    </div>
  </div>
</footer>

<style>
  /* Enhanced animations with medical theme */
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
    transition: all 0.7s ease-in-out;
  }

  /* Professional hover effects */
  .service-card:hover .service-icon {
    transform: scale(1.1) rotate(5deg);
  }

  .contact-card:hover .contact-icon {
    transform: scale(1.05);
  }

  /* Enhanced scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--primary-50);
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, var(--primary-500), var(--primary-600));
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, var(--primary-600), var(--primary-700));
  }

  /* Professional focus states */
  button:focus-visible,
  a:focus-visible {
    outline: 2px solid var(--primary-500);
    outline-offset: 2px;
    border-radius: 0.5rem;
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
  }

  /* Reduced motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
      scroll-behavior: auto !important;
    }
    
    .animate-float,
    .animate-pulse-subtle {
      animation: none;
    }
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .card-medical,
    .contact-card,
    .service-card {
      border: 2px solid currentColor;
    }
    
    .trust-badge {
      border: 2px solid currentColor;
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

  /* Enhanced selection colors */
  ::selection {
    background: rgba(168, 132, 95, 0.2);
    color: #1a1a1a;
  }

  ::-moz-selection {
    background: rgba(168, 132, 95, 0.2);
    color: #1a1a1a;
  }
</style>