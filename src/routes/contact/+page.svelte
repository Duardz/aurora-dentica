<script lang="ts">
  import { onMount } from 'svelte';

  let redirecting = true;
  let countdown = 3;
  let timer: ReturnType<typeof setInterval>;

  onMount(() => {
    // Start countdown
    timer = setInterval(() => {
      countdown--;
      if (countdown === 0) {
        clearInterval(timer);
        openMessenger();
      }
    }, 1000);

    return () => {
      if (timer) clearInterval(timer);
    };
  });

  function openMessenger() {
    redirecting = false;
    window.open('https://m.me/auroradentica', '_blank', 'noopener,noreferrer');
  }

  function cancelRedirect() {
    if (timer) clearInterval(timer);
    redirecting = false;
  }
</script>

<svelte:head>
  <title>Book Appointment - Aurora Dentica</title>
  <meta name="description" content="Book your dental appointment at Aurora Dentica through Facebook Messenger. Quick, easy, and convenient scheduling." />
</svelte:head>

<!-- Header -->
<header class="bg-white shadow-sm border-b border-gray-100 sticky top-0 z-40">
  <nav class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <div class="flex items-center">
        <a href="/" class="flex-shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity">
          <span class="text-2xl sm:text-3xl">🦷</span>
          <h1 class="text-xl sm:text-2xl font-bold text-primary-600">
            <span class="hidden xs:inline">Aurora Dentica</span>
            <span class="xs:hidden">Aurora</span>
          </h1>
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
        <a href="/" class="text-primary-600 hover:text-primary-700 font-medium transition-colors flex items-center gap-1">
          <span>←</span>
          <span>Back</span>
        </a>
      </div>
    </div>
  </nav>
</header>

