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
    createdAt?: any;
  }

  interface PromoForm {
    title: string;
    description: string;
    validUntil: string;
  }

  let promos: Promotion[] = [];
  let filteredPromos: Promotion[] = [];
  let loading = true;
  let showAddForm = false;
  let editingId: string | null = null;
  let searchTerm = '';
  let filterStatus = 'all'; // all, active, expired

  // Form data
  let formData: PromoForm = {
    title: '',
    description: '',
    validUntil: ''
  };

  let formErrors: Partial<PromoForm> = {};
  let saving = false;

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
          createdAt: data.createdAt
        }, ['title', 'description']);
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
        promo.description.toLowerCase().includes(search)
      );
    }

    // Filter by status
    if (filterStatus !== 'all') {
      const today = getTodayDate();
      filtered = filtered.filter(promo => {
        const isActive = promo.validUntil >= today;
        return filterStatus === 'active' ? isActive : !isActive;
      });
    }

    filteredPromos = filtered;
  }

  function resetForm() {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    formData = {
      title: '',
      description: '',
      validUntil: tomorrow.toISOString().split('T')[0]
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
        validUntil: formData.validUntil
      };

      // Encrypt sensitive fields
      const encryptedData = encryptFields(sanitizedData, ['title', 'description']);

      if (editingId) {
        // Update existing promotion
        const promoRef = doc(db, 'promos', editingId);
        await updateDoc(promoRef, encryptedData);
      } else {
        // Create new promotion
        const promoData = {
          ...encryptedData,
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
      validUntil: promo.validUntil
    };
    editingId = promo.id;
    showAddForm = true;
  }

  async function deletePromotion(id: string) {
    if (!db || !confirm('Are you sure you want to delete this promotion?')) return;

    try {
      await deleteDoc(doc(db, 'promos', id));
      await loadPromotions();
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

  function getActivePromosCount(): number {
    return promos.filter(promo => isPromoActive(promo.validUntil)).length;
  }

  function getExpiredPromosCount(): number {
    return promos.filter(promo => !isPromoActive(promo.validUntil)).length;
  }
</script>

<svelte:head>
  <title>Promotions - Aurora Dentica Admin</title>
</svelte:head>

<!-- Page Header -->
<div class="mb-8">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Promotions</h1>
      <p class="text-gray-600">Manage special offers and announcements</p>
    </div>
    <button
      on:click={showAddPromoForm}
      class="mt-4 sm:mt-0 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors inline-flex items-center space-x-2"
    >
      <span>🎉</span>
      <span>Add Promotion</span>
    </button>
  </div>
</div>

<!-- Stats Cards -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
  <div class="bg-white rounded-xl shadow-card p-6 border border-gray-100">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600">Total Promotions</p>
        <p class="text-3xl font-bold text-gray-900">{promos.length}</p>
      </div>
      <div class="text-primary-600 text-3xl">🎉</div>
    </div>
  </div>

  <div class="bg-green-50 border border-green-200 rounded-xl p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-green-800">Active Promotions</p>
        <p class="text-3xl font-bold text-green-900">{getActivePromosCount()}</p>
      </div>
      <div class="text-green-600 text-3xl">✅</div>
    </div>
  </div>

  <div class="bg-gray-50 border border-gray-200 rounded-xl p-6">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-gray-600">Expired</p>
        <p class="text-3xl font-bold text-gray-700">{getExpiredPromosCount()}</p>
      </div>
      <div class="text-gray-400 text-3xl">⏰</div>
    </div>
  </div>
</div>

<!-- Filters -->
<div class="bg-white rounded-xl shadow-card border border-gray-100 p-6 mb-8">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Filter Status -->
    <div>
      <label for="filter-status" class="block text-sm font-medium text-gray-700 mb-2">
        Filter by Status
      </label>
      <select
        id="filter-status"
        bind:value={filterStatus}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="all">All Promotions</option>
        <option value="active">Active Only</option>
        <option value="expired">Expired Only</option>
      </select>
    </div>

    <!-- Search -->
    <div>
      <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
        Search Promotions
      </label>
      <input
        id="search"
        type="text"
        placeholder="Search by title or description..."
        bind:value={searchTerm}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
    </div>
  </div>

  <div class="mt-4 flex items-center justify-between">
    <p class="text-sm text-gray-600">
      Showing {filteredPromos.length} promotion{filteredPromos.length !== 1 ? 's' : ''}
    </p>
    <button
      on:click={() => { filterStatus = 'all'; searchTerm = ''; }}
      class="text-primary-600 hover:text-primary-700 text-sm font-medium"
    >
      Clear Filters
    </button>
  </div>
</div>

<!-- Add/Edit Form Modal -->
{#if showAddForm}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-screen overflow-y-auto">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">
          {editingId ? 'Edit Promotion' : 'Add New Promotion'}
        </h2>
      </div>

      <form on:submit|preventDefault={savePromotion} class="p-6 space-y-6">
        
        <!-- Title -->
        <div>
          <label for="promo-title" class="block text-sm font-medium text-gray-700 mb-2">
            Title *
          </label>
          <input
            id="promo-title"
            type="text"
            bind:value={formData.title}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {formErrors.title ? 'border-red-500' : ''}"
            placeholder="e.g., 20% Off Teeth Whitening"
            required
          />
          {#if formErrors.title}
            <p class="mt-1 text-sm text-red-600">{formErrors.title}</p>
          {/if}
        </div>

        <!-- Description -->
        <div>
          <label for="promo-description" class="block text-sm font-medium text-gray-700 mb-2">
            Description *
          </label>
          <textarea
            id="promo-description"
            bind:value={formData.description}
            rows="4"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {formErrors.description ? 'border-red-500' : ''}"
            placeholder="Describe the promotion details, terms, and how to claim it..."
            required
          ></textarea>
          {#if formErrors.description}
            <p class="mt-1 text-sm text-red-600">{formErrors.description}</p>
          {/if}
        </div>

        <!-- Valid Until -->
        <div>
          <label for="valid-until" class="block text-sm font-medium text-gray-700 mb-2">
            Valid Until *
          </label>
          <input
            id="valid-until"
            type="date"
            bind:value={formData.validUntil}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {formErrors.validUntil ? 'border-red-500' : ''}"
            required
          />
          {#if formErrors.validUntil}
            <p class="mt-1 text-sm text-red-600">{formErrors.validUntil}</p>
          {/if}
        </div>

        <!-- Preview -->
        {#if formData.title || formData.description}
          <div class="bg-gray-50 rounded-lg p-4">
            <h4 class="font-medium text-gray-900 mb-2">Preview</h4>
            <div class="bg-white rounded-lg p-4 border border-gray-200">
              {#if formData.title}
                <h5 class="text-lg font-semibold text-gray-900 mb-2">{formData.title}</h5>
              {/if}
              {#if formData.description}
                <p class="text-gray-600 mb-2">{formData.description}</p>
              {/if}
              {#if formData.validUntil}
                <p class="text-xs text-accent-700 bg-accent-100 px-2 py-1 rounded-full inline-block">
                  Valid until {formatDisplayDate(formData.validUntil)}
                </p>
              {/if}
            </div>
          </div>
        {/if}

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4 pt-4 border-t border-gray-200">
          <button
            type="button"
            on:click={cancelForm}
            class="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            class="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
          >
            {#if saving}
              <div class="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              <span>Saving...</span>
            {:else}
              <span>{editingId ? 'Update' : 'Save'} Promotion</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Promotions List -->
{#if loading}
  <div class="flex justify-center items-center py-16">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
{:else if filteredPromos.length > 0}
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
    {#each filteredPromos as promo}
      {@const isActive = isPromoActive(promo.validUntil)}
      <div class="bg-white rounded-xl shadow-card border border-gray-100 p-6 {!isActive ? 'opacity-75' : ''}">
        
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <h3 class="text-lg font-semibold text-gray-900 flex-1 pr-2">{promo.title}</h3>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}">
            {isActive ? '✅ Active' : '⏰ Expired'}
          </span>
        </div>

        <!-- Description -->
        <p class="text-gray-600 mb-4 line-clamp-3">{promo.description}</p>

        <!-- Valid Until -->
        <div class="mb-4">
          <p class="text-sm text-gray-500">Valid until:</p>
          <p class="font-medium {isActive ? 'text-gray-900' : 'text-red-600'}">
            {formatDisplayDate(promo.validUntil)}
          </p>
        </div>

        <!-- Actions -->
        <div class="flex justify-between items-center pt-4 border-t border-gray-200">
          <div class="flex space-x-2">
            <button
              on:click={() => editPromotion(promo)}
              class="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              Edit
            </button>
            <button
              on:click={() => deletePromotion(promo.id)}
              class="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Delete
            </button>
          </div>
          
          {#if isActive}
            <div class="text-xs text-green-600 font-medium">
              📢 Public
            </div>
          {:else}
            <div class="text-xs text-gray-500">
              🔒 Hidden
            </div>
          {/if}
        </div>
      </div>
    {/each}
  </div>
{:else}
  <!-- Empty State -->
  <div class="bg-white rounded-xl shadow-card border border-gray-100 p-12 text-center">
    <div class="text-gray-400 text-6xl mb-4">🎉</div>
    <h3 class="text-lg font-medium text-gray-900 mb-2">
      {searchTerm || filterStatus !== 'all' ? 'No promotions found' : 'No promotions created'}
    </h3>
    <p class="text-gray-500 mb-6">
      {searchTerm || filterStatus !== 'all' 
        ? 'Try adjusting your filters or search terms' 
        : 'Create your first promotion to attract new patients and reward existing ones'}
    </p>
    <button
      on:click={showAddPromoForm}
      class="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
    >
      Create First Promotion
    </button>
  </div>
{/if}

<!-- Information Card -->
<div class="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
  <div class="flex items-start space-x-3">
    <div class="text-blue-600 text-2xl">💡</div>
    <div>
      <h4 class="font-semibold text-blue-900 mb-2">How Promotions Work</h4>
      <ul class="text-blue-800 text-sm space-y-1">
        <li>• Active promotions automatically appear on your public website</li>
        <li>• Expired promotions are hidden from public view but remain in your records</li>
        <li>• All promotion content is encrypted for security</li>
        <li>• Customers can book appointments directly through Facebook Messenger</li>
      </ul>
    </div>
  </div>
</div>