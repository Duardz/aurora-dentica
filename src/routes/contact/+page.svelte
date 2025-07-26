<script lang="ts">
  import { onMount } from 'svelte';

  onMount(() => {
    // Redirect to Facebook Messenger after a short delay
    const timer = setTimeout(() => {
      window.open('https://m.me/auroradentica', '_blank', 'noopener,noreferrer');
    }, 2000);

    return () => clearTimeout(timer);
  });
</script>

<svelte:head>
  <title>Book Appointment - Aurora Dentica</title>
  <meta name="description" content="Book your dental appointment at Aurora Dentica through Facebook Messenger. Quick, easy, and convenient scheduling." />
</svelte:head>

<!-- Header -->
<header class="bg-white shadow-sm border-b border-gray-100">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <div class="flex items-center">
        <a href="/" class="flex-shrink-0">
          <h1 class="text-2xl font-bold text-primary-600">🦷 Aurora Dentica</h1>
        </a>
      </div>
      <div class="hidden md:block">
        <div class="ml-10 flex items-baseline space-x-4">
          <a href="/" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Home</a>
          <a href="/#services" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Services</a>
          <a href="/#promotions" class="text-gray-600 hover:text-primary-600 px-3 py-2 rounded-md text-sm font-medium transition-colors">Promotions</a>
        </div>
      </div>
      <div class="md:hidden">
        <a href="/" class="text-primary-600 hover:text-primary-700 font-medium">← Back</a>
      </div>
    </div>
  </nav>
</header>

<!-- Main Content -->
<main class="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-16">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <!-- Booking Card -->
    <div class="bg-white rounded-2xl shadow-xl p-8 md:p-12 text-center">
      <div class="mb-8">
        <div class="text-6xl mb-4">📅</div>
        <h2 class="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
          Book Your Appointment
        </h2>
        <p class="text-lg text-gray-600 max-w-2xl mx-auto">
          We use Facebook Messenger for quick and convenient appointment booking. 
          You'll be redirected automatically, or click the button below.
        </p>
      </div>

      <!-- Messenger CTA -->
      <div class="mb-8">
        <a 
          href="https://m.me/auroradentica" 
          target="_blank" 
          rel="noopener noreferrer"
          class="bg-primary-600 text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-primary-700 transition-colors inline-flex items-center space-x-3 shadow-lg hover:shadow-xl"
        >
          <span class="text-2xl">💬</span>
          <span>Open Messenger</span>
        </a>
      </div>

      <!-- Loading Animation -->
      <div class="mb-8">
        <div class="flex justify-center items-center space-x-2 text-gray-500">
          <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
          <span class="text-sm">Redirecting to Messenger...</span>
        </div>
      </div>

      <!-- Instructions -->
      <div class="bg-gray-50 rounded-xl p-6 text-left max-w-2xl mx-auto">
        <h3 class="font-semibold text-gray-900 mb-3 flex items-center">
          <span class="text-xl mr-2">📝</span>
          Booking Instructions
        </h3>
        <ul class="space-y-2 text-gray-600 text-sm">
          <li class="flex items-start">
            <span class="text-primary-600 mr-2 font-bold">1.</span>
            <span>Send us a message with your preferred date and time</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary-600 mr-2 font-bold">2.</span>
            <span>Include the type of service you need (cleaning, checkup, etc.)</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary-600 mr-2 font-bold">3.</span>
            <span>Mention if you're a new patient or returning</span>
          </li>
          <li class="flex items-start">
            <span class="text-primary-600 mr-2 font-bold">4.</span>
            <span>We'll confirm your appointment within a few hours</span>
          </li>
        </ul>
      </div>

      <!-- Alternative Contact -->
      <div class="mt-8 pt-8 border-t border-gray-200">
        <h3 class="font-semibold text-gray-900 mb-4">Prefer to Call?</h3>
        <div class="flex flex-col sm:flex-row justify-center items-center space-y-4 sm:space-y-0 sm:space-x-8">
          <a 
            href="tel:+6491234567" 
            class="flex items-center space-x-2 text-primary-600 hover:text-primary-700 transition-colors"
          >
            <span class="text-xl">📞</span>
            <span class="font-medium">(09) 123-4567</span>
          </a>
          <div class="text-gray-400">•</div>
          <div class="text-gray-600 text-sm">
            Mon-Fri: 8AM-6PM<br class="sm:hidden">
            <span class="hidden sm:inline"> | </span>Sat: 9AM-4PM
          </div>
        </div>
      </div>

      <!-- Emergency Contact -->
      <div class="mt-6 bg-red-50 border border-red-200 rounded-lg p-4">
        <h4 class="font-semibold text-red-800 mb-2 flex items-center justify-center">
          <span class="text-lg mr-2">🚨</span>
          Dental Emergency?
        </h4>
        <p class="text-red-700 text-sm mb-2">
          For urgent dental issues, call our emergency line:
        </p>
        <a 
          href="tel:+6491234568" 
          class="text-red-800 font-bold hover:text-red-900 transition-colors"
        >
          (09) 123-4568
        </a>
      </div>
    </div>

    <!-- Back to Home -->
    <div class="text-center mt-8">
      <a 
        href="/" 
        class="text-gray-600 hover:text-gray-800 transition-colors inline-flex items-center space-x-2"
      >
        <span>←</span>
        <span>Back to Homepage</span>
      </a>
    </div>

  </div>
</main>