<!-- Main Content -->
<main class="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 py-8 sm:py-16">
  <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
    
    <!-- Booking Card -->
    <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8 md:p-12 text-center">
      
      <!-- Header -->
      <div class="mb-6 sm:mb-8">
        <div class="text-5xl sm:text-6xl mb-4">📅</div>
        <h2 class="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 mb-3 sm:mb-4">
          Book Your Appointment
        </h2>
        <p class="text-base sm:text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
          We use Facebook Messenger for quick and convenient appointment booking. 
          {#if redirecting}
            Redirecting automatically in {countdown} seconds...
          {:else}
            Click the button below to start.
          {/if}
        </p>
      </div>

      <!-- Messenger CTA -->
      <div class="mb-6 sm:mb-8">
        <button 
          on:click={openMessenger}
          class="bg-primary-600 text-white px-6 sm:px-8 py-3 sm:py-4 rounded-xl text-base sm:text-lg font-semibold hover:bg-primary-700 transition-all duration-200 inline-flex items-center space-x-3 shadow-lg hover:shadow-xl transform hover:-translate-y-1 w-full sm:w-auto justify-center"
        >
          <span class="text-xl sm:text-2xl">💬</span>
          <span>Open Messenger</span>
        </button>
      </div>

      <!-- Loading/Countdown Animation -->
      {#if redirecting}
        <div class="mb-6 sm:mb-8">
          <div class="flex justify-center items-center space-x-3 text-gray-500 mb-4">
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-primary-600"></div>
            <span class="text-sm sm:text-base">Redirecting in {countdown}...</span>
          </div>
          <button 
            on:click={cancelRedirect}
            class="text-gray-500 hover:text-gray-700 text-sm underline transition-colors"
          >
            Cancel automatic redirect
          </button>
        </div>
      {/if}

      <!-- Instructions -->
      <div class="bg-gray-50 rounded-xl p-4 sm:p-6 text-left max-w-2xl mx-auto mb-6 sm:mb-8">
        <h3 class="font-semibold text-gray-900 mb-4 flex items-center text-base sm:text-lg">
          <span class="text-xl sm:text-2xl mr-2">📝</span>
          How to Book Your Appointment
        </h3>
        <div class="space-y-3">
          <div class="flex items-start gap-3">
            <span class="bg-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">1</span>
            <p class="text-gray-600 text-sm sm:text-base">Send us a message with your preferred date and time</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">2</span>
            <p class="text-gray-600 text-sm sm:text-base">Include the type of service you need (cleaning, checkup, emergency, etc.)</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">3</span>
            <p class="text-gray-600 text-sm sm:text-base">Mention if you're a new patient or returning customer</p>
          </div>
          <div class="flex items-start gap-3">
            <span class="bg-primary-600 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center flex-shrink-0 mt-0.5">4</span>
            <p class="text-gray-600 text-sm sm:text-base">We'll confirm your appointment within a few hours during business hours</p>
          </div>
        </div>
      </div>

      <!-- Alternative Contact Grid -->
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-6 sm:mb-8">
        
        <!-- Phone Contact -->
        <div class="bg-blue-50 border border-blue-200 rounded-xl p-4 sm:p-6">
          <h3 class="font-semibold text-blue-900 mb-3 flex items-center justify-center gap-2">
            <span class="text-xl">📞</span>
            <span>Prefer to Call?</span>
          </h3>
          <div class="space-y-2">
            <a 
              href="tel:+6491234567" 
              class="block text-blue-700 hover:text-blue-900 transition-colors font-medium text-lg"
            >
              (09) 123-4567
            </a>
            <div class="text-blue-600 text-sm">
              <p>Mon-Fri: 8:00 AM - 6:00 PM</p>
              <p>Saturday: 9:00 AM - 4:00 PM</p>
              <p>Sunday: Closed</p>
            </div>
          </div>
        </div>

        <!-- Emergency Contact -->
        <div class="bg-red-50 border border-red-200 rounded-xl p-4 sm:p-6">
          <h3 class="font-semibold text-red-900 mb-3 flex items-center justify-center gap-2">
            <span class="text-xl">🚨</span>
            <span>Emergency?</span>
          </h3>
          <div class="space-y-2">
            <p class="text-red-700 text-sm mb-2">
              For urgent dental issues:
            </p>
            <a 
              href="tel:+6491234568" 
              class="block text-red-700 hover:text-red-900 transition-colors font-bold text-lg"
            >
              (09) 123-4568
            </a>
            <p class="text-red-600 text-xs">Available 24/7 for emergencies</p>
          </div>
        </div>
      </div>

      <!-- Location Info -->
      <div class="bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-4 sm:p-6 mb-6 sm:mb-8">
        <h3 class="font-semibold text-gray-900 mb-4 flex items-center justify-center gap-2">
          <span class="text-xl sm:text-2xl">📍</span>
          <span>Visit Our Clinic</span>
        </h3>
        <div class="text-gray-600 space-y-1">
          <p class="font-medium">123 Dental Avenue</p>
          <p>Auckland, New Zealand 1010</p>
        </div>
        <div class="mt-4">
          <a 
            href="https://maps.google.com/?q=123+Dental+Avenue+Auckland+New+Zealand" 
            target="_blank" 
            rel="noopener noreferrer"
            class="inline-flex items-center gap-2 text-primary-600 hover:text-primary-700 font-medium text-sm transition-colors"
          >
            <span>🗺️</span>
            <span>View on Google Maps</span>
          </a>
        </div>
      </div>

      <!-- Services Quick List -->
      <div class="text-left">
        <h3 class="font-semibold text-gray-900 mb-4 text-center">Popular Services</h3>
        <div class="grid grid-cols-2 sm:grid-cols-3 gap-2 text-sm">
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <div class="text-lg mb-1">🦷</div>
            <div class="text-gray-700">Cleaning</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <div class="text-lg mb-1">🔍</div>
            <div class="text-gray-700">Checkup</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <div class="text-lg mb-1">✨</div>
            <div class="text-gray-700">Whitening</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <div class="text-lg mb-1">🔧</div>
            <div class="text-gray-700">Filling</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <div class="text-lg mb-1">👑</div>
            <div class="text-gray-700">Crown</div>
          </div>
          <div class="bg-gray-50 rounded-lg p-3 text-center">
            <div class="text-lg mb-1">🚨</div>
            <div class="text-gray-700">Emergency</div>
          </div>
        </div>
      </div>
    </div>

    <!-- Back to Home -->
    <div class="text-center mt-6 sm:mt-8">
      <a 
        href="/" 
        class="text-gray-600 hover:text-gray-800 transition-colors inline-flex items-center space-x-2 text-sm sm:text-base"
      >
        <span>←</span>
        <span>Back to Homepage</span>
      </a>
    </div>

  </div>
</main>

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