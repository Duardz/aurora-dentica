<script lang="ts">
  import { onMount } from 'svelte';
  import { db, auth } from '$lib/firebase/config';
  import { collection, getDocs } from 'firebase/firestore';

  let loading = true;
  let debugInfo = '';
  let testResults = {
    appointments: 0,
    inventory: 0,
    promos: 0
  };

  onMount(() => {
    // Debug authentication state
    if (auth) {
      auth.onAuthStateChanged((user) => {
        if (user) {
          console.log('🔍 Current user:', {
            email: user.email,
            emailVerified: user.emailVerified,
            uid: user.uid
          });
          debugInfo = `✅ Logged in as: ${user.email} | Verified: ${user.emailVerified}`;
          
          // Test database access
          testDatabaseAccess();
        } else {
          console.log('❌ No user logged in');
          debugInfo = '❌ No user logged in';
          loading = false;
        }
      });
    }
  });

  async function testDatabaseAccess() {
    if (!db || !auth?.currentUser) {
      debugInfo += ' | ❌ Database or auth not available';
      loading = false;
      return;
    }

    try {
      console.log('🧪 Testing database access...');
      
      // Test appointments collection
      try {
        const appointmentsRef = collection(db, 'appointments');
        const appointmentsSnapshot = await getDocs(appointmentsRef);
        testResults.appointments = appointmentsSnapshot.docs.length;
        console.log('✅ Appointments access successful:', testResults.appointments);
      } catch (error) {
        console.log('❌ Appointments access failed:', typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error));
        testResults.appointments = -1;
      }

      // Test inventory collection
      try {
        const inventoryRef = collection(db, 'inventory');
        const inventorySnapshot = await getDocs(inventoryRef);
        testResults.inventory = inventorySnapshot.docs.length;
        console.log('✅ Inventory access successful:', testResults.inventory);
      } catch (error) {
        console.log('❌ Inventory access failed:', typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error));
        testResults.inventory = -1;
      }

      // Test promos collection
      try {
        const promosRef = collection(db, 'promos');
        const promosSnapshot = await getDocs(promosRef);
        testResults.promos = promosSnapshot.docs.length;
        console.log('✅ Promos access successful:', testResults.promos);
      } catch (error) {
        console.log('❌ Promos access failed:', typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error));
        testResults.promos = -1;
      }

      debugInfo += ` | 📊 Collections accessed: ${Object.values(testResults).filter(v => v >= 0).length}/3`;
      
    } catch (error) {
      console.error('❌ Database test failed:', error);
      debugInfo += ` | ❌ Database error: ${typeof error === 'object' && error !== null && 'message' in error ? (error as { message: string }).message : String(error)}`;
    } finally {
      loading = false;
    }
  }

  function getStatusIcon(count: number): string {
    if (count < 0) return '❌';
    return '✅';
  }

  function getStatusText(count: number): string {
    if (count < 0) return 'Access Denied';
    return `${count} items`;
  }
</script>

<svelte:head>
  <title>Database Test - Aurora Dentica Admin</title>
</svelte:head>

<div class="min-h-screen bg-gradient-to-br from-primary-50 to-accent-50 p-4">
  <div class="max-w-4xl mx-auto">
    
    <!-- Header -->
    <div class="text-center mb-8">
      <h1 class="text-3xl font-bold text-gray-900 mb-2">🧪 Database Connection Test</h1>
      <p class="text-gray-600">Testing Firestore permissions and access</p>
    </div>

    {#if loading}
      <!-- Loading State -->
      <div class="card p-8 text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
        <p class="text-gray-600 mb-2">Testing database access...</p>
        {#if debugInfo}
          <p class="text-sm text-gray-500 bg-gray-100 p-2 rounded">{debugInfo}</p>
        {/if}
      </div>
    {:else}
      <!-- Results -->
      <div class="space-y-6">
        
        <!-- Debug Info -->
        {#if debugInfo}
          <div class="card p-4">
            <h2 class="text-lg font-semibold mb-2">🔍 Debug Information</h2>
            <p class="text-sm bg-gray-100 p-3 rounded font-mono">{debugInfo}</p>
          </div>
        {/if}

        <!-- Test Results -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold mb-4">📊 Collection Access Test</h2>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            
            <!-- Appointments -->
            <div class="bg-gray-50 rounded-lg p-4 text-center">
              <div class="text-3xl mb-2">{getStatusIcon(testResults.appointments)}</div>
              <h3 class="font-medium text-gray-900">Appointments</h3>
              <p class="text-sm text-gray-600">{getStatusText(testResults.appointments)}</p>
            </div>

            <!-- Inventory -->
            <div class="bg-gray-50 rounded-lg p-4 text-center">
              <div class="text-3xl mb-2">{getStatusIcon(testResults.inventory)}</div>
              <h3 class="font-medium text-gray-900">Inventory</h3>
              <p class="text-sm text-gray-600">{getStatusText(testResults.inventory)}</p>
            </div>

            <!-- Promos -->
            <div class="bg-gray-50 rounded-lg p-4 text-center">
              <div class="text-3xl mb-2">{getStatusIcon(testResults.promos)}</div>
              <h3 class="font-medium text-gray-900">Promotions</h3>
              <p class="text-sm text-gray-600">{getStatusText(testResults.promos)}</p>
            </div>
          </div>
        </div>

        <!-- Status Summary -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold mb-4">📝 Summary</h2>
          {#if Object.values(testResults).every(v => v >= 0)}
            <div class="bg-green-50 border border-green-200 rounded-lg p-4">
              <div class="flex items-center">
                <span class="text-green-500 text-2xl mr-3">✅</span>
                <div>
                  <h3 class="text-green-800 font-medium">All Tests Passed!</h3>
                  <p class="text-green-700 text-sm">Your Firestore rules are working correctly.</p>
                </div>
              </div>
            </div>
          {:else}
            <div class="bg-red-50 border border-red-200 rounded-lg p-4">
              <div class="flex items-center">
                <span class="text-red-500 text-2xl mr-3">❌</span>
                <div>
                  <h3 class="text-red-800 font-medium">Some Tests Failed</h3>
                  <p class="text-red-700 text-sm">Check your Firestore rules and make sure they're deployed.</p>
                </div>
              </div>
            </div>
          {/if}
        </div>

        <!-- Next Steps -->
        <div class="card p-6">
          <h2 class="text-lg font-semibold mb-4">🚀 Next Steps</h2>
          <div class="space-y-3 text-sm">
            <div class="flex items-start gap-3">
              <span class="text-primary-600 font-bold">1.</span>
              <span>Deploy the simplified Firestore rules (remove email verification requirement)</span>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-primary-600 font-bold">2.</span>
              <span>Add <code class="bg-gray-100 px-2 py-1 rounded">VITE_ENCRYPTION_KEY=aurora-dentica-secure-key-philippines-2024</code> to your .env file</span>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-primary-600 font-bold">3.</span>
              <span>Verify your email in Firebase Console or temporarily remove email verification from rules</span>
            </div>
            <div class="flex items-start gap-3">
              <span class="text-primary-600 font-bold">4.</span>
              <span>Restart your dev server after adding the encryption key</span>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="text-center space-y-4">
          <button 
            on:click={() => window.location.reload()} 
            class="btn-primary"
          >
            🔄 Retry Test
          </button>
          
          {#if Object.values(testResults).every(v => v >= 0)}
            <div>
              <a href="/admin/dashboard" class="btn-success">
                ✅ Go to Dashboard
              </a>
            </div>
          {/if}
        </div>
      </div>
    {/if}
  </div>
</div>