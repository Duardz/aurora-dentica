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
      const promosRef = collection(db, 'promos');
      const q = query(promosRef, orderBy('createdAt', 'desc'));
      
      const snapshot = await getDocs(q);
      promos = snapshot.docs.map(doc => {
        const data = doc.data();
        return decryptFields({
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
      });

      filterPromotions();
    } catch (error) {
      console.error('Error loading promotions:', error);
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
          case 'active': return isActive && promo.isPublic;
          case 'expired': return !isActive;
          case 'draft': return !promo.isPublic;
          case 'limited': return promo.maxUses > 0;
          default: return true;
        }
      });
    }

    filteredPromos = filtered;
  }

  function resetForm() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 7); // Default to 1 week from now
    
    formData = {
      title: '',
      description: '',
      validUntil: tomorrow.toISOString().split('T')[0],
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

  function getActivePromosCount(): number {
    return promos.filter(promo => isPromoActive(promo.validUntil) && promo.isPublic).length;
  }

  function getExpiredPromosCount(): number {
    return promos.filter(promo => !isPromoActive(promo.validUntil)).length;
  }

  function getDraftPromosCount(): number {
    return promos.filter(promo => !promo.isPublic).length;
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

<div class="space-y-6 lg:space-y-8">

  <!-- Enhanced Header Section -->
  <div class="bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 rounded-2xl lg:rounded-3xl shadow-xl text-white overflow-hidden relative">
    <!-- Background Pattern -->
    <div class="absolute inset-0 bg-gradient-to-br from-orange-600/20 via-transparent to-yellow-600/20">
      <div class="absolute top-4 right-4 w-32 h-32 bg-orange-500/10 rounded-full blur-2xl"></div>
      <div class="absolute bottom-4 left-4 w-24 h-24 bg-yellow-500/10 rounded-full blur-xl"></div>
    </div>
    
    <div class="relative p-6 sm:p-8 lg:p-10">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        
        <!-- Header Content -->
        <div class="flex-1 mb-6 lg:mb-0">
          <div class="flex items-center gap-4 mb-4">
            <div class="w-12 h-12 sm:w-16 sm:h-16 bg-white/20 backdrop-blur-sm rounded-2xl flex items-center justify-center border border-white/30">
              <span class="text-2xl sm:text-3xl">🎉</span>
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-white drop-shadow-sm">
                Promotions
              </h1>
              <p class="text-gray-200 text-sm sm:text-base font-medium">Manage special offers and marketing campaigns</p>
            </div>
          </div>
        </div>

        <!-- Action Buttons -->
        <div class="flex flex-col sm:flex-row gap-3">
          <button
            on:click={showAddPromoForm}
            class="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 border border-white/30 hover:border-white/50 group flex items-center gap-2"
          >
            <span class="text-xl group-hover:scale-110 transition-transform duration-200">🎉</span>
            <span>Create Promotion</span>
          </button>
        </div>
      </div>

      <!-- Stats Preview -->
      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 lg:gap-4 mt-6">
        <div class="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
          <div class="text-2xl font-bold text-white drop-shadow-sm">{promos.length}</div>
          <div class="text-xs text-gray-200 font-medium uppercase tracking-wide">Total</div>
        </div>
        <div class="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
          <div class="text-2xl font-bold text-white drop-shadow-sm">{getActivePromosCount()}</div>
          <div class="text-xs text-gray-200 font-medium uppercase tracking-wide">Active</div>
        </div>
        <div class="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
          <div class="text-2xl font-bold text-white drop-shadow-sm">{getDraftPromosCount()}</div>
          <div class="text-xs text-gray-200 font-medium uppercase tracking-wide">Drafts</div>
        </div>
        <div class="bg-white/15 backdrop-blur-sm rounded-xl p-4 text-center border border-white/20">
          <div class="text-2xl font-bold text-white drop-shadow-sm">{getExpiredPromosCount()}</div>
          <div class="text-xs text-gray-200 font-medium uppercase tracking-wide">Expired</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Enhanced Filters Section -->
  <div class="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    
    <!-- Desktop Filters -->
    <div class="hidden lg:block p-6">
      <div class="space-y-6">
        <!-- Quick Filter Buttons -->
        <div class="flex flex-wrap gap-3">
          <button 
            on:click={() => filterStatus = 'all'}
            class="{filterStatus === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          >
            <span class="text-sm">📊</span>
            <span>All ({promos.length})</span>
          </button>
          <button 
            on:click={() => filterStatus = 'active'}
            class="{filterStatus === 'active' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          >
            <span class="text-sm">✅</span>
            <span>Active ({getActivePromosCount()})</span>
          </button>
          <button 
            on:click={() => filterStatus = 'draft'}
            class="{filterStatus === 'draft' ? 'bg-yellow-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          >
            <span class="text-sm">📝</span>
            <span>Drafts ({getDraftPromosCount()})</span>
          </button>
          <button 
            on:click={() => filterStatus = 'expired'}
            class="{filterStatus === 'expired' ? 'bg-gray-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2"
          >
            <span class="text-sm">⏰</span>
            <span>Expired ({getExpiredPromosCount()})</span>
          </button>
        </div>
        
        <!-- Search Filter -->
        <div>
          <label for="search" class="block text-sm font-semibold text-gray-700 mb-2">
            Search Promotions
          </label>
          <div class="relative">
            <input
              id="search"
              type="text"
              placeholder="Search by title, description, or promo code..."
              bind:value={searchTerm}
              class="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
            <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <span class="text-gray-400 text-lg">🔍</span>
            </div>
          </div>
        </div>

        <!-- Filter Summary -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-600 flex items-center gap-2">
            <span class="text-lg">📋</span>
            <span>Showing <strong>{filteredPromos.length}</strong> of <strong>{promos.length}</strong> promotions</span>
          </p>
          {#if searchTerm || filterStatus !== 'all'}
            <button
              on:click={clearFilters}
              class="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-2 transition-colors"
            >
              <span>✖️</span>
              <span>Clear Filters</span>
            </button>
          {/if}
        </div>
      </div>
    </div>

    <!-- Mobile Filters -->
    <div class="lg:hidden mobile-filters-container">
      <!-- Mobile Filter Toggle -->
      <div class="p-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <p class="text-sm text-gray-600 flex items-center gap-2">
            <span>📋</span>
            <span>Showing <strong>{filteredPromos.length}</strong> of <strong>{promos.length}</strong></span>
          </p>
          <button
            on:click={toggleMobileFilters}
            class="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium flex items-center gap-2"
          >
            <span>🔍</span>
            <span>Filters</span>
          </button>
        </div>
      </div>

      <!-- Mobile Filter Panel -->
      {#if showMobileFilters}
        <div class="p-4 bg-gray-50 border-b border-gray-200 space-y-4">
          <!-- Quick Status Filters -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Status</label>
            <div class="grid grid-cols-2 gap-2">
              <button 
                on:click={() => { filterStatus = 'all'; }}
                class="{filterStatus === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'} px-3 py-2 rounded-lg text-sm font-medium"
              >
                All ({promos.length})
              </button>
              <button 
                on:click={() => { filterStatus = 'active'; }}
                class="{filterStatus === 'active' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-200'} px-3 py-2 rounded-lg text-sm font-medium"
              >
                Active ({getActivePromosCount()})
              </button>
              <button 
                on:click={() => { filterStatus = 'draft'; }}
                class="{filterStatus === 'draft' ? 'bg-yellow-600 text-white' : 'bg-white text-gray-700 border border-gray-200'} px-3 py-2 rounded-lg text-sm font-medium"
              >
                Drafts ({getDraftPromosCount()})
              </button>
              <button 
                on:click={() => { filterStatus = 'expired'; }}
                class="{filterStatus === 'expired' ? 'bg-gray-600 text-white' : 'bg-white text-gray-700 border border-gray-200'} px-3 py-2 rounded-lg text-sm font-medium"
              >
                Expired ({getExpiredPromosCount()})
              </button>
            </div>
          </div>

          <!-- Search -->
          <div>
            <label for="mobile-search" class="block text-sm font-semibold text-gray-700 mb-2">
              Search
            </label>
            <input
              id="mobile-search"
              type="text"
              placeholder="Title, description, code..."
              bind:value={searchTerm}
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Clear Filters -->
          {#if searchTerm || filterStatus !== 'all'}
            <button
              on:click={clearFilters}
              class="w-full bg-gray-200 text-gray-700 px-4 py-3 rounded-lg font-medium"
            >
              Clear All Filters
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Enhanced Add/Edit Form Modal -->
  {#if showAddForm}
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-xl flex items-center justify-center">
                <span class="text-white text-xl">{editingId ? '✏️' : '🎉'}</span>
              </div>
              <div>
                <h2 class="text-xl font-bold text-gray-900">
                  {editingId ? 'Edit Promotion' : 'Create New Promotion'}
                </h2>
                <p class="text-gray-500 text-sm">
                  {editingId ? 'Update promotion details and settings' : 'Create a new marketing campaign to attract customers'}
                </p>
              </div>
            </div>
            <button
              on:click={cancelForm}
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
              disabled={saving}
              aria-label="Close form"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-6">
          <!-- Templates Section (only for new promotions) -->
          {#if !editingId}
            <div class="mb-8">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span class="text-xl">⚡</span>
                <span>Quick Start Templates</span>
              </h3>
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                {#each promoTemplates as template}
                  <button
                    type="button"
                    on:click={() => applyTemplate(template)}
                    class="text-left p-4 border-2 border-gray-200 rounded-xl hover:border-orange-300 hover:bg-orange-50 transition-all duration-200 group"
                  >
                    <div class="flex items-start justify-between mb-2">
                      <div class="font-semibold text-gray-900 group-hover:text-orange-700 transition-colors">{template.name}</div>
                      <div class="text-orange-600 font-bold text-sm bg-orange-100 px-2 py-1 rounded-lg">{template.discount}</div>
                    </div>
                    <div class="text-sm text-gray-600 mb-1">{template.title}</div>
                    <div class="text-xs text-gray-500 line-clamp-2">{template.description}</div>
                  </button>
                {/each}
              </div>
            </div>
          {/if}

          <form on:submit|preventDefault={savePromotion} class="space-y-8">
            
            <!-- Basic Information Section -->
            <div class="bg-blue-50 rounded-2xl p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span class="text-xl">📝</span>
                <span>Basic Information</span>
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Title -->
                <div class="md:col-span-2">
                  <label for="promo-title" class="block text-sm font-semibold text-gray-700 mb-2">
                    Promotion Title *
                  </label>
                  <input
                    id="promo-title"
                    type="text"
                    bind:value={formData.title}
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 {formErrors.title ? 'border-red-500' : ''}"
                    placeholder="e.g., 20% Off First Visit"
                    required
                  />
                  {#if formErrors.title}
                    <p class="text-red-600 text-sm mt-2 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{formErrors.title}</span>
                    </p>
                  {/if}
                </div>

                <!-- Discount -->
                <div>
                  <label for="discount" class="block text-sm font-semibold text-gray-700 mb-2">
                    Discount Value
                  </label>
                  <input
                    id="discount"
                    type="text"
                    bind:value={formData.discount}
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                    placeholder="e.g., 20%, $50"
                  />
                </div>
              </div>

              <!-- Description -->
              <div class="mt-6">
                <label for="promo-description" class="block text-sm font-semibold text-gray-700 mb-2">
                  Description *
                </label>
                <textarea
                  id="promo-description"
                  bind:value={formData.description}
                  rows="4"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200 {formErrors.description ? 'border-red-500' : ''}"
                  placeholder="Describe the promotion details, terms, and how customers can claim it..."
                  required
                ></textarea>
                {#if formErrors.description}
                  <p class="text-red-600 text-sm mt-2 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{formErrors.description}</span>
                  </p>
                {/if}
              </div>
            </div>

            <!-- Configuration Section -->
            <div class="bg-green-50 rounded-2xl p-6">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span class="text-xl">⚙️</span>
                <span>Promotion Settings</span>
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
                <!-- Promo Code -->
                <div>
                  <label for="promo-code" class="block text-sm font-semibold text-gray-700 mb-2">
                    Promo Code
                  </label>
                  <div class="flex gap-2">
                    <input
                      id="promo-code"
                      type="text"
                      bind:value={formData.promoCode}
                      class="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 uppercase transition-all duration-200"
                      placeholder="SAVE20"
                    />
                    <button
                      type="button"
                      on:click={generatePromoCode}
                      class="bg-gray-200 hover:bg-gray-300 text-gray-700 px-4 py-3 rounded-xl font-semibold transition-all duration-200"
                      title="Generate code"
                      aria-label="Generate promo code"
                    >
                      🎲
                    </button>
                  </div>
                </div>

                <!-- Max Uses -->
                <div>
                  <label for="max-uses" class="block text-sm font-semibold text-gray-700 mb-2">
                    Max Uses
                  </label>
                  <input
                    id="max-uses"
                    type="number"
                    min="0"
                    bind:value={formData.maxUses}
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 {formErrors.maxUses ? 'border-red-500' : ''}"
                    placeholder="0 = unlimited"
                  />
                  {#if formErrors.maxUses}
                    <p class="text-red-600 text-sm mt-2 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{formErrors.maxUses}</span>
                    </p>
                  {/if}
                </div>

                <!-- Valid Until -->
                <div>
                  <label for="valid-until" class="block text-sm font-semibold text-gray-700 mb-2">
                    Valid Until *
                  </label>
                  <input
                    id="valid-until"
                    type="date"
                    bind:value={formData.validUntil}
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 {formErrors.validUntil ? 'border-red-500' : ''}"
                    required
                  />
                  {#if formErrors.validUntil}
                    <p class="text-red-600 text-sm mt-2 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{formErrors.validUntil}</span>
                    </p>
                  {/if}
                </div>
              </div>

              <!-- Visibility Toggle -->
              <div class="mt-6 p-4 bg-white rounded-xl border border-gray-200">
                <div class="flex items-center space-x-3">
                  <input
                    id="is-public"
                    type="checkbox"
                    bind:checked={formData.isPublic}
                    class="h-5 w-5 text-blue-600 focus:ring-blue-500 border-gray-300 rounded transition-colors"
                  />
                  <label for="is-public" class="text-sm font-semibold text-gray-700 flex items-center gap-2">
                    <span class="text-lg">{formData.isPublic ? '👁️' : '👁️‍🗨️'}</span>
                    <span>Make this promotion public (visible on website)</span>
                  </label>
                </div>
                <p class="text-xs text-gray-500 mt-2 ml-8">
                  {formData.isPublic ? 'This promotion will be displayed on your public website' : 'This promotion will remain hidden as a draft'}
                </p>
              </div>
            </div>

            <!-- Live Preview -->
            {#if formData.title || formData.description}
              <div class="bg-gradient-to-r from-gray-50 to-blue-50 rounded-2xl p-6 border-2 border-dashed border-blue-200">
                <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span class="text-xl">👁️</span>
                  <span>Live Preview</span>
                </h3>
                <div class="bg-white rounded-xl p-6 border border-blue-200 shadow-sm">
                  {#if formData.title}
                    <div class="flex items-start justify-between mb-3">
                      <h4 class="text-xl font-bold text-gray-900">{formData.title}</h4>
                      {#if formData.discount}
                        <span class="bg-orange-100 text-orange-800 border border-orange-200 px-3 py-1 rounded-full text-sm font-bold">
                          {formData.discount} OFF
                        </span>
                      {/if}
                    </div>
                  {/if}
                  {#if formData.description}
                    <p class="text-gray-600 mb-4 leading-relaxed">{formData.description}</p>
                  {/if}
                  <div class="flex items-center justify-between text-sm border-t border-gray-200 pt-4">
                    {#if formData.promoCode}
                      <span class="bg-blue-100 px-3 py-2 rounded-lg font-mono text-blue-700 border border-blue-200">
                        Code: {formData.promoCode}
                      </span>
                    {/if}
                    {#if formData.validUntil}
                      <span class="text-gray-500 flex items-center gap-1">
                        <span>📅</span>
                        <span>Valid until {formatDisplayDate(formData.validUntil)}</span>
                      </span>
                    {/if}
                  </div>
                  {#if formData.maxUses > 0}
                    <div class="mt-3 text-xs text-gray-500 bg-gray-50 rounded-lg p-2">
                      Limited to {formData.maxUses} uses
                    </div>
                  {/if}
                </div>
              </div>
            {/if}

          </form>
        </div>

        <!-- Modal Footer -->
        <div class="sticky bottom-0 bg-white px-6 py-4 border-t border-gray-200 rounded-b-2xl">
          <div class="flex flex-col sm:flex-row justify-end gap-3">
            <button
              type="button"
              on:click={cancelForm}
              class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 py-3 rounded-xl font-semibold transition-all duration-200 order-2 sm:order-1"
              disabled={saving}
            >
              <span>✖️</span>
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              on:click={savePromotion}
              disabled={saving || !formData.title || !formData.description || !formData.validUntil}
              class="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-xl font-semibold transition-all duration-200 order-1 sm:order-2 flex items-center gap-2"
            >
              {#if saving}
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              {:else}
                <span>{editingId ? '💾' : '🎉'}</span>
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
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-2xl shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <span class="text-white text-xl">🗑️</span>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Delete Promotion</h2>
              <p class="text-gray-500 text-sm">This action cannot be undone</p>
            </div>
          </div>
          <div class="text-center mb-6">
            <div class="text-6xl mb-4">⚠️</div>
            <p class="text-gray-600">
              Are you sure you want to delete this promotion? This action is permanent and cannot be reversed.
            </p>
          </div>
          <div class="flex flex-col sm:flex-row justify-end gap-3">
            <button
              on:click={() => { showDeleteConfirm = false; deleteItemId = ''; }}
              class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-xl font-semibold transition-all duration-200 order-2 sm:order-1"
            >
              <span>✖️</span>
              <span>Cancel</span>
            </button>
            <button
              on:click={deletePromotion}
              class="bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200 order-1 sm:order-2"
            >
              <span>🗑️</span>
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
        <div class="relative mb-6">
          <div class="w-16 h-16 border-4 border-orange-200 border-t-orange-600 rounded-full animate-spin mx-auto"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-2xl">🎉</span>
          </div>
        </div>
        <h3 class="text-xl font-semibold text-gray-900 mb-2">Loading Promotions</h3>
        <p class="text-gray-600">Please wait while we fetch your promotion data...</p>
      </div>
    </div>
  {:else if filteredPromos.length > 0}
    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
      {#each filteredPromos as promo}
        {@const status = getPromoStatus(promo)}
        <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 transform hover:-translate-y-2 group">
          
          <!-- Header -->
          <div class="flex items-start justify-between mb-4">
            <div class="flex-1 min-w-0">
              <h3 class="text-lg font-bold text-gray-900 mb-2 group-hover:text-blue-700 transition-colors line-clamp-2">{promo.title}</h3>
              {#if promo.discount}
                <div class="inline-flex items-center bg-orange-100 text-orange-800 border border-orange-200 px-3 py-1 rounded-full text-sm font-bold">
                  <span class="mr-1">🏷️</span>
                  <span>{promo.discount} OFF</span>
                </div>
              {/if}
            </div>
            <div class="flex items-center gap-2 ml-4">
              <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border {status.color}">
                <span class="mr-1">{status.icon}</span>
                <span>{status.text}</span>
              </span>
            </div>
          </div>

          <!-- Description -->
          <p class="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">{promo.description}</p>

          <!-- Details Grid -->
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div class="bg-gray-50 rounded-xl p-3">
              <p class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Valid Until</p>
              <p class="font-semibold text-gray-900 flex items-center gap-1">
                <span class="text-sm">📅</span>
                <span>{formatDisplayDate(promo.validUntil)}</span>
              </p>
            </div>
            <div class="bg-blue-50 rounded-xl p-3">
              <p class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Usage</p>
              <p class="font-semibold text-blue-700 flex items-center gap-1">
                <span class="text-sm">📊</span>
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
            <div class="mb-4">
              <p class="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Promo Code</p>
              <div class="bg-gradient-to-r from-blue-50 to-purple-50 px-4 py-3 rounded-xl font-mono text-sm text-blue-700 border-2 border-dashed border-blue-200 text-center font-bold">
                {promo.promoCode}
              </div>
            </div>
          {/if}

          <!-- Actions -->
          <div class="flex items-center justify-between pt-4 border-t border-gray-200">
            <div class="flex items-center gap-2">
              <button
                on:click={() => editPromotion(promo)}
                class="bg-blue-50 hover:bg-blue-100 text-blue-700 hover:text-blue-800 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-1"
                title="Edit promotion"
              >
                <span>✏️</span>
                <span>Edit</span>
              </button>
              <button
                on:click={() => confirmDelete(promo.id)}
                class="bg-red-50 hover:bg-red-100 text-red-700 hover:text-red-800 px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-1"
                title="Delete promotion"
              >
                <span>🗑️</span>
                <span>Delete</span>
              </button>
            </div>
            
            <div class="flex items-center gap-2">
              <button
                on:click={() => togglePromoStatus(promo)}
                class="{promo.isPublic ? 'bg-yellow-50 hover:bg-yellow-100 text-yellow-700 hover:text-yellow-800' : 'bg-green-50 hover:bg-green-100 text-green-700 hover:text-green-800'} px-3 py-2 rounded-lg font-medium text-sm transition-all duration-200 flex items-center gap-1"
                title="{promo.isPublic ? 'Make private' : 'Make public'}"
              >
                <span>{promo.isPublic ? '👁️' : '👁️‍🗨️'}</span>
                <span>{promo.isPublic ? 'Public' : 'Draft'}</span>
              </button>
            </div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <!-- Enhanced Empty State -->
    <div class="bg-white rounded-2xl p-12 sm:p-16 text-center shadow-sm border border-gray-100">
      <div class="text-gray-400 text-6xl sm:text-7xl mb-6 animate-pulse">🎉</div>
      <h3 class="text-2xl font-bold text-gray-900 mb-4">
        {searchTerm || filterStatus !== 'all' ? 'No promotions found' : 'No promotions created'}
      </h3>
      <p class="text-gray-500 mb-8 max-w-md mx-auto text-lg leading-relaxed">
        {searchTerm || filterStatus !== 'all' 
          ? 'Try adjusting your filters or search terms to find what you\'re looking for.' 
          : 'Create your first promotion to attract new patients and reward existing ones with special offers.'}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          on:click={showAddPromoForm}
          class="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
        >
          <span class="text-xl">🎉</span>
          <span>Create First Promotion</span>
        </button>
        {#if searchTerm || filterStatus !== 'all'}
          <button
            on:click={clearFilters}
            class="bg-gray-200 hover:bg-gray-300 text-gray-800 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-200 flex items-center gap-2"
          >
            <span>✖️</span>
            <span>Clear All Filters</span>
          </button>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Information Panel -->
  <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
    
    <!-- Marketing Tips -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span class="text-xl">💡</span>
        <span>Promotion Best Practices</span>
      </h3>
      <ul class="space-y-3 text-sm text-gray-600">
        <li class="flex items-start gap-3">
          <span class="text-green-500 font-bold text-lg flex-shrink-0">✓</span>
          <span>Create urgency with limited-time offers and countdown dates</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-green-500 font-bold text-lg flex-shrink-0">✓</span>
          <span>Use clear, benefit-focused headlines that highlight the value</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-green-500 font-bold text-lg flex-shrink-0">✓</span>
          <span>Include specific terms and conditions to avoid confusion</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-green-500 font-bold text-lg flex-shrink-0">✓</span>
          <span>Track usage with promo codes to measure campaign success</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-green-500 font-bold text-lg flex-shrink-0">✓</span>
          <span>Test different discount amounts to find what converts best</span>
        </li>
      </ul>
    </div>

    <!-- Quick Stats -->
    <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span class="text-xl">📊</span>
        <span>Promotion Performance</span>
      </h3>
      <div class="space-y-4">
        <div class="flex items-center justify-between p-4 bg-green-50 rounded-xl border border-green-200">
          <div>
            <p class="text-sm font-semibold text-green-700">Active Promotions</p>
            <p class="text-2xl font-bold text-green-900">{getActivePromosCount()}</p>
          </div>
          <div class="text-green-600 text-3xl">🎯</div>
        </div>

        <div class="flex items-center justify-between p-4 bg-blue-50 rounded-xl border border-blue-200">
          <div>
            <p class="text-sm font-semibold text-blue-700">Total Reach</p>
            <p class="text-2xl font-bold text-blue-900">
              {promos.reduce((sum, promo) => sum + promo.currentUses, 0)} uses
            </p>
          </div>
          <div class="text-blue-600 text-3xl">📈</div>
        </div>

        <div class="flex items-center justify-between p-4 bg-yellow-50 rounded-xl border border-yellow-200">
          <div>
            <p class="text-sm font-semibold text-yellow-700">Draft Promotions</p>
            <p class="text-2xl font-bold text-yellow-900">{getDraftPromosCount()}</p>
          </div>
          <div class="text-yellow-600 text-3xl">📝</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Promotion Guidelines -->
  <div class="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
    <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <span class="text-xl">ℹ️</span>
      <span>How Promotions Work</span>
    </h3>
    <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
      <div>
        <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span class="text-lg">👁️</span>
          <span>Visibility</span>
        </h4>
        <ul class="space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-blue-500 font-bold">•</span>
            <span><strong>Public</strong> promotions appear on your website automatically</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-yellow-500 font-bold">•</span>
            <span><strong>Draft</strong> promotions are hidden until you make them public</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-gray-500 font-bold">•</span>
            <span>Expired promotions are automatically hidden from public view</span>
          </li>
        </ul>
      </div>
      <div>
        <h4 class="font-semibold text-gray-800 mb-3 flex items-center gap-2">
          <span class="text-lg">📊</span>
          <span>Usage Tracking</span>
        </h4>
        <ul class="space-y-2">
          <li class="flex items-start gap-2">
            <span class="text-purple-500 font-bold">•</span>
            <span>Set max uses to limit promotion availability</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-green-500 font-bold">•</span>
            <span>Track redemptions with unique promo codes</span>
          </li>
          <li class="flex items-start gap-2">
            <span class="text-orange-500 font-bold">•</span>
            <span>Monitor performance to optimize future campaigns</span>
          </li>
        </ul>
      </div>
    </div>
  </div>

  <!-- Mobile FAB -->
  <div class="lg:hidden fixed bottom-6 right-6 z-40">
    <button
      on:click={showAddPromoForm}
      class="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
    >
      <span class="text-2xl">🎉</span>
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

  /* Card hover effects */
  .card-hover {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .card-hover:hover {
    transform: translateY(-4px);
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04);
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
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    .mobile-card {
      margin: 0.5rem;
    }
    
    .mobile-form {
      padding: 1rem;
    }
  }

  /* Enhanced focus states */
  button:focus-visible,
  input:focus-visible,
  textarea:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
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
      border: 2px solid #000;
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
      border: 1px solid #000;
      break-inside: avoid;
    }
  }
</style>