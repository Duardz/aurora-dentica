<script lang="ts">
  import { onMount } from 'svelte';
  import { db } from '$lib/firebase/config';
  import { 
    collection, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc,
    orderBy,
    query,
    Timestamp 
  } from 'firebase/firestore';
  import { encrypt, decrypt, encryptFields, decryptFields } from '$lib/encryption';
  import { formatDisplayDate, sanitizeInput, debounce, getTodayDate } from '$lib/utils';

  interface Promotion {
    id: string;
    title: string;
    description: string;
    validUntil: string;
    discount?: string;
    promoCode?: string;
    maxUses: number;
    currentUses: number;
    isPublic: boolean;
    createdAt?: any;
  }

  interface PromoForm {
    title: string;
    description: string;
    validUntil: string;
    discount: string;
    promoCode: string;
    maxUses: number;
    isPublic: boolean;
  }

  let promos: Promotion[] = [];
  let filteredPromos: Promotion[] = [];
  let loading = true;
  let showAddForm = false;
  let editingId: string | null = null;
  let searchTerm = '';
  let filterStatus = 'all';
  let showMobileFilters = false;

  // Form data
  let formData: PromoForm = {
    title: '',
    description: '',
    validUntil: '',
    discount: '',
    promoCode: '',
    maxUses: 0,
    isPublic: true
  };

  let formErrors: { [K in keyof PromoForm]?: string } = {};
  let saving = false;
  let showDeleteConfirm = false;
  let deleteItemId = '';

  // Fixed reactive stats with proper calculations
  $: totalCount = promos.length;
  $: activeCount = promos.filter(promo => {
    const today = getTodayDate();
    return promo.isPublic && promo.validUntil >= today && 
           (promo.maxUses === 0 || promo.currentUses < promo.maxUses);
  }).length;
  $: draftCount = promos.filter(promo => !promo.isPublic).length;
  $: expiredCount = promos.filter(promo => {
    const today = getTodayDate();
    return promo.validUntil < today;
  }).length;

  const promoTemplates = [
    {
      name: 'New Patient Special',
      title: '20% Off First Visit',
      description: 'Welcome new patients with a 20% discount on their first consultation and cleaning.',
      discount: '20%'
    },
    {
      name: 'Cleaning Package',
      title: 'Family Cleaning Package',
      description: 'Book cleanings for the whole family and save! 15% off when booking 3+ family members.',
      discount: '15%'
    },
    {
      name: 'Whitening Special',
      title: 'Professional Teeth Whitening',
      description: 'Get a brighter smile with our professional whitening treatment. Limited time offer.',
      discount: '$100'
    },
    {
      name: 'Checkup Reminder',
      title: '6-Month Checkup Reminder',
      description: 'It\'s time for your regular checkup! Book now and receive 10% off your visit.',
      discount: '10%'
    }
  ];

  onMount(async () => {
    await loadPromotions();
  });

  // Debounced search function
  const debouncedSearch = debounce(() => {
    filterPromotions();
  }, 300);

  $: if (searchTerm !== undefined) {
    debouncedSearch();
  }

  $: if (filterStatus) {
    filterPromotions();
  }

  async function loadPromotions() {
    if (!db) {
      loading = false;
      return;
    }

    try {
      console.log('📊 Loading promotions...');
      const promosRef = collection(db, 'promos');
      const q = query(promosRef, orderBy('createdAt', 'desc'));
      
      const snapshot = await getDocs(q);
      console.log('📊 Raw promotions from Firestore:', snapshot.docs.length);
      
      promos = snapshot.docs.map(doc => {
        const data = doc.data();
        const decryptedPromo = decryptFields({
          id: doc.id,
          title: data.title || '',
          description: data.description || '',
          validUntil: data.validUntil,
          discount: data.discount || '',
          promoCode: data.promoCode || '',
          maxUses: data.maxUses || 0,
          currentUses: data.currentUses || 0,
          isPublic: data.isPublic !== false,
          createdAt: data.createdAt
        }, ['title', 'description', 'promoCode']);
        
        console.log('🔓 Decrypted promotion:', {
          id: decryptedPromo.id,
          title: decryptedPromo.title,
          isPublic: decryptedPromo.isPublic,
          validUntil: decryptedPromo.validUntil
        });
        
        return decryptedPromo;
      });

      console.log('✅ Total promotions loaded:', promos.length);
      console.log('📊 Stats calculation:', {
        total: totalCount,
        active: activeCount,
        draft: draftCount,
        expired: expiredCount
      });
      
      filterPromotions();
    } catch (error) {
      console.error('❌ Error loading promotions:', error);
    } finally {
      loading = false;
    }
  }

  function filterPromotions() {
    let filtered = promos;

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(promo => 
        promo.title.toLowerCase().includes(search) ||
        promo.description.toLowerCase().includes(search) ||
        (promo.promoCode && promo.promoCode.toLowerCase().includes(search))
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      const today = getTodayDate();
      filtered = filtered.filter(promo => {
        const isActive = promo.validUntil >= today;
        switch (filterStatus) {
          case 'active': 
            return isActive && promo.isPublic && (promo.maxUses === 0 || promo.currentUses < promo.maxUses);
          case 'expired': 
            return !isActive;
          case 'draft': 
            return !promo.isPublic;
          case 'limited': 
            return promo.maxUses > 0;
          default: 
            return true;
        }
      });
    }

    filteredPromos = filtered;
    console.log('🔍 Filtered promotions:', {
      searchTerm,
      filterStatus,
      originalCount: promos.length,
      filteredCount: filtered.length
    });
  }

  function resetForm() {
    const nextWeek = new Date();
    nextWeek.setDate(nextWeek.getDate() + 7);
    
    formData = {
      title: '',
      description: '',
      validUntil: nextWeek.toISOString().split('T')[0],
      discount: '',
      promoCode: '',
      maxUses: 0,
      isPublic: true
    };
    formErrors = {};
    editingId = null;
  }

  function validateForm(): boolean {
    formErrors = {};

    if (!formData.title.trim()) {
      formErrors.title = 'Title is required';
    }

    if (!formData.description.trim()) {
      formErrors.description = 'Description is required';
    }

    if (!formData.validUntil) {
      formErrors.validUntil = 'Valid until date is required';
    } else if (new Date(formData.validUntil) < new Date(getTodayDate())) {
      formErrors.validUntil = 'Valid until date must be in the future';
    }

    if (formData.maxUses < 0) {
      formErrors.maxUses = 'Max uses cannot be negative';
    }

    return Object.keys(formErrors).length === 0;
  }

  async function savePromotion() {
    if (!validateForm() || !db) return;

    saving = true;

    try {
      // Sanitize inputs
      const sanitizedData = {
        title: sanitizeInput(formData.title),
        description: sanitizeInput(formData.description),
        validUntil: formData.validUntil,
        discount: sanitizeInput(formData.discount),
        promoCode: sanitizeInput(formData.promoCode.toUpperCase()),
        maxUses: formData.maxUses,
        isPublic: formData.isPublic
      };

      // Encrypt sensitive fields
      const encryptedData = encryptFields(sanitizedData, ['title', 'description', 'promoCode']);

      if (editingId) {
        // Update existing promotion
        const promoRef = doc(db, 'promos', editingId);
        await updateDoc(promoRef, encryptedData);
      } else {
        // Create new promotion
        const promoData = {
          ...encryptedData,
          currentUses: 0,
          createdAt: Timestamp.now()
        };
        await addDoc(collection(db, 'promos'), promoData);
      }

      await loadPromotions();
      showAddForm = false;
      resetForm();
    } catch (error) {
      console.error('Error saving promotion:', error);
    } finally {
      saving = false;
    }
  }

  function editPromotion(promo: Promotion) {
    formData = {
      title: promo.title,
      description: promo.description,
      validUntil: promo.validUntil,
      discount: promo.discount || '',
      promoCode: promo.promoCode || '',
      maxUses: promo.maxUses,
      isPublic: promo.isPublic
    };
    editingId = promo.id;
    showAddForm = true;
    showMobileFilters = false;
  }

  function confirmDelete(id: string) {
    deleteItemId = id;
    showDeleteConfirm = true;
  }

  async function deletePromotion() {
    if (!db || !deleteItemId) return;

    try {
      await deleteDoc(doc(db, 'promos', deleteItemId));
      await loadPromotions();
      showDeleteConfirm = false;
      deleteItemId = '';
    } catch (error) {
      console.error('Error deleting promotion:', error);
    }
  }

  function showAddPromoForm() {
    resetForm();
    showAddForm = true;
    showMobileFilters = false;
  }

  function cancelForm() {
    showAddForm = false;
    resetForm();
  }

  function isPromoActive(validUntil: string): boolean {
    return validUntil >= getTodayDate();
  }

  function getPromoStatus(promo: Promotion): { text: string; color: string; icon: string } {
    if (!promo.isPublic) {
      return { text: 'Draft', color: 'bg-gray-100 text-gray-800 border-gray-200', icon: '📝' };
    }
    if (!isPromoActive(promo.validUntil)) {
      return { text: 'Expired', color: 'bg-red-100 text-red-800 border-red-200', icon: '⏰' };
    }
    if (promo.maxUses > 0 && promo.currentUses >= promo.maxUses) {
      return { text: 'Limit Reached', color: 'bg-yellow-100 text-yellow-800 border-yellow-200', icon: '🚫' };
    }
    return { text: 'Active', color: 'bg-green-100 text-green-800 border-green-200', icon: '✅' };
  }

  function applyTemplate(template: typeof promoTemplates[0]) {
    formData.title = template.title;
    formData.description = template.description;
    formData.discount = template.discount;
    
    // Generate a promo code based on the title
    const words = template.title.split(' ');
    const code = words.map((word: string) => word.charAt(0)).join('').toUpperCase() + Math.floor(Math.random() * 100);
    formData.promoCode = code;
  }

  function generatePromoCode() {
    const words = formData.title.split(' ');
    const code = words.map((word: string) => word.charAt(0)).join('').toUpperCase() + Math.floor(Math.random() * 1000);
    formData.promoCode = code;
  }

  async function togglePromoStatus(promo: Promotion) {
    if (!db) return;

    try {
      const promoRef = doc(db, 'promos', promo.id);
      await updateDoc(promoRef, { isPublic: !promo.isPublic });
      await loadPromotions();
    } catch (error) {
      console.error('Error updating promotion status:', error);
    }
  }

  function toggleMobileFilters() {
    showMobileFilters = !showMobileFilters;
  }

  function clearFilters() {
    filterStatus = 'all';
    searchTerm = '';
    showMobileFilters = false;
  }

  // Close mobile filters when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.closest('.mobile-filters-container')) {
      showMobileFilters = false;
    }
  }

  onMount(() => {
    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  });
