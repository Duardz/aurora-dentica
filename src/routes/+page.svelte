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
</script>

<svelte:head>
  <title>Aurora Dentica - Professional Dental Care</title>
  <meta name="description" content="Experience exceptional dental care at Aurora Dentica. Professional treatments, modern facility, and personalized service for your oral health needs." />
</svelte:head>

<!-- Header -->
<header class="bg-white shadow-sm border-b border-gray-100">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <div class="flex items-center">
        <div class="flex-shrink-0">
          <h1 class="text-2xl font-bold text-primary-600">🦷 Aurora Dentica</h1>
        </div>
      </div>
      <div class="hidden md:block">
        <div class="ml-10 flex items-baseline space-x-4">
          <a href="#services" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Services</a>
          <a href="#promotions" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Promotions</a>
          <a href="#contact" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Contact</a>
          <a href="/contact" class="bg-primary-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-primary-700 transition-colors">Book Appointment</a>
        </div>
      </div>
      <!-- Mobile menu button -->
      <div class="md:hidden">
        <a href="/contact" class="bg-primary-600 text-white px-3 py-2 rounded-lg text-sm font-medium">Book Now</a>
      </div>
    </div>
  </nav>
</header>

<!-- Hero Section -->
<section class="relative bg-gradient-to-br from-primary-50 to-accent-50 py-16 lg:py-24">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h2 class="text-4xl lg:text-6xl font-bold text-gray-900 mb-6">
        Your Smile is Our
        <span class="text-primary-600">Priority</span>
      </h2>
      <p class="text-xl text-gray-600 mb-8 max-w-3xl mx-auto">
        Experience exceptional dental care with our modern facility, advanced technology, and personalized approach to your oral health needs.
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <a href="/contact" class="bg-primary-600 text-white px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-700 transition-colors inline-flex items-center justify-center">
          📅 Book Appointment
        </a>
        <a href="#services" class="border-2 border-primary-600 text-primary-600 px-8 py-3 rounded-lg text-lg font-medium hover:bg-primary-600 hover:text-white transition-colors inline-flex items-center justify-center">
          Learn More
        </a>
      </div>
    </div>
  </div>
</section>

<!-- Services Section -->
<section id="services" class="py-16 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h3 class="text-3xl font-bold text-gray-900 mb-4">Our Services</h3>
      <p class="text-lg text-gray-600 max-w-2xl mx-auto">
        Comprehensive dental care services designed to keep your smile healthy and beautiful.
      </p>
    </div>
    
    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      <!-- General Dentistry -->
      <div class="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-6 border border-gray-100">
        <div class="text-primary-600 text-4xl mb-4">🦷</div>
        <h4 class="text-xl font-semibold text-gray-900 mb-3">General Dentistry</h4>
        <p class="text-gray-600 mb-4">Regular checkups, cleanings, fillings, and preventive care to maintain optimal oral health.</p>
        <ul class="text-sm text-gray-500 space-y-1">
          <li>• Routine cleanings</li>
          <li>• Dental examinations</li>
          <li>• Cavity fillings</li>
          <li>• Fluoride treatments</li>
        </ul>
      </div>

      <!-- Cosmetic Dentistry -->
      <div class="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-6 border border-gray-100">
        <div class="text-primary-600 text-4xl mb-4">✨</div>
        <h4 class="text-xl font-semibold text-gray-900 mb-3">Cosmetic Dentistry</h4>
        <p class="text-gray-600 mb-4">Enhance your smile with professional whitening, veneers, and aesthetic treatments.</p>
        <ul class="text-sm text-gray-500 space-y-1">
          <li>• Teeth whitening</li>
          <li>• Dental veneers</li>
          <li>• Smile makeovers</li>
          <li>• Bonding & contouring</li>
        </ul>
      </div>

      <!-- Emergency Care -->
      <div class="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-6 border border-gray-100">
        <div class="text-primary-600 text-4xl mb-4">🚨</div>
        <h4 class="text-xl font-semibold text-gray-900 mb-3">Emergency Care</h4>
        <p class="text-gray-600 mb-4">Urgent dental care when you need it most, with same-day appointments available.</p>
        <ul class="text-sm text-gray-500 space-y-1">
          <li>• Toothache relief</li>
          <li>• Broken tooth repair</li>
          <li>• Same-day appointments</li>
          <li>• Pain management</li>
        </ul>
      </div>
    </div>
  </div>
</section>

