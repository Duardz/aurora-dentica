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

  // Enhanced testimonials with more diversity
  const testimonials = [
    {
      name: "Dr. Sarah Mitchell",
      role: "Auckland Orthodontist",
      content: "Aurora Dentica provides exceptional care with cutting-edge technology. Their commitment to patient comfort and professional excellence is truly remarkable.",
      rating: 5,
      avatar: "👩🏼‍⚕️",
      location: "Remuera, Auckland"
    },
    {
      name: "Marcus Chen",
      role: "Business Professional",
      content: "Outstanding service and genuine care. The team transformed my smile and boosted my confidence. Highly recommend for quality dental care.",
      rating: 5,
      avatar: "👨🏻‍💼",
      location: "CBD, Auckland"
    },
    {
      name: "Emma Thompson",
      role: "Teacher & Mother",
      content: "Finally found a dental clinic my whole family trusts. Professional, gentle, and thorough. The modern facility makes every visit comfortable.",
      rating: 5,
      avatar: "👩🏽‍🏫",
      location: "Ponsonby, Auckland"
    },
    {
      name: "James Rodriguez",
      role: "University Student",
      content: "Great experience as a new patient. The staff explained everything clearly and made me feel at ease. Affordable pricing for students too!",
      rating: 5,
      avatar: "👨🏽‍🎓",
      location: "Mt Eden, Auckland"
    }
  ];

  // Enhanced statistics with modern design
  const stats = [
    { 
      number: "15+", 
      label: "Years Experience", 
      icon: "🏆", 
      color: "from-amber-500 to-orange-500",
      description: "Serving Auckland families"
    },
    { 
      number: "2,500+", 
      label: "Happy Patients", 
      icon: "😊", 
      color: "from-emerald-500 to-green-500",
      description: "Trust in our care"
    },
    { 
      number: "98%", 
      label: "Satisfaction Rate", 
      icon: "⭐", 
      color: "from-blue-500 to-indigo-500",
      description: "Exceptional service"
    },
    { 
      number: "24/7", 
      label: "Emergency Care", 
      icon: "🚨", 
      color: "from-red-500 to-pink-500",
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
  <meta name="description" content="Experience exceptional dental care at Aurora Dentica. Modern treatments, advanced technology, and personalized service for your oral health needs in Auckland. Book your appointment today." />
  <meta name="keywords" content="dental care, dentist Auckland, teeth cleaning, dental checkup, oral health, dental clinic, modern dentistry" />
</svelte:head>

<Navigation />

<!-- Modern Hero Section -->
<section class="min-h-screen flex items-center pt-20 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 relative overflow-hidden">
  
  <!-- Animated Background Elements -->
  <div class="absolute inset-0">
    <div class="absolute top-20 left-20 w-72 h-72 bg-gradient-to-r from-blue-400/20 to-purple-400/20 rounded-full blur-3xl animate-pulse"></div>
    <div class="absolute bottom-20 right-20 w-96 h-96 bg-gradient-to-r from-indigo-400/20 to-pink-400/20 rounded-full blur-3xl animate-pulse" style="animation-delay: 2s;"></div>
    <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-cyan-300/10 to-blue-300/10 rounded-full blur-3xl"></div>
  </div>

  <div class="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      
      <!-- Content Column -->
      <div class="text-center lg:text-left space-y-8">
        
        <!-- Trust Badge -->
        <div class="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg border border-blue-200/50">
          <span class="text-2xl">🏆</span>
          <span class="font-semibold text-slate-700">Auckland's Premier Dental Practice Since 2009</span>
        </div>
        
        <!-- Main Headline -->
        <div class="space-y-4">
          <h1 class="text-5xl lg:text-6xl xl:text-7xl font-bold leading-tight">
            <span class="block text-slate-900">Modern</span>
            <span class="block bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">Dental Excellence</span>
          </h1>
          <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto lg:mx-0"></div>
        </div>
        
        <p class="text-xl lg:text-2xl text-slate-600 leading-relaxed max-w-2xl">
          Experience comprehensive dental care with our team of qualified professionals. 
          We combine advanced technology with personalized treatment for your optimal oral health.
        </p>
        
        <!-- Enhanced CTA Buttons -->
        <div class="flex flex-col sm:flex-row gap-6 pt-4">
          <a 
            href="/contact" 
            class="group relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-2xl hover:scale-105 flex items-center justify-center gap-3"
          >
            <!-- Shimmer effect -->
            <div class="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700"></div>
            <span class="relative text-2xl">📅</span>
            <span class="relative">Schedule Consultation</span>
          </a>
          <a 
            href="#services" 
            class="group bg-white/80 backdrop-blur-sm text-slate-700 border-2 border-slate-200 px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:bg-white hover:shadow-xl hover:scale-105 flex items-center justify-center gap-3"
          >
            <span class="text-2xl group-hover:rotate-12 transition-transform duration-300">🔍</span>
            <span>Explore Services</span>
          </a>
        </div>
        
        <!-- Enhanced Stats -->
        <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 pt-8">
          {#each stats as stat}
            <div class="group text-center">
              <div class="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-slate-200/50 hover:shadow-xl hover:scale-105 transition-all duration-300">
                <div class="w-16 h-16 bg-gradient-to-r {stat.color} rounded-2xl mx-auto mb-4 flex items-center justify-center text-white text-2xl shadow-lg group-hover:rotate-12 transition-transform duration-300">
                  {stat.icon}
                </div>
                <div class="text-3xl font-bold text-slate-900 mb-2">{stat.number}</div>
                <div class="text-sm font-semibold text-slate-600 mb-1">{stat.label}</div>
                <div class="text-xs text-slate-500">{stat.description}</div>
              </div>
            </div>
          {/each}
        </div>
      </div>
      
      <!-- Visual Column -->
      <div class="relative lg:pl-8">
        <div class="relative">
          <!-- Main card -->
          <div class="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-slate-200/50">
            
            <!-- Header -->
            <div class="text-center mb-8">
              <div class="w-20 h-20 bg-gradient-to-r from-blue-500 to-purple-500 rounded-3xl mx-auto mb-6 flex items-center justify-center shadow-2xl">
                <span class="text-white text-4xl">🏥</span>
              </div>
              <h3 class="text-2xl font-bold text-slate-900 mb-3">Professional Excellence</h3>
              <p class="text-slate-600">Trusted by thousands of Auckland families</p>
            </div>
            
            <!-- Features */
            <div class="space-y-4 mb-8">
              {#each [
                { icon: '🎓', text: 'Licensed Dental Professionals', color: 'text-blue-600' },
                { icon: '🔬', text: 'Advanced Technology', color: 'text-indigo-600' },
                { icon: '🛡️', text: 'Sterilization Protocols', color: 'text-purple-600' },
                { icon: '⭐', text: 'Patient-Centered Care', color: 'text-pink-600' }
              ] as feature}
                <div class="flex items-center gap-4 p-4 bg-gradient-to-r from-slate-50 to-blue-50 rounded-2xl border border-slate-200/50 hover:shadow-md transition-all duration-300 group">
                  <div class="w-12 h-12 bg-white rounded-2xl shadow-md flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <span class="text-2xl">{feature.icon}</span>
                  </div>
                  <span class="font-semibold {feature.color} text-lg">{feature.text}</span>
                </div>
              {/each}
            </div>
            
            <!-- Trust indicators */
            <div class="grid grid-cols-2 gap-4">
              <div class="text-center p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border border-green-200/50">
                <div class="text-3xl font-bold text-green-700 mb-1">98%</div>
                <div class="text-sm text-green-600 font-medium">Patient Satisfaction</div>
              </div>
              <div class="text-center p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-2xl border border-blue-200/50">
                <div class="text-3xl font-bold text-blue-700 mb-1">15+</div>
                <div class="text-sm text-blue-600 font-medium">Years Experience</div>
              </div>
            </div>
          </div>

          <!-- Floating elements -->
          <div class="absolute -top-6 -right-6 w-24 h-24 bg-gradient-to-r from-amber-400 to-orange-400 rounded-2xl flex items-center justify-center text-white text-2xl shadow-xl animate-bounce">
            🦷
          </div>
          <div class="absolute -bottom-6 -left-6 w-20 h-20 bg-gradient-to-r from-emerald-400 to-green-400 rounded-2xl flex items-center justify-center text-white text-xl shadow-xl animate-pulse">
            ✨
          </div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Enhanced Services Section -->
<section id="services" class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <!-- Section Header -->
    <div class="text-center mb-20">
      <div class="inline-flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-full mb-8">
        <span class="text-2xl">🏥</span>
        <span class="font-semibold text-blue-700">Comprehensive Dental Services</span>
      </div>
      <h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
        Modern 
        <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dental Care</span>
      </h2>
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        Our experienced team provides comprehensive dental services using cutting-edge techniques 
        and state-of-the-art equipment for optimal patient care.
      </p>
      <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-6"></div>
    </div>
    
    <!-- Enhanced Services Grid -->
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      
      <!-- General & Preventive -->
      <div class="group bg-white rounded-3xl p-8 shadow-lg border border-slate-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
        <!-- Background gradient -->
        <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div class="relative">
          <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
            <span class="text-white text-2xl">🦷</span>
          </div>
          <h3 class="text-2xl font-bold text-slate-900 mb-4 group-hover:text-blue-700 transition-colors duration-300">General & Preventive</h3>
          <p class="text-slate-600 mb-6 leading-relaxed">
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
              <li class="flex items-center text-slate-700">
                <div class="w-2 h-2 bg-blue-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></div>
                <span class="text-sm font-medium">{service}</span>
              </li>
            {/each}
          </ul>
          <a href="/contact" class="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors group-hover:translate-x-2 duration-300">
            <span>Learn More</span>
            <span class="text-lg">→</span>
          </a>
        </div>
      </div>
      
      <!-- Cosmetic Dentistry -->
      <div class="group bg-white rounded-3xl p-8 shadow-lg border border-slate-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-pink-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div class="relative">
          <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg">
            <span class="text-white text-2xl">✨</span>
          </div>
          <h3 class="text-2xl font-bold text-slate-900 mb-4 group-hover:text-purple-700 transition-colors duration-300">Cosmetic Dentistry</h3>
          <p class="text-slate-600 mb-6 leading-relaxed">
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
              <li class="flex items-center text-slate-700">
                <div class="w-2 h-2 bg-purple-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></div>
                <span class="text-sm font-medium">{service}</span>
              </li>
            {/each}
          </ul>
          <a href="/contact" class="inline-flex items-center gap-2 text-purple-600 font-semibold hover:text-purple-700 transition-colors group-hover:translate-x-2 duration-300">
            <span>Learn More</span>
            <span class="text-lg">→</span>
          </a>
        </div>
      </div>
      
      <!-- Emergency Care -->
      <div class="group bg-white rounded-3xl p-8 shadow-lg border border-slate-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
        <div class="absolute inset-0 bg-gradient-to-br from-red-50/50 to-orange-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
        
        <div class="relative">
          <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-500 shadow-lg animate-pulse">
            <span class="text-white text-2xl">🚨</span>
          </div>
          <h3 class="text-2xl font-bold text-slate-900 mb-4 group-hover:text-red-700 transition-colors duration-300">Emergency Care</h3>
          <p class="text-slate-600 mb-6 leading-relaxed">
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
              <li class="flex items-center text-slate-700">
                <div class="w-2 h-2 bg-red-500 rounded-full mr-3 group-hover:scale-150 transition-transform duration-300"></div>
                <span class="text-sm font-medium">{service}</span>
              </li>
            {/each}
          </ul>
          <a href="tel:+6491234568" class="inline-flex items-center gap-2 text-red-600 font-semibold hover:text-red-700 transition-colors group-hover:translate-x-2 duration-300">
            <span>Emergency Contact</span>
            <span class="text-lg">→</span>
          </a>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Enhanced About Section -->
<section id="about" class="py-24 bg-gradient-to-br from-slate-50 to-blue-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
      
      <!-- Content -->
      <div class="space-y-8">
        <div class="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg">
          <span class="text-2xl">👥</span>
          <span class="font-semibold text-slate-700">Meet Our Professional Team</span>
        </div>
        
        <div class="space-y-4">
          <h2 class="text-4xl lg:text-5xl font-bold text-slate-900">
            Experienced
            <span class="block bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Dental Professionals</span>
          </h2>
          <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full"></div>
        </div>
        
        <p class="text-xl text-slate-600 leading-relaxed">
          Our qualified team of dental professionals is committed to providing 
          exceptional care using the latest techniques and technology in a 
          comfortable, modern environment.
        </p>
        
        <!-- Enhanced Professional Features -->
        <div class="space-y-6">
          {#each [
            { title: 'Qualified Professionals', desc: 'Licensed dentists and hygienists with years of experience', icon: '🎓', color: 'from-blue-500 to-indigo-500' },
            { title: 'Modern Technology', desc: 'State-of-the-art equipment for accurate diagnosis and treatment', icon: '🔬', color: 'from-purple-500 to-pink-500' },
            { title: 'Patient-Centered Care', desc: 'Personalized treatment plans focused on your specific needs', icon: '💚', color: 'from-emerald-500 to-green-500' }
          ] as feature}
            <div class="flex gap-6 group">
              <div class="w-16 h-16 bg-gradient-to-r {feature.color} rounded-2xl flex items-center justify-center flex-shrink-0 shadow-lg group-hover:scale-110 group-hover:rotate-12 transition-all duration-300">
                <span class="text-white text-2xl">{feature.icon}</span>
              </div>
              <div class="flex-1">
                <h4 class="font-bold text-slate-900 mb-3 text-xl">{feature.title}</h4>
                <p class="text-slate-600 leading-relaxed">{feature.desc}</p>
              </div>
            </div>
          {/each}
        </div>
        
        <a 
          href="/contact" 
          class="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <span class="text-2xl">📅</span>
          <span>Schedule Consultation</span>
        </a>
      </div>
      
      <!-- Professional Credentials -->
      <div class="bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-2xl border border-slate-200/50">
        <div class="text-center mb-8">
          <h3 class="text-2xl font-bold text-slate-900 mb-4">Professional Standards</h3>
          <div class="w-16 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto"></div>
        </div>
        
        <div class="space-y-4 mb-8">
          {#each [
            { label: 'New Zealand Dental Council', status: 'Registered', color: 'text-green-600', bg: 'bg-green-50' },
            { label: 'Continuing Education', status: 'Current', color: 'text-blue-600', bg: 'bg-blue-50' },
            { label: 'Professional Insurance', status: 'Comprehensive', color: 'text-purple-600', bg: 'bg-purple-50' },
            { label: 'Quality Assurance', status: 'Certified', color: 'text-indigo-600', bg: 'bg-indigo-50' }
          ] as credential}
            <div class="flex justify-between items-center p-4 {credential.bg} rounded-2xl border border-slate-200/50 hover:shadow-md transition-all duration-300">
              <span class="font-semibold text-slate-900">{credential.label}</span>
              <span class="font-bold {credential.color} px-3 py-1 bg-white rounded-full shadow-sm">{credential.status}</span>
            </div>
          {/each}
        </div>
        
        <div class="text-center p-6 bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200">
          <div class="text-4xl mb-3">🏆</div>
          <div class="font-bold text-amber-800 text-2xl mb-1">15+ Years</div>
          <div class="text-amber-600 font-medium">Professional Experience</div>
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Enhanced Testimonials Section -->
<section class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="text-center mb-20">
      <div class="inline-flex items-center gap-3 bg-purple-50 px-6 py-3 rounded-full mb-8">
        <span class="text-2xl">💬</span>
        <span class="font-semibold text-purple-700">Patient Testimonials</span>
      </div>
      <h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
        What Our Patients
        <span class="bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">Say</span>
      </h2>
      <div class="w-24 h-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto"></div>
    </div>
    
    <!-- Enhanced Testimonial Carousel -->
    <div class="max-w-4xl mx-auto relative">
      <div class="bg-white rounded-3xl p-12 shadow-2xl border border-slate-200/50 relative overflow-hidden">
        
        <!-- Background pattern -->
        <div class="absolute inset-0 opacity-5">
          <div class="absolute top-4 right-4 w-32 h-32 bg-purple-400 rounded-full blur-3xl"></div>
          <div class="absolute bottom-4 left-4 w-24 h-24 bg-pink-400 rounded-full blur-2xl"></div>
        </div>
        
        {#each testimonials as testimonial, i}
          <div class="testimonial-slide {i === currentTestimonial ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-8 absolute inset-0'} transition-all duration-700 ease-in-out p-12">
            
            <!-- Avatar and Rating -->
            <div class="text-center mb-8">
              <div class="w-24 h-24 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full mx-auto mb-6 flex items-center justify-center text-4xl shadow-2xl">
                {testimonial.avatar}
              </div>
              
              <!-- Enhanced Stars -->
              <div class="flex justify-center mb-4 space-x-1">
                {#each Array(testimonial.rating) as _}
                  <span class="text-amber-400 text-3xl">⭐</span>
                {/each}
              </div>
            </div>
            
            <!-- Quote -->
            <blockquote class="text-2xl text-slate-700 leading-relaxed mb-8 text-center font-medium italic">
              "{testimonial.content}"
            </blockquote>
            
            <!-- Author Info -->
            <div class="text-center">
              <div class="font-bold text-slate-900 text-xl mb-1">{testimonial.name}</div>
              <div class="text-purple-600 font-medium mb-2">{testimonial.role}</div>
              <div class="text-slate-500 text-sm flex items-center justify-center gap-2">
                <span>📍</span>
                <span>{testimonial.location}</span>
              </div>
            </div>
          </div>
        {/each}
        
        <!-- Enhanced Navigation Dots -->
        <div class="flex justify-center mt-8 space-x-3">
          {#each testimonials as _, i}
            <button 
              class="w-4 h-4 rounded-full transition-all duration-300 {i === currentTestimonial ? 'bg-purple-600 scale-125' : 'bg-slate-300 hover:bg-slate-400'}"
              on:click={() => currentTestimonial = i}
            ></button>
          {/each}
        </div>
      </div>
    </div>
  </div>
</section>

<!-- Enhanced Promotions Section -->
<section id="promotions" class="py-24 bg-gradient-to-br from-amber-50 via-orange-50 to-red-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="text-center mb-20">
      <div class="inline-flex items-center gap-3 bg-white/80 backdrop-blur-sm px-6 py-3 rounded-full shadow-lg mb-8">
        <span class="text-2xl">🎉</span>
        <span class="font-semibold text-orange-700">Special Offers</span>
      </div>
      <h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
        Current
        <span class="bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">Promotions</span>
      </h2>
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        Take advantage of our professional dental services with these exclusive special offers.
      </p>
      <div class="w-24 h-1 bg-gradient-to-r from-orange-500 to-red-500 rounded-full mx-auto mt-6"></div>
    </div>

    {#if loading}
      <div class="flex justify-center">
        <div class="text-center">
          <div class="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto mb-4"></div>
          <p class="text-slate-600 text-lg">Loading current promotions...</p>
        </div>
      </div>
    {:else if promos.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {#each promos as promo}
          <div class="group bg-white/90 backdrop-blur-md rounded-3xl p-8 shadow-xl border border-slate-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
            
            <!-- Background gradient -->
            <div class="absolute inset-0 bg-gradient-to-br from-orange-50/50 to-red-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            <div class="relative">
              <!-- Promo Header -->
              <div class="mb-6">
                <div class="w-16 h-16 bg-gradient-to-r from-orange-500 to-red-500 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
                  <span class="text-white text-2xl">🎁</span>
                </div>
                <h3 class="text-2xl font-bold text-slate-900 mb-3">{promo.title}</h3>
                <div class="inline-flex items-center gap-2 bg-orange-100 px-3 py-1 rounded-full">
                  <span class="text-orange-600">⏰</span>
                  <span class="text-orange-700 text-sm font-medium">Valid until {formatDisplayDate(promo.validUntil)}</span>
                </div>
              </div>
              
              <p class="text-slate-600 mb-8 leading-relaxed">{promo.description}</p>
              
              <a 
                href="/contact" 
                class="inline-flex items-center gap-3 bg-gradient-to-r from-orange-600 to-red-600 text-white px-6 py-3 rounded-2xl font-semibold transition-all duration-300 hover:shadow-xl hover:scale-105 w-full justify-center"
              >
                <span class="text-xl">📅</span>
                <span>Book This Offer</span>
              </a>
            </div>
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center bg-white/90 backdrop-blur-md rounded-3xl p-16 shadow-xl border border-slate-200/50">
        <div class="text-6xl mb-8">🎉</div>
        <h3 class="text-3xl font-bold text-slate-900 mb-4">New Promotions Coming Soon</h3>
        <p class="text-slate-600 mb-8 max-w-md mx-auto text-lg leading-relaxed">
          We're preparing special offers for our patients. Contact us to learn about current availability.
        </p>
        <a 
          href="/contact" 
          class="inline-flex items-center gap-3 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-4 rounded-2xl font-semibold text-lg transition-all duration-300 hover:shadow-xl hover:scale-105"
        >
          <span class="text-2xl">📞</span>
          <span>Contact Us</span>
        </a>
      </div>
    {/if}
  </div>
</section>

<!-- Enhanced Contact Section -->
<section id="contact" class="py-24 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <div class="text-center mb-20">
      <div class="inline-flex items-center gap-3 bg-blue-50 px-6 py-3 rounded-full mb-8">
        <span class="text-2xl">📍</span>
        <span class="font-semibold text-blue-700">Visit Our Modern Clinic</span>
      </div>
      <h2 class="text-4xl lg:text-5xl font-bold text-slate-900 mb-6">
        Professional Dental
        <span class="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Practice</span>
      </h2>
      <p class="text-xl text-slate-600 max-w-3xl mx-auto leading-relaxed">
        Visit our modern clinic in Auckland for comprehensive dental care in a comfortable, 
        professional environment with the latest technology.
      </p>
      <div class="w-24 h-1 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full mx-auto mt-6"></div>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
      
      <!-- Contact Information Cards -->
      <div class="lg:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-8">
        
        <!-- Location -->
        <div class="group bg-white rounded-3xl p-8 shadow-lg border border-slate-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div class="relative">
            <div class="w-16 h-16 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
              <span class="text-white text-2xl">📍</span>
            </div>
            <h3 class="text-2xl font-bold text-slate-900 mb-4">Our Location</h3>
            <div class="space-y-2 text-slate-700 mb-6">
              <p class="font-semibold text-lg">123 Dental Avenue</p>
              <p>Auckland Central</p>
              <p>Auckland 1010, New Zealand</p>
            </div>
            <a 
              href="https://maps.google.com/?q=123+Dental+Avenue+Auckland+New+Zealand" 
              target="_blank" 
              rel="noopener noreferrer"
              class="inline-flex items-center gap-2 text-blue-600 font-semibold hover:text-blue-700 transition-colors group-hover:translate-x-2 duration-300"
            >
              <span class="text-lg">🗺️</span>
              <span>View on Google Maps</span>
            </a>
          </div>
        </div>

        <!-- Office Hours -->
        <div class="group bg-white rounded-3xl p-8 shadow-lg border border-slate-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-emerald-50/50 to-green-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div class="relative">
            <div class="w-16 h-16 bg-gradient-to-r from-emerald-500 to-green-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
              <span class="text-white text-2xl">🕒</span>
            </div>
            <h3 class="text-2xl font-bold text-slate-900 mb-4">Office Hours</h3>
            <div class="space-y-3 text-slate-700">
              <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span class="font-medium">Monday - Friday</span>
                <span class="font-semibold text-green-600">8:00 AM - 6:00 PM</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span class="font-medium">Saturday</span>
                <span class="font-semibold text-green-600">9:00 AM - 4:00 PM</span>
              </div>
              <div class="flex justify-between items-center p-3 bg-slate-50 rounded-xl">
                <span class="font-medium">Sunday</span>
                <span class="text-slate-500">Closed</span>
              </div>
              <div class="pt-3 border-t border-slate-200">
                <div class="flex items-center gap-2 text-sm text-emerald-600">
                  <span>✓</span>
                  <span class="font-medium">Extended evening hours available</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Phone Contact -->
        <div class="group bg-white rounded-3xl p-8 shadow-lg border border-slate-200/50 hover:shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-purple-50/50 to-indigo-50/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div class="relative">
            <div class="w-16 h-16 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg">
              <span class="text-white text-2xl">📞</span>
            </div>
            <h3 class="text-2xl font-bold text-slate-900 mb-4">Contact Numbers</h3>
            <div class="space-y-4 text-slate-700">
              <div class="p-4 bg-slate-50 rounded-xl">
                <a href="tel:+6491234567" class="text-2xl font-bold text-purple-600 hover:text-purple-700 transition-colors block">
                  (09) 123-4567
                </a>
                <p class="text-sm text-slate-600 mt-1">General appointments & inquiries</p>
              </div>
              <div class="p-4 bg-slate-50 rounded-xl">
                <a href="mailto:info@auroradentica.co.nz" class="font-semibold text-purple-600 hover:text-purple-700 transition-colors block text-lg">
                  info@auroradentica.co.nz
                </a>
                <p class="text-sm text-slate-600 mt-1">Email consultations</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Emergency Contact -->
        <div class="group bg-gradient-to-br from-red-50 to-orange-50 rounded-3xl p-8 shadow-lg border-2 border-red-200 hover:shadow-2xl hover:scale-105 transition-all duration-500 relative overflow-hidden">
          <div class="absolute inset-0 bg-gradient-to-br from-red-100/50 to-orange-100/50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
          
          <div class="relative">
            <div class="w-16 h-16 bg-gradient-to-r from-red-500 to-orange-500 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 group-hover:rotate-12 transition-all duration-300 shadow-lg animate-pulse">
              <span class="text-white text-2xl">🚨</span>
            </div>
            <h3 class="text-2xl font-bold text-slate-900 mb-4">Emergency Care</h3>
            <div class="space-y-4 text-slate-700">
              <div class="p-4 bg-white/80 rounded-xl">
                <a href="tel:+6491234568" class="text-2xl font-bold text-red-700 hover:text-red-800 transition-colors block">
                  (09) 123-4568
                </a>
                <p class="text-sm text-red-600 font-semibold mt-1">24/7 Emergency Hotline</p>
              </div>
              <p class="text-sm text-slate-600 bg-white/60 p-3 rounded-xl">
                For urgent dental emergencies outside regular office hours
              </p>
            </div>
          </div>
        </div>
      </div>

      <!-- Main CTA Card -->
      <div class="relative">
        <div class="bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 rounded-3xl p-10 text-white shadow-2xl relative overflow-hidden">
          
          <!-- Background pattern -->
          <div class="absolute inset-0 opacity-10">
            <div class="absolute top-4 right-4 w-32 h-32 bg-white rounded-full blur-3xl animate-pulse"></div>
            <div class="absolute bottom-6 left-6 w-24 h-24 bg-white rounded-full blur-2xl animate-pulse" style="animation-delay: 2s;"></div>
            <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full blur-3xl opacity-5"></div>
          </div>
          
          <div class="relative z-10 space-y-8">
            <div class="text-center">
              <div class="w-20 h-20 bg-white/20 backdrop-blur-sm rounded-3xl mx-auto mb-6 flex items-center justify-center border border-white/30 shadow-2xl">
                <span class="text-4xl">📅</span>
              </div>
              <h3 class="text-3xl font-bold mb-4">Schedule Your Visit</h3>
              <p class="text-blue-100 leading-relaxed text-lg">
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
                <span class="text-3xl group-hover:scale-110 transition-transform duration-300">💬</span>
                <span>Book Online Now</span>
              </div>
            </a>
            
            <div class="pt-6 border-t border-white/20">
              <div class="grid grid-cols-2 gap-4 text-sm">
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
                <div class="flex items-center gap-2">
                  <span class="text-lg">✓</span>
                  <span>Flexible Hours</span>
                </div>
              </div>
            </div>

            <!-- Insurance Information -->
            <div class="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <h4 class="font-bold text-lg mb-3 flex items-center gap-2">
                <span class="text-2xl">🛡️</span>
                <span>Insurance & Payment</span>
              </h4>
              <div class="text-sm space-y-2 text-blue-100">
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
    outline: 3px solid #3b82f6;
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
    background: rgba(59, 130, 246, 0.2);
    color: #1e293b;
  }

  /* Custom scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
  }

  ::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: linear-gradient(135deg, #3b82f6, #8b5cf6);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #2563eb, #7c3aed);
  }
</style>