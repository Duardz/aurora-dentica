<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore, signIn } from '$lib/stores/auth';
  import { isValidEmail } from '$lib/utils';

  let email = '';
  let password = '';
  let loading = false;
  let error = '';
  let showPassword = false;
  let rememberMe = false;

  onMount(() => {
    // If already logged in, redirect to dashboard
    const unsubscribe = authStore.subscribe((auth) => {
      if (auth.user) {
        goto('/admin/dashboard');
      }
    });

    // Check for remembered email
    const rememberedEmail = localStorage.getItem('aurora_admin_email');
    if (rememberedEmail) {
      email = rememberedEmail;
      rememberMe = true;
    }

    return unsubscribe;
  });

  async function handleLogin() {
    // Clear previous errors
    error = '';

    // Validate inputs
    if (!email || !password) {
      error = 'Please enter both email and password';
      return;
    }

    if (!isValidEmail(email)) {
      error = 'Please enter a valid email address';
      return;
    }

    loading = true;

    try {
      const success = await signIn(email, password);
      if (success) {
        // Handle remember me
        if (rememberMe) {
          localStorage.setItem('aurora_admin_email', email);
        } else {
          localStorage.removeItem('aurora_admin_email');
        }
        
        await goto('/admin/dashboard');
      } else {
        // Error is handled in the auth store
        authStore.subscribe(state => {
          if (state.error) {
            error = state.error;
          }
        })();
      }
    } catch (err) {
      error = 'An unexpected error occurred';
    } finally {
      loading = false;
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Enter') {
      handleLogin();
    }
  }

  function togglePasswordVisibility() {
    showPassword = !showPassword;
  }

  function clearError() {
    error = '';
  }
</script>

<svelte:head>
  <title>Admin Login - Aurora Dentica</title>
  <meta name="description" content="Secure admin login for Aurora Dentica staff" />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center py-8 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-6">
    
    <!-- Header -->
    <div class="text-center">
      <div class="text-5xl sm:text-6xl mb-4">🦷</div>
      <h2 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Aurora Dentica</h2>
      <p class="text-gray-600 text-sm sm:text-base">Admin Panel Access</p>
    </div>

    <!-- Login Form -->
    <div class="bg-white rounded-2xl shadow-xl p-6 sm:p-8">
      <form on:submit|preventDefault={handleLogin} class="space-y-6">
        
        <!-- Email Input -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <div class="relative">
            <input
              id="email"
              type="email"
              autocomplete="email"
              required
              bind:value={email}
              on:keydown={handleKeydown}
              on:input={clearError}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 {error ? 'border-red-500' : ''}"
              placeholder="admin@auroradentica.co.nz"
              disabled={loading}
            />
            <div class="absolute inset-y-0 right-0 flex items-center pr-3">
              <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" />
              </svg>
            </div>
          </div>
        </div>

        <!-- Password Input -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <div class="relative">
            <input
              id="password"
              type={showPassword ? 'text' : 'password'}
              autocomplete="current-password"
              required
              bind:value={password}
              on:keydown={handleKeydown}
              on:input={clearError}
              class="w-full px-4 py-3 pr-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 {error ? 'border-red-500' : ''}"
              placeholder="Enter your password"
              disabled={loading}
            />
            <button
              type="button"
              on:click={togglePasswordVisibility}
              class="absolute inset-y-0 right-0 flex items-center pr-3 hover:text-gray-600 transition-colors"
              disabled={loading}
            >
              {#if showPassword}
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L8.464 8.464" />
                </svg>
              {:else}
                <svg class="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              {/if}
            </button>
          </div>
        </div>

        <!-- Remember Me -->
        <div class="flex items-center">
          <input
            id="remember-me"
            type="checkbox"
            bind:checked={rememberMe}
            class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded transition-colors"
            disabled={loading}
          />
          <label for="remember-me" class="ml-2 block text-sm text-gray-700">
            Remember my email
          </label>
        </div>

        <!-- Error Message -->
        {#if error}
          <div class="bg-red-50 border border-red-200 rounded-lg p-4 animate-fade-in">
            <div class="flex items-center">
              <span class="text-red-500 text-lg mr-3">⚠️</span>
              <div class="flex-1">
                <p class="text-red-700 text-sm font-medium">{error}</p>
              </div>
              <button
                type="button"
                on:click={clearError}
                class="text-red-500 hover:text-red-700 transition-colors"
              >
                <svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        {/if}

        <!-- Login Button -->
        <button
          type="submit"
          disabled={loading || !email || !password}
          class="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center group transform hover:-translate-y-0.5 disabled:transform-none shadow-lg hover:shadow-xl disabled:shadow-lg"
        >
          {#if loading}
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            <span>Signing In...</span>
          {:else}
            <span>Sign In</span>
            <svg class="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          {/if}
        </button>

      </form>

      <!-- Security Notice -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <div class="flex items-start space-x-3 text-xs text-gray-500">
          <span class="text-primary-600 text-sm">🔒</span>
          <div class="leading-relaxed">
            <p class="font-medium text-gray-700 mb-1">Secure Access</p>
            <p>
              This is a secure admin area. All login attempts are logged and monitored. 
              Only authorized Aurora Dentica staff should access this system.
            </p>
          </div>
        </div>
      </div>

      <!-- Additional Features -->
      <div class="mt-4 grid grid-cols-2 gap-3 text-xs">
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-primary-600 text-lg mb-1">🛡️</div>
          <p class="text-gray-600">Encrypted</p>
        </div>
        <div class="bg-gray-50 rounded-lg p-3 text-center">
          <div class="text-primary-600 text-lg mb-1">📊</div>
          <p class="text-gray-600">Real-time</p>
        </div>
      </div>
    </div>

    <!-- Back to Public Site -->
    <div class="text-center">
      <a 
        href="/" 
        class="text-gray-600 hover:text-gray-800 transition-colors inline-flex items-center space-x-2 text-sm group"
      >
        <svg class="h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 17l-5-5m0 0l5-5m-5 5h12" />
        </svg>
        <span>Back to Public Site</span>
      </a>
    </div>

  </div>
</div>

<style>
  .animate-fade-in {
    animation: fadeIn 0.3s ease-out;
  }
  
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }
</style>