<!-- Promotions Section -->
<section id="promotions" class="py-16 bg-gray-50">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h3 class="text-3xl font-bold text-gray-900 mb-4">Current Promotions</h3>
      <p class="text-lg text-gray-600">Special offers to help you maintain your dental health.</p>
    </div>

    {#if loading}
      <div class="flex justify-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    {:else if promos.length > 0}
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {#each promos as promo}
          <div class="bg-white rounded-xl shadow-card hover:shadow-card-hover transition-shadow p-6 border border-gray-100">
            <div class="flex items-start justify-between mb-4">
              <h4 class="text-xl font-semibold text-gray-900">{promo.title}</h4>
              <span class="bg-accent-100 text-accent-700 px-2 py-1 rounded-full text-xs font-medium">
                Valid until {formatDisplayDate(promo.validUntil)}
              </span>
            </div>
            <p class="text-gray-600 mb-4">{promo.description}</p>
            <a href="/contact" class="inline-flex items-center text-primary-600 font-medium hover:text-primary-700 transition-colors">
              Book This Offer →
            </a>
          </div>
        {/each}
      </div>
    {:else}
      <div class="text-center py-12">
        <div class="text-gray-400 text-5xl mb-4">🎉</div>
        <p class="text-gray-500">No current promotions available. Check back soon!</p>
      </div>
    {/if}
  </div>
</section>

<!-- Contact Section -->
<section id="contact" class="py-16 bg-white">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center mb-12">
      <h3 class="text-3xl font-bold text-gray-900 mb-4">Visit Our Clinic</h3>
      <p class="text-lg text-gray-600">We're here to serve you with convenient hours and easy booking.</p>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-2 gap-12">
      <!-- Contact Info -->
      <div class="space-y-8">
        <div class="flex items-start space-x-4">
          <div class="text-primary-600 text-2xl">📍</div>
          <div>
            <h4 class="font-semibold text-gray-900 mb-2">Location</h4>
            <p class="text-gray-600">
              123 Dental Avenue<br>
              Auckland, New Zealand 1010
            </p>
          </div>
        </div>

        <div class="flex items-start space-x-4">
          <div class="text-primary-600 text-2xl">🕒</div>
          <div>
            <h4 class="font-semibold text-gray-900 mb-2">Hours</h4>
            <div class="text-gray-600 space-y-1">
              <p>Monday - Friday: 8:00 AM - 6:00 PM</p>
              <p>Saturday: 9:00 AM - 4:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>

        <div class="flex items-start space-x-4">
          <div class="text-primary-600 text-2xl">📞</div>
          <div>
            <h4 class="font-semibold text-gray-900 mb-2">Contact</h4>
            <div class="text-gray-600 space-y-1">
              <p>Phone: (09) 123-4567</p>
              <p>Emergency: (09) 123-4568</p>
              <p>Email: hello@auroradentica.co.nz</p>
            </div>
          </div>
        </div>
      </div>

      <!-- CTA Card -->
      <div class="bg-gradient-to-br from-primary-50 to-accent-50 rounded-xl p-8">
        <h4 class="text-2xl font-bold text-gray-900 mb-4">Ready to Book?</h4>
        <p class="text-gray-600 mb-6">
          Schedule your appointment through Facebook Messenger for quick and easy booking. Our team will respond within hours to confirm your preferred time.
        </p>
        <a 
          href="/contact" 
          class="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors inline-flex items-center space-x-2"
        >
          <span>💬</span>
          <span>Book via Messenger</span>
        </a>
        
        <div class="mt-6 pt-6 border-t border-gray-200">
          <p class="text-sm text-gray-500 mb-3">Follow us for updates and tips:</p>
          <a 
            href="https://facebook.com/auroradentica" 
            target="_blank" 
            rel="noopener noreferrer"
            class="inline-flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
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
<footer class="bg-gray-900 text-white py-12">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="text-center">
      <h5 class="text-2xl font-bold mb-4">🦷 Aurora Dentica</h5>
      <p class="text-gray-400 mb-6">Professional dental care you can trust</p>
      <div class="flex justify-center space-x-6 text-sm text-gray-400">
        <span>© 2024 Aurora Dentica</span>
        <span>•</span>
        <span>Auckland, New Zealand</span>
        <span>•</span>
        <a href="mailto:hello@auroradentica.co.nz" class="hover:text-white transition-colors">
          hello@auroradentica.co.nz
        </a>
      </div>
    </div>
  </div>
</footer>