</script>

<svelte:head>
  <title>Promotions - Aurora Dentica Admin</title>
</svelte:head>

<div class="min-h-screen bg-gray-50 space-y-6">

  <!-- Enhanced Header Section with Fixed Stats -->
  <div class="bg-gradient-to-br from-orange-600 via-red-600 to-pink-600 rounded-2xl shadow-2xl text-white overflow-hidden relative">
    <!-- Animated Background Pattern -->
    <div class="absolute inset-0 opacity-20">
      <div class="absolute top-4 right-4 w-32 h-32 bg-yellow-400 rounded-full blur-3xl animate-pulse"></div>
      <div class="absolute bottom-6 left-6 w-24 h-24 bg-orange-300 rounded-full blur-2xl animate-pulse" style="animation-delay: 1s;"></div>
      <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white rounded-full blur-3xl opacity-10"></div>
    </div>
    
    <div class="relative p-6 md:p-8 lg:p-10">
      <!-- Main Header -->
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
        <div class="flex-1 mb-6 lg:mb-0">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-16 h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30 shadow-lg">
              <span class="text-3xl animate-bounce">🎉</span>
            </div>
            <div>
              <h1 class="text-3xl md:text-4xl lg:text-5xl font-bold text-white drop-shadow-lg mb-2">
                Promotions
              </h1>
              <p class="text-orange-100 text-lg font-medium">Manage special offers and marketing campaigns</p>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <div class="flex-shrink-0">
          <button
            on:click={showAddPromoForm}
            class="group bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 border border-white/30 hover:border-white/50 flex items-center gap-3 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 w-full lg:w-auto justify-center"
          >
            <span class="text-2xl group-hover:scale-110 transition-transform duration-300">🎉</span>
            <span>Create Promotion</span>
          </button>
        </div>
      </div>

      <!-- Enhanced Stats Cards with Fixed Calculations -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <div class="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300 group">
          <div class="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2 group-hover:scale-105 transition-transform duration-300">
            {totalCount}
          </div>
          <div class="text-orange-100 font-semibold text-sm uppercase tracking-wide">Total</div>
          <div class="text-yellow-200 text-2xl mt-2">📊</div>
        </div>
        
        <div class="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300 group">
          <div class="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2 group-hover:scale-105 transition-transform duration-300">
            {activeCount}
          </div>
          <div class="text-green-200 font-semibold text-sm uppercase tracking-wide">Active</div>
          <div class="text-green-300 text-2xl mt-2">✅</div>
        </div>
        
        <div class="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300 group">
          <div class="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2 group-hover:scale-105 transition-transform duration-300">
            {draftCount}
          </div>
          <div class="text-yellow-200 font-semibold text-sm uppercase tracking-wide">Drafts</div>
          <div class="text-yellow-300 text-2xl mt-2">📝</div>
        </div>
        
        <div class="bg-white/20 backdrop-blur-lg rounded-2xl p-6 text-center border border-white/30 shadow-lg hover:bg-white/25 transition-all duration-300 group">
          <div class="text-3xl md:text-4xl font-bold text-white drop-shadow-lg mb-2 group-hover:scale-105 transition-transform duration-300">
            {expiredCount}
          </div>
          <div class="text-red-200 font-semibold text-sm uppercase tracking-wide">Expired</div>
          <div class="text-red-300 text-2xl mt-2">⏰</div>
        </div>
      </div>

      <!-- Performance Summary -->
      <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div class="text-sm text-orange-200 mb-1">Total Usage</div>
          <div class="text-2xl font-bold text-white">
            {promos.reduce((sum, promo) => sum + promo.currentUses, 0)}
          </div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div class="text-sm text-orange-200 mb-1">Avg. Per Promo</div>
          <div class="text-2xl font-bold text-white">
            {promos.length > 0 ? Math.round(promos.reduce((sum, promo) => sum + promo.currentUses, 0) / promos.length) : 0}
          </div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
          <div class="text-sm text-orange-200 mb-1">Success Rate</div>
          <div class="text-2xl font-bold text-white">
            {activeCount > 0 ? Math.round((activeCount / totalCount) * 100) : 0}%
          </div>
        </div>
      </div>
    </div>
  </div>

  <!-- Enhanced Filters Section -->
  <div class="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden">
    
    <!-- Desktop Filters -->
    <div class="hidden lg:block p-8">
      <div class="space-y-8">
        <!-- Quick Filter Buttons -->
        <div class="flex flex-wrap gap-3">
          <button 
            on:click={() => filterStatus = 'all'}
            class="{filterStatus === 'all' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'} px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 transform"
          >
            <span class="text-lg">📊</span>
            <span>All ({totalCount})</span>
          </button>
          <button 
            on:click={() => filterStatus = 'active'}
            class="{filterStatus === 'active' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'} px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 transform"
          >
            <span class="text-lg">✅</span>
            <span>Active ({activeCount})</span>
          </button>
          <button 
            on:click={() => filterStatus = 'draft'}
            class="{filterStatus === 'draft' ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'} px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 transform"
          >
            <span class="text-lg">📝</span>
            <span>Drafts ({draftCount})</span>
          </button>
          <button 
            on:click={() => filterStatus = 'expired'}
            class="{filterStatus === 'expired' ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg scale-105' : 'bg-gray-100 text-gray-700 hover:bg-gray-200 hover:scale-102'} px-6 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center gap-3 transform"
          >
            <span class="text-lg">⏰</span>
            <span>Expired ({expiredCount})</span>
          </button>
        </div>
        
        <!-- Search Filter -->
        <div>
          <label for="search" class="block text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <span class="text-xl">🔍</span>
            <span>Search Promotions</span>
          </label>
          <div class="relative">
            <input
              id="search"
              type="text"
              placeholder="Search by title, description, or promo code..."
              bind:value={searchTerm}
              class="w-full px-6 py-4 pl-14 text-lg border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 shadow-sm hover:shadow-md"
            />
            <div class="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
              <span class="text-gray-400 text-xl">🔍</span>
            </div>
            {#if searchTerm}
              <button
                on:click={() => searchTerm = ''}
                class="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 transition-colors"
              >
                <span class="text-xl">✖️</span>
              </button>
            {/if}
          </div>
        </div>

        <!-- Filter Summary -->
        <div class="flex items-center justify-between pt-6 border-t border-gray-200">
          <p class="text-lg text-gray-700 flex items-center gap-3 font-medium">
            <span class="text-2xl">📋</span>
            <span>Showing <span class="font-bold text-blue-600">{filteredPromos.length}</span> of <span class="font-bold text-gray-900">{totalCount}</span> promotions</span>
          </p>
          {#if searchTerm || filterStatus !== 'all'}
            <button
              on:click={clearFilters}
              class="bg-red-100 hover:bg-red-200 text-red-700 hover:text-red-800 px-4 py-2 rounded-lg font-semibold flex items-center gap-2 transition-all duration-300 hover:scale-105"
            >
              <span class="text-lg">✖️</span>
              <span>Clear Filters</span>
            </button>
          {/if}
        </div>
      </div>
    </div>

    <!-- Mobile Filters -->
    <div class="lg:hidden mobile-filters-container">
      <!-- Mobile Filter Toggle -->
      <div class="p-6 border-b border-gray-200 bg-gradient-to-r from-gray-50 to-blue-50">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <span class="text-2xl">📋</span>
            <div>
              <p class="font-bold text-gray-900">Promotions</p>
              <p class="text-sm text-gray-600">Showing <span class="font-semibold">{filteredPromos.length}</span> of <span class="font-semibold">{totalCount}</span></p>
            </div>
          </div>
          <button
            on:click={toggleMobileFilters}
            class="bg-gradient-to-r from-blue-600 to-blue-700 text-white px-4 py-3 rounded-xl font-semibold flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
          >
            <span class="text-lg">🔍</span>
            <span>Filters</span>
          </button>
        </div>
      </div>

      <!-- Mobile Filter Panel -->
      {#if showMobileFilters}
        <div class="p-6 bg-gradient-to-br from-gray-50 to-blue-50 border-b border-gray-200 space-y-6 animate-fade-in">
          <!-- Quick Status Filters -->
          <div>
            <label class="block text-lg font-bold text-gray-900 mb-3">Status Filter</label>
            <div class="grid grid-cols-2 gap-3">
              <button 
                on:click={() => { filterStatus = 'all'; }}
                class="{filterStatus === 'all' ? 'bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-300'} px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>📊</span>
                <span>All ({totalCount})</span>
              </button>
              <button 
                on:click={() => { filterStatus = 'active'; }}
                class="{filterStatus === 'active' ? 'bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-green-300'} px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>✅</span>
                <span>Active ({activeCount})</span>
              </button>
              <button 
                on:click={() => { filterStatus = 'draft'; }}
                class="{filterStatus === 'draft' ? 'bg-gradient-to-r from-yellow-600 to-yellow-700 text-white shadow-lg' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-yellow-300'} px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>📝</span>
                <span>Drafts ({draftCount})</span>
              </button>
              <button 
                on:click={() => { filterStatus = 'expired'; }}
                class="{filterStatus === 'expired' ? 'bg-gradient-to-r from-gray-600 to-gray-700 text-white shadow-lg' : 'bg-white text-gray-700 border-2 border-gray-200 hover:border-gray-300'} px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center gap-2"
              >
                <span>⏰</span>
                <span>Expired ({expiredCount})</span>
              </button>
            </div>
          </div>

          <!-- Search -->
          <div>
            <label for="mobile-search" class="block text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
              <span class="text-xl">🔍</span>
              <span>Search</span>
            </label>
            <div class="relative">
              <input
                id="mobile-search"
                type="text"
                placeholder="Title, description, code..."
                bind:value={searchTerm}
                class="w-full px-4 py-4 pl-12 border-2 border-gray-300 rounded-xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
              />
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span class="text-gray-400 text-lg">🔍</span>
              </div>
            </div>
          </div>

          <!-- Clear Filters -->
          {#if searchTerm || filterStatus !== 'all'}
            <button
              on:click={clearFilters}
              class="w-full bg-gradient-to-r from-red-500 to-red-600 text-white px-6 py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105"
            >
              <span class="text-xl">✖️</span>
              <span>Clear All Filters</span>
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Enhanced Add/Edit Form Modal -->
  {#if showAddForm}
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[95vh] overflow-y-auto">
        
        <!-- Modal Header -->
        <div class="sticky top-0 bg-gradient-to-r from-orange-500 to-red-500 text-white px-8 py-6 rounded-t-3xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-4">
              <div class="w-14 h-14 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
                <span class="text-white text-2xl">{editingId ? '✏️' : '🎉'}</span>
              </div>
              <div>
                <h2 class="text-2xl font-bold text-white drop-shadow-lg">
                  {editingId ? 'Edit Promotion' : 'Create New Promotion'}
                </h2>
                <p class="text-orange-100 text-lg">
                  {editingId ? 'Update promotion details and settings' : 'Create a new marketing campaign to attract customers'}
                </p>
              </div>
            </div>
            <button
              on:click={cancelForm}
              class="p-3 hover:bg-white/20 rounded-xl transition-all duration-300 group" 
              disabled={saving}
              aria-label="Close form"
            >
              <svg class="w-7 h-7 text-white group-hover:scale-110 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-8">
          <!-- Templates Section (only for new promotions) -->
          {#if !editingId}
            <div class="mb-10">
              <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span class="text-2xl">⚡</span>
                <span>Quick Start Templates</span>
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
                {#each promoTemplates as template}
                  <button
                    type="button"
                    on:click={() => applyTemplate(template)}
                    class="text-left p-6 border-3 border-gray-200 rounded-2xl hover:border-orange-400 hover:bg-orange-50 transition-all duration-300 group transform hover:scale-105 hover:shadow-lg"
                  >
                    <div class="flex items-start justify-between mb-3">
                      <div class="font-bold text-lg text-gray-900 group-hover:text-orange-700 transition-colors">{template.name}</div>
                      <div class="text-orange-600 font-bold bg-orange-100 px-3 py-1 rounded-lg text-sm">{template.discount}</div>
                    </div>
                    <div class="text-gray-800 font-semibold mb-2">{template.title}</div>
                    <div class="text-sm text-gray-600 line-clamp-2">{template.description}</div>
                    <div class="mt-4 text-orange-600 font-semibold text-sm flex items-center gap-2">
                      <span>👆</span>
                      <span>Click to use this template</span>
                    </div>
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <form on:submit|preventDefault={savePromotion} class="space-y-10">
            
            <!-- Basic Information Section -->
            <div class="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-3xl p-8 border border-blue-200">
              <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span class="text-2xl">📝</span>
                <span>Basic Information</span>
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Title -->
                <div class="md:col-span-2">
                  <label for="promo-title" class="block text-lg font-bold text-gray-700 mb-3">
                    Promotion Title *
                  </label>
                  <input
                    id="promo-title"
                    type="text"
                    bind:value={formData.title}
                    class="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 {formErrors.title ? 'border-red-500 bg-red-50' : ''}"
                    placeholder="e.g., 20% Off First Visit"
                    required
                  />
                  {#if formErrors.title}
                    <p class="text-red-600 text-sm mt-2 flex items-center gap-2 font-semibold">
                      <span>⚠️</span>
                      <span>{formErrors.title}</span>
                    </p>
                  {/if}
                </div>

                <!-- Discount -->
                <div>
                  <label for="discount" class="block text-lg font-bold text-gray-700 mb-3">
                    Discount Value
                  </label>
                  <input
                    id="discount"
                    type="text"
                    bind:value={formData.discount}
                    class="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300"
                    placeholder="e.g., 20%, $50"
                  />
                </div>
              </div>

              <!-- Description -->
              <div class="mt-8">
                <label for="promo-description" class="block text-lg font-bold text-gray-700 mb-3">
                  Description *
                </label>
                <textarea
                  id="promo-description"
                  bind:value={formData.description}
                  rows="5"
                  class="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 resize-none transition-all duration-300 {formErrors.description ? 'border-red-500 bg-red-50' : ''}"
                  placeholder="Describe the promotion details, terms, and how customers can claim it..."
                  required
                ></textarea>
                {#if formErrors.description}
                  <p class="text-red-600 text-sm mt-2 flex items-center gap-2 font-semibold">
                    <span>⚠️</span>
                    <span>{formErrors.description}</span>
                  </p>
                {/if}
              </div>
            </div>

            <!-- Configuration Section -->
            <div class="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-8 border border-green-200">
              <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                <span class="text-2xl">⚙️</span>
                <span>Promotion Settings</span>
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-8">
                <!-- Promo Code -->
                <div>
                  <label for="promo-code" class="block text-lg font-bold text-gray-700 mb-3">
                    Promo Code
                  </label>
                  <div class="flex gap-3">
                    <input
                      id="promo-code"
                      type="text"
                      bind:value={formData.promoCode}
                      class="flex-1 px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 uppercase transition-all duration-300 font-mono"
                      placeholder="SAVE20"
                    />
                    <button
                      type="button"
                      on:click={generatePromoCode}
                      class="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-4 rounded-2xl font-bold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                      title="Generate code"
                      aria-label="Generate promo code"
                    >
                      🎲
                    </button>
                  </div>
                </div>

                <!-- Max Uses -->
                <div>
                  <label for="max-uses" class="block text-lg font-bold text-gray-700 mb-3">
                    Max Uses
                  </label>
                  <input
                    id="max-uses"
                    type="number"
                    min="0"
                    bind:value={formData.maxUses}
                    class="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 {formErrors.maxUses ? 'border-red-500 bg-red-50' : ''}"
                    placeholder="0 = unlimited"
                  />
                  {#if formErrors.maxUses}
                    <p class="text-red-600 text-sm mt-2 flex items-center gap-2 font-semibold">
                      <span>⚠️</span>
                      <span>{formErrors.maxUses}</span>
                    </p>
                  {/if}
                  <p class="text-sm text-gray-600 mt-2">Set to 0 for unlimited uses</p>
                </div>

                <!-- Valid Until -->
                <div>
                  <label for="valid-until" class="block text-lg font-bold text-gray-700 mb-3">
                    Valid Until *
                  </label>
                  <input
                    id="valid-until"
                    type="date"
                    bind:value={formData.validUntil}
                    class="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-2xl focus:ring-4 focus:ring-blue-500/20 focus:border-blue-500 transition-all duration-300 {formErrors.validUntil ? 'border-red-500 bg-red-50' : ''}"
                    required
                  />
                  {#if formErrors.validUntil}
                    <p class="text-red-600 text-sm mt-2 flex items-center gap-2 font-semibold">
                      <span>⚠️</span>
                      <span>{formErrors.validUntil}</span>
                    </p>
                  {/if}
                </div>
              </div>

              <!-- Visibility Toggle -->
              <div class="mt-8 p-6 bg-white rounded-2xl border-2 border-gray-200 shadow-lg">
                <div class="flex items-center space-x-4">
                  <div class="relative">
                    <input
                      id="is-public"
                      type="checkbox"
                      bind:checked={formData.isPublic}
                      class="sr-only"
                    />
                    <button
                      type="button"
                      on:click={() => formData.isPublic = !formData.isPublic}
                      class="relative inline-flex h-8 w-14 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 {formData.isPublic ? 'bg-green-600' : 'bg-gray-400'}"
                    >
                      <span class="sr-only">Toggle public visibility</span>
                      <span class="{formData.isPublic ? 'translate-x-7' : 'translate-x-1'} inline-block h-6 w-6 transform rounded-full bg-white transition-transform duration-300 shadow-lg"></span>
                    </button>
                  </div>
                  <label for="is-public" class="text-lg font-bold text-gray-700 flex items-center gap-3">
                    <span class="text-2xl">{formData.isPublic ? '👁️' : '👁️‍🗨️'}</span>
                    <span>Make this promotion public (visible on website)</span>
                  </label>
                </div>
                <p class="text-sm text-gray-600 mt-3 ml-16">
                  {formData.isPublic ? 'This promotion will be displayed on your public website' : 'This promotion will remain hidden as a draft'}
                </p>
              </div>
            </div>

            <!-- Live Preview -->
            {#if formData.title || formData.description}
              <div class="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-8 border-3 border-dashed border-purple-300">
                <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span class="text-2xl">👁️</span>
                  <span>Live Preview</span>
                </h3>
                <div class="bg-white rounded-2xl p-8 border-2 border-purple-200 shadow-xl">
                  {#if formData.title}
                    <div class="flex items-start justify-between mb-4">
                      <h4 class="text-2xl font-bold text-gray-900 flex-1">{formData.title}</h4>
                      {#if formData.discount}
                        <span class="bg-gradient-to-r from-orange-500 to-red-500 text-white border-2 border-orange-300 px-4 py-2 rounded-full text-lg font-bold shadow-lg ml-4">
                          {formData.discount} OFF
                        </span>
                      {/if}
                    </div>
                  {/if}
                  {#if formData.description}
                    <p class="text-gray-700 mb-6 leading-relaxed text-lg">{formData.description}</p>
                  {/if}
                  <div class="flex items-center justify-between text-lg border-t-2 border-gray-200 pt-6">
                    {#if formData.promoCode}
                      <span class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-xl font-mono font-bold border-2 border-blue-300 shadow-lg">
                        Code: {formData.promoCode}
                      </span>
                    {/if}
                    {#if formData.validUntil}
                      <span class="text-gray-600 flex items-center gap-2 font-semibold">
                        <span class="text-xl">📅</span>
                        <span>Valid until {formatDisplayDate(formData.validUntil)}</span>
                      </span>
                    {/if}
                  </div>
                  {#if formData.maxUses > 0}
                    <div class="mt-4 text-sm text-gray-600 bg-gray-100 rounded-xl p-4 border border-gray-200">
                      <span class="font-semibold">⚠️ Limited to {formData.maxUses} uses</span>
                    </div>
                  {/if}
                </div>
              </div>
            {/if}

          </form>
        </div>

        <!-- Modal Footer -->
        <div class="sticky bottom-0 bg-gradient-to-r from-gray-100 to-gray-200 px-8 py-6 border-t-2 border-gray-300 rounded-b-3xl">
          <div class="flex flex-col sm:flex-row justify-end gap-4">
            <button
              type="button"
              on:click={cancelForm}
              class="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 order-2 sm:order-1 shadow-lg hover:shadow-xl transform hover:scale-105"
              disabled={saving}
            >
              <span class="text-xl mr-2">✖️</span>
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              on:click={savePromotion}
              disabled={saving || !formData.title || !formData.description || !formData.validUntil}
              class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-8 py-4 rounded-2xl font-bold text-lg transition-all duration-300 order-1 sm:order-2 flex items-center gap-3 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:transform-none disabled:shadow-lg"
            >
              {#if saving}
                <div class="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              {:else}
                <span class="text-xl">{editingId ? '💾' : '🎉'}</span>
                <span>{editingId ? 'Update' : 'Create'} Promotion</span>
              {/if}
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Enhanced Delete Confirmation Modal -->
  {#if showDeleteConfirm}
    <div class="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50 animate-fade-in">
      <div class="bg-white rounded-3xl shadow-2xl max-w-lg w-full">
        <div class="p-8">
          <div class="flex items-center gap-4 mb-6">
            <div class="w-16 h-16 bg-red-500 rounded-2xl flex items-center justify-center shadow-lg">
              <span class="text-white text-2xl">🗑️</span>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">Delete Promotion</h2>
              <p class="text-gray-600 text-lg">This action cannot be undone</p>
            </div>
          </div>
          <div class="text-center mb-8">
            <div class="text-6xl mb-4 animate-bounce">⚠️</div>
            <p class="text-gray-700 text-lg leading-relaxed">
              Are you sure you want to delete this promotion? This action is permanent and cannot be reversed.
            </p>
          </div>
          <div class="flex flex-col sm:flex-row justify-end gap-4">
            <button
              on:click={() => { showDeleteConfirm = false; deleteItemId = ''; }}
              class="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 order-2 sm:order-1 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span class="text-xl mr-2">✖️</span>
              <span>Cancel</span>
            </button>
            <button
              on:click={deletePromotion}
              class="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white px-6 py-4 rounded-2xl font-bold text-lg transition-all duration-300 order-1 sm:order-2 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              <span class="text-xl mr-2">🗑️</span>
              <span>Delete Promotion</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Enhanced Promotions List -->
  {#if loading}
    <div class="flex justify-center items-center py-20">
      <div class="text-center">
        <div class="relative mb-8">
          <div class="w-20 h-20 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-3xl animate-bounce">🎉</span>
          </div>
        </div>
        <h3 class="text-2xl font-bold text-gray-900 mb-4">Loading Promotions</h3>
        <p class="text-gray-600 text-lg">Please wait while we fetch your promotion data...</p>
      </div>
    </div>
  {:else if filteredPromos.length > 0}
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
      {#each filteredPromos as promo}
        {@const status = getPromoStatus(promo)}
        <div class="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100 hover:shadow-2xl transition-all duration-500 transform hover:-translate-y-2 group relative overflow-hidden">
          
          <!-- Card Background Pattern -->
          <div class="absolute inset-0 opacity-5">
            <div class="absolute top-4 right-4 w-16 h-16 bg-orange-400 rounded-full blur-xl"></div>
            <div class="absolute bottom-4 left-4 w-12 h-12 bg-blue-400 rounded-full blur-lg"></div>
          </div>
          
          <!-- Header -->
          <div class="relative flex items-start justify-between mb-6">
            <div class="flex-1 min-w-0">
              <h3 class="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors line-clamp-2 leading-tight">{promo.title}</h3>
              {#if promo.discount}
                <div class="inline-flex items-center bg-gradient-to-r from-orange-500 to-red-500 text-white border-2 border-orange-300 px-4 py-2 rounded-full text-sm font-bold shadow-lg">
                  <span class="mr-2 text-lg">🏷️</span>
                  <span>{promo.discount} OFF</span>
                </div>
              {/if}
            </div>
            <div class="flex items-center gap-2 ml-4">
              <span class="inline-flex items-center px-3 py-2 rounded-full text-xs font-bold border-2 {status.color} shadow-lg">
                <span class="mr-1 text-sm">{status.icon}</span>
                <span>{status.text}</span>
              </span>
            </div>
          </div>

          <!-- Description -->
          <p class="text-gray-600 mb-6 line-clamp-3 text-lg leading-relaxed">{promo.description}</p>

          <!-- Details Grid -->
          <div class="grid grid-cols-2 gap-4 mb-6">
            <div class="bg-gradient-to-br from-gray-50 to-blue-50 rounded-2xl p-4 border border-gray-200">
              <p class="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Valid Until</p>
              <p class="font-bold text-gray-900 flex items-center gap-2">
                <span class="text-lg">📅</span>
                <span>{formatDisplayDate(promo.validUntil)}</span>
              </p>
            </div>
            <div class="bg-gradient-to-br from-blue-50 to-purple-50 rounded-2xl p-4 border border-blue-200">
              <p class="text-xs text-gray-500 uppercase tracking-wide font-bold mb-1">Usage</p>
              <p class="font-bold text-blue-700 flex items-center gap-2">
                <span class="text-lg">📊</span>
                <span>
                  {#if promo.maxUses > 0}
                    {promo.currentUses} / {promo.maxUses}
                  {:else}
                    {promo.currentUses} (unlimited)
                  {/if}
                </span>
              </p>
            </div>
          </div>

          <!-- Promo Code -->
          {#if promo.promoCode}
            <div class="mb-6">
              <p class="text-xs text-gray-500 uppercase tracking-wide font-bold mb-3">Promo Code</p>
              <div class="bg-gradient-to-r from-blue-500 to-purple-500 text-white px-4 py-3 rounded-2xl font-mono text-lg font-bold text-center border-3 border-blue-300 shadow-lg">
                {promo.promoCode}
              </div>
            </div>
          {/if}

          <!-- Actions -->
          <div class="flex items-center justify-between pt-6 border-t-2 border-gray-200">
            <div class="flex items-center gap-3">
              <button
                on:click={() => editPromotion(promo)}
                class="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Edit promotion"
              >
                <span class="text-lg">✏️</span>
                <span>Edit</span>
              </button>
              <button
                on:click={() => confirmDelete(promo.id)}
                class="bg-gradient-to-r from-red-500 to-red-600 hover:from-red-600 hover:to-red-700 text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                title="Delete promotion"
              >
                <span class="text-lg">🗑️</span>
                <span>Delete</span>
              </button>
            </div>
            
            <div class="flex items-center gap-2">
              <button
                on:click={() => togglePromoStatus(promo)}
                class="{promo.isPublic ? 'bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600' : 'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700'} text-white px-4 py-3 rounded-xl font-bold text-sm transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-xl transform hover:scale-105"
                title="{promo.isPublic ? 'Make private' : 'Make public'}"
              >
                <span class="text-lg">{promo.isPublic ? '👁️' : '👁️‍🗨️'}</span>
                <span>{promo.isPublic ? 'Public' : 'Draft'}</span>
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <!-- Enhanced Empty State -->
    <div class="bg-white rounded-3xl p-12 sm:p-20 text-center shadow-xl border-2 border-gray-200">
      <div class="text-gray-400 text-8xl mb-8 animate-pulse">🎉</div>
      <h3 class="text-3xl font-bold text-gray-900 mb-6">
        {searchTerm || filterStatus !== 'all' ? 'No promotions found' : 'No promotions created'}
      </h3>
      <p class="text-gray-600 mb-10 max-w-2xl mx-auto text-xl leading-relaxed">
        {searchTerm || filterStatus !== 'all' 
          ? 'Try adjusting your filters or search terms to find what you\'re looking for.' 
          : 'Create your first promotion to attract new patients and reward existing ones with special offers.'}
      </p>
      <div class="flex flex-col sm:flex-row gap-6 justify-center">
        <button
          on:click={showAddPromoForm}
          class="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-3"
        >
          <span class="text-2xl">🎉</span>
          <span>Create First Promotion</span>
        </button>
        {#if searchTerm || filterStatus !== 'all'}
          <button
            on:click={clearFilters}
            class="bg-gradient-to-r from-gray-500 to-gray-600 hover:from-gray-600 hover:to-gray-700 text-white px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 shadow-xl hover:shadow-2xl transform hover:-translate-y-1 flex items-center gap-3"
          >
            <span class="text-2xl">✖️</span>
            <span>Clear All Filters</span>
          </button>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Enhanced Information Panel -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    
    <!-- Marketing Tips -->
    <div class="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
      <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <span class="text-2xl">💡</span>
        <span>Promotion Best Practices</span>
      </h3>
      <ul class="space-y-4 text-lg text-gray-700">
        <li class="flex items-start gap-4 p-4 bg-green-50 rounded-2xl border border-green-200">
          <span class="text-green-600 font-bold text-2xl flex-shrink-0">✓</span>
          <span>Create urgency with limited-time offers and countdown dates</span>
        </li>
        <li class="flex items-start gap-4 p-4 bg-blue-50 rounded-2xl border border-blue-200">
          <span class="text-blue-600 font-bold text-2xl flex-shrink-0">✓</span>
          <span>Use clear, benefit-focused headlines that highlight the value</span>
        </li>
        <li class="flex items-start gap-4 p-4 bg-purple-50 rounded-2xl border border-purple-200">
          <span class="text-purple-600 font-bold text-2xl flex-shrink-0">✓</span>
          <span>Include specific terms and conditions to avoid confusion</span>
        </li>
        <li class="flex items-start gap-4 p-4 bg-orange-50 rounded-2xl border border-orange-200">
          <span class="text-orange-600 font-bold text-2xl flex-shrink-0">✓</span>
          <span>Track usage with promo codes to measure campaign success</span>
        </li>
        <li class="flex items-start gap-4 p-4 bg-pink-50 rounded-2xl border border-pink-200">
          <span class="text-pink-600 font-bold text-2xl flex-shrink-0">✓</span>
          <span>Test different discount amounts to find what converts best</span>
        </li>
      </ul>
    </div>

    <!-- Quick Stats -->
    <div class="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
      <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
        <span class="text-2xl">📊</span>
        <span>Promotion Performance</span>
      </h3>
      <div class="space-y-6">
        <div class="flex items-center justify-between p-6 bg-gradient-to-r from-green-50 to-emerald-50 rounded-2xl border-2 border-green-200 shadow-lg">
          <div>
            <p class="text-lg font-bold text-green-700">Active Promotions</p>
            <p class="text-4xl font-bold text-green-900">{activeCount}</p>
          </div>
          <div class="text-green-600 text-5xl">🎯</div>
        </div>

        <div class="flex items-center justify-between p-6 bg-gradient-to-r from-blue-50 to-cyan-50 rounded-2xl border-2 border-blue-200 shadow-lg">
          <div>
            <p class="text-lg font-bold text-blue-700">Total Reach</p>
            <p class="text-4xl font-bold text-blue-900">
              {promos.reduce((sum, promo) => sum + promo.currentUses, 0)} uses
            </p>
          </div>
          <div class="text-blue-600 text-5xl">📈</div>
        </div>

        <div class="flex items-center justify-between p-6 bg-gradient-to-r from-yellow-50 to-amber-50 rounded-2xl border-2 border-yellow-200 shadow-lg">
          <div>
            <p class="text-lg font-bold text-yellow-700">Draft Promotions</p>
            <p class="text-4xl font-bold text-yellow-900">{draftCount}</p>
          </div>
          <div class="text-yellow-600 text-5xl">📝</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Promotion Guidelines -->
  <div class="bg-white rounded-3xl p-8 shadow-xl border-2 border-gray-100">
    <h3 class="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
      <span class="text-2xl">ℹ️</span>
      <span>How Promotions Work</span>
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-8 text-lg text-gray-700">
      <div>
        <h4 class="font-bold text-gray-800 mb-4 flex items-center gap-3 text-xl">
          <span class="text-2xl">👁️</span>
          <span>Visibility Settings</span>
        </h4>
        <ul class="space-y-3">
          <li class="flex items-start gap-3 p-3 bg-blue-50 rounded-xl border border-blue-200">
            <span class="text-blue-600 font-bold text-lg">•</span>
            <span><strong>Public</strong> promotions appear on your website automatically</span>
          </li>
          <li class="flex items-start gap-3 p-3 bg-yellow-50 rounded-xl border border-yellow-200">
            <span class="text-yellow-600 font-bold text-lg">•</span>
            <span><strong>Draft</strong> promotions are hidden until you make them public</span>
          </li>
          <li class="flex items-start gap-3 p-3 bg-gray-50 rounded-xl border border-gray-200">
            <span class="text-gray-600 font-bold text-lg">•</span>
            <span>Expired promotions are automatically hidden from public view</span>
          </li>
        </ul>
      </div>
      <div>
        <h4 class="font-bold text-gray-800 mb-4 flex items-center gap-3 text-xl">
          <span class="text-2xl">📊</span>
          <span>Usage Tracking</span>
        </h4>
        <ul class="space-y-3">
          <li class="flex items-start gap-3 p-3 bg-purple-50 rounded-xl border border-purple-200">
            <span class="text-purple-600 font-bold text-lg">•</span>
            <span>Set max uses to limit promotion availability</span>
          </li>
          <li class="flex items-start gap-3 p-3 bg-green-50 rounded-xl border border-green-200">
            <span class="text-green-600 font-bold text-lg">•</span>
            <span>Track redemptions with unique promo codes</span>
          </li>
          <li class="flex items-start gap-3 p-3 bg-orange-50 rounded-xl border border-orange-200">
            <span class="text-orange-600 font-bold text-lg">•</span>
            <span>Monitor performance to optimize future campaigns</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Mobile FAB -->
  <div class="lg:hidden fixed bottom-8 right-8 z-40">
    <button
      on:click={showAddPromoForm}
      class="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white w-16 h-16 rounded-full shadow-2xl hover:shadow-3xl transition-all duration-300 flex items-center justify-center transform hover:scale-110"
    >
      <span class="text-3xl animate-bounce">🎉</span>
    </button>
  </div>
</div>

<style>
  /* Enhanced animations */
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes slide-up {
    from {
      opacity: 0;
      transform: translateY(40px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes bounce-subtle {
    0%, 20%, 53%, 80%, 100% {
      transform: translate3d(0, 0, 0);
    }
    40%, 43% {
      transform: translate3d(0, -8px, 0);
    }
    70% {
      transform: translate3d(0, -4px, 0);
    }
    90% {
      transform: translate3d(0, -2px, 0);
    }
  }

  /* Apply animations */
  .animate-fade-in {
    animation: fade-in 0.6s ease-out;
  }

  .animate-slide-up {
    animation: slide-up 0.4s ease-out;
  }

  .animate-bounce-subtle {
    animation: bounce-subtle 2s ease-in-out infinite;
  }

  /* Card hover effects */
  .card-hover {
    transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .card-hover:hover {
    transform: translateY(-8px);
    box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
  }

  /* Loading spinner */
  .loading-spinner {
    animation: spin 1s linear infinite;
  }

  @keyframes spin {
    from {
      transform: rotate(0deg);
    }
    to {
      transform: rotate(360deg);
    }
  }

  /* Form enhancements */
  input:focus, select:focus, textarea:focus {
    outline: none;
    box-shadow: 0 0 0 4px rgba(59, 130, 246, 0.15);
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    .mobile-card {
      margin: 0.5rem;
    }
    
    .mobile-form {
      padding: 1rem;
    }

    .text-responsive {
      font-size: clamp(1rem, 4vw, 1.5rem);
    }
  }

  /* Enhanced focus states */
  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible {
    outline: 3px solid #3b82f6;
    outline-offset: 2px;
    border-radius: 1rem;
  }

  /* Line clamp utilities */
  .line-clamp-2 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 2;
  }

  .line-clamp-3 {
    overflow: hidden;
    display: -webkit-box;
    -webkit-box-orient: vertical;
    -webkit-line-clamp: 3;
  }

  /* Gradient text effect */
  .text-gradient {
    background: linear-gradient(135deg, #f97316, #ef4444);
    -webkit-background-clip: text;
    -webkit-text-fill-color: transparent;
    background-clip: text;
  }

  /* Enhanced shadows */
  .shadow-3xl {
    box-shadow: 0 35px 60px -12px rgba(0, 0, 0, 0.3);
  }

  /* Reduced motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }

  /* High contrast support */
  @media (prefers-contrast: high) {
    .card {
      border: 3px solid #000;
    }
    
    button {
      border: 2px solid currentColor;
    }
  }

  /* Print styles */
  @media print {
    .no-print {
      display: none !important;
    }
    
    .card {
      border: 2px solid #000;
      break-inside: avoid;
    }
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
    background: linear-gradient(135deg, #f97316, #ef4444);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: linear-gradient(135deg, #ea580c, #dc2626);
  }

  /* Enhanced button ripple effect */
  .btn-ripple {
    position: relative;
    overflow: hidden;
  }

  .btn-ripple::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    border-radius: 50%;
    background: rgba(255, 255, 255, 0.3);
    transform: translate(-50%, -50%);
    transition: width 0.6s, height 0.6s;
  }

  .btn-ripple:active::before {
    width: 300px;
    height: 300px;
  }
</style>