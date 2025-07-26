<script lang="ts">
  import { onMount } from 'svelte';
  import { goto } from '$app/navigation';
  import { authStore, signIn } from '$lib/stores/auth';
  import { isValidEmail } from '$lib/utils';

  let email = '';
  let password = '';
  let loading = false;
  let error = '';

  onMount(() => {
    // If already logged in, redirect to dashboard
    const unsubscribe = authStore.subscribe((auth) => {
      if (auth.user) {
        goto('/admin/dashboard');
      }
    });

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
</script>

<svelte:head>
  <title>Admin Login - Aurora Dentica</title>
  <meta name="description" content="Secure admin login for Aurora Dentica staff" />
  <meta name="robots" content="noindex, nofollow" />
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
  <div class="max-w-md w-full space-y-8">
    
    <!-- Header -->
    <div class="text-center">
      <div class="text-6xl mb-4">🦷</div>
      <h2 class="text-3xl font-bold text-gray-900 mb-2">Aurora Dentica</h2>
      <p class="text-gray-600">Admin Panel Access</p>
    </div>

    <!-- Login Form -->
    <div class="bg-white rounded-xl shadow-xl p-8">
      <form on:submit|preventDefault={handleLogin} class="space-y-6">
        
        <!-- Email Input -->
        <div>
          <label for="email" class="block text-sm font-medium text-gray-700 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            autocomplete="email"
            required
            bind:value={email}
            on:keydown={handleKeydown}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="admin@auroradentica.co.nz"
            disabled={loading}
          />
        </div>

        <!-- Password Input -->
        <div>
          <label for="password" class="block text-sm font-medium text-gray-700 mb-2">
            Password
          </label>
          <input
            id="password"
            type="password"
            autocomplete="current-password"
            required
            bind:value={password}
            on:keydown={handleKeydown}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-colors"
            placeholder="Enter your password"
            disabled={loading}
          />
        </div>

        <!-- Error Message -->
        {#if error}
          <div class="bg-red-50 border border-red-200 rounded-lg p-4">
            <div class="flex items-center">
              <span class="text-red-500 text-lg mr-2">⚠️</span>
              <p class="text-red-700 text-sm">{error}</p>
            </div>
          </div>
        {/if}

        <!-- Login Button -->
        <button
          type="submit"
          disabled={loading}
          class="w-full bg-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
        >
          {#if loading}
            <div class="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
            Signing In...
          {:else}
            Sign In
          {/if}
        </button>

      </form>

      <!-- Security Notice -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <div class="flex items-start space-x-2 text-xs text-gray-500">
          <span class="text-primary-600">🔒</span>
          <p>
            This is a secure admin area. All login attempts are logged and monitored. 
            Only authorized Aurora Dentica staff should access this system.
          </p>
        </div>
      </div>
    </div>

    <!-- Back to Public Site -->
    <div class="text-center">
      <a 
        href="/" 
        class="text-gray-600 hover:text-gray-800 transition-colors inline-flex items-center space-x-2 text-sm"
      >
        <span>←</span>
        <span>Back to Public Site</span>
      </a>
    </div>

  </div>
</div>