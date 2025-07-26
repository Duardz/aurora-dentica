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

  let formErrors: Partial<PromoForm> = {};
  let saving = false;

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

  function getPromoStatus(promo: Promotion): { text: string; color: string } {
    if (!promo.isPublic) {
      return { text: 'Draft', color: 'status-neutral' };
    }
    if (!isPromoActive(promo.validUntil)) {
      return { text: 'Expired', color: 'status-error' };
    }
    if (promo.maxUses > 0 && promo.currentUses >= promo.maxUses) {
      return { text: 'Limit Reached', color: 'status-warning' };
    }
    return { text: 'Active', color: 'status-active' };
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
</script>

<svelte:head>
  <title>Promotions - Aurora Dentica Admin</title>
</svelte:head>

<!-- Page Header -->
<div class="mb-6 sm:mb-8">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <span class="text-2xl">🎉</span>
        <span>Promotions</span>
      </h1>
      <p class="text-gray-600">Manage special offers and marketing campaigns</p>
    </div>
    <button
      on:click={showAddPromoForm}
      class="btn-primary btn-lg mt-4 sm:mt-0"
    >
      <span>🎉</span>
      <span>Create Promotion</span>
    </button>
  </div>

  <!-- Stats Cards -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <div class="card p-4 border-l-4 border-primary-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-primary-700">Total</p>
          <p class="text-2xl font-bold text-primary-900">{promos.length}</p>
        </div>
        <div class="text-primary-600 text-2xl">🎉</div>
      </div>
    </div>

    <div class="card p-4 border-l-4 border-success-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-success-700">Active</p>
          <p class="text-2xl font-bold text-success-900">{getActivePromosCount()}</p>
        </div>
        <div class="text-success-600 text-2xl">✅</div>
      </div>
    </div>

    <div class="card p-4 border-l-4 border-warning-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-warning-700">Drafts</p>
          <p class="text-2xl font-bold text-warning-900">{getDraftPromosCount()}</p>
        </div>
        <div class="text-warning-600 text-2xl">📝</div>
      </div>
    </div>

    <div class="card p-4 border-l-4 border-gray-500">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-700">Expired</p>
          <p class="text-2xl font-bold text-gray-900">{getExpiredPromosCount()}</p>
        </div>
        <div class="text-gray-400 text-2xl">⏰</div>
      </div>
    </div>
  </div>
</div>

<!-- Enhanced Filters -->
<div class="card p-4 sm:p-6 mb-6 sm:mb-8">
  <div class="flex flex-col lg:flex-row gap-4">
    <!-- Quick Filter Buttons -->
    <div class="flex flex-wrap gap-2">
      <button 
        on:click={() => filterStatus = 'all'}
        class="{filterStatus === 'all' ? 'btn-primary' : 'btn-ghost'} btn-sm"
      >
        All ({promos.length})
      </button>
      <button 
        on:click={() => filterStatus = 'active'}
        class="{filterStatus === 'active' ? 'btn-success' : 'btn-ghost'} btn-sm"
      >
        Active ({getActivePromosCount()})
      </button>
      <button 
        on:click={() => filterStatus = 'draft'}
        class="{filterStatus === 'draft' ? 'btn-warning' : 'btn-ghost'} btn-sm"
      >
        Drafts ({getDraftPromosCount()})
      </button>
      <button 
        on:click={() => filterStatus = 'expired'}
        class="{filterStatus === 'expired' ? 'btn-secondary' : 'btn-ghost'} btn-sm"
      >
        Expired ({getExpiredPromosCount()})
      </button>
    </div>
    
    <!-- Search -->
    <div class="flex-1">
      <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
        Search Promotions
      </label>
      <input
        id="search"
        type="text"
        placeholder="Title, description, promo code..."
        bind:value={searchTerm}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
    </div>
  </div>

  <div class="mt-4 flex items-center justify-between">
    <p class="text-sm text-gray-600">
      Showing {filteredPromos.length} of {promos.length} promotions
    </p>
    <button
      on:click={() => { filterStatus = 'all'; searchTerm = ''; }}
      class="btn-ghost btn-sm"
    >
      Clear Filters
    </button>
  </div>
</div>

<!-- Enhanced Add/Edit Form Modal -->
{#if showAddForm}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-2xl">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span>{editingId ? '✏️' : '🎉'}</span>
            <span>{editingId ? 'Edit Promotion' : 'Create New Promotion'}</span>
          </h2>
          <button 
            on:click={cancelForm} 
            class="btn-ghost p-2" 
            disabled={saving}
            aria-label="Close form"
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="p-6">
        <!-- Templates Section (only for new promotions) -->
        {#if !editingId}
          <div class="mb-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-3">Quick Start Templates</h3>
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              {#each promoTemplates as template}
                <button
                  type="button"
                  on:click={() => applyTemplate(template)}
                  class="text-left p-3 border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-colors"
                >
                  <div class="font-medium text-gray-900">{template.name}</div>
                  <div class="text-sm text-gray-600 mt-1">{template.title}</div>
                  <div class="text-xs text-primary-600 mt-1">{template.discount} off</div>
                </button>
              {/each}
            </div>
          </div>
        {/if}

        <form on:submit|preventDefault={savePromotion} class="space-y-6">
          
          <!-- Title and Discount -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div class="md:col-span-2">
              <label for="promo-title" class="block text-sm font-medium text-gray-700 mb-2">
                Promotion Title *
              </label>
              <input
                id="promo-title"
                type="text"
                bind:value={formData.title}
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {formErrors.title ? 'form-error' : ''}"
                placeholder="e.g., 20% Off First Visit"
                required
              />
              {#if formErrors.title}
                <p class="error-message">{formErrors.title}</p>
              {/if}
            </div>

            <div>
              <label for="discount" class="block text-sm font-medium text-gray-700 mb-2">
                Discount Value
              </label>
              <input
                id="discount"
                type="text"
                bind:value={formData.discount}
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                placeholder="e.g., 20%, $50"
              />
            </div>
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
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none {formErrors.description ? 'form-error' : ''}"
              placeholder="Describe the promotion details, terms, and how customers can claim it..."
              required
            ></textarea>
            {#if formErrors.description}
              <p class="error-message">{formErrors.description}</p>
            {/if}
          </div>

          <!-- Promo Code and Dates -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label for="promo-code" class="block text-sm font-medium text-gray-700 mb-2">
                Promo Code
              </label>
              <div class="flex gap-2">
                <input
                  id="promo-code"
                  type="text"
                  bind:value={formData.promoCode}
                  class="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 uppercase"
                  placeholder="SAVE20"
                />
                <button
                  type="button"
                  on:click={generatePromoCode}
                  class="btn-secondary"
                  title="Generate code"
                  aria-label="Generate promo code"
                >
                  🎲
                </button>
              </div>
            </div>

            <div>
              <label for="max-uses" class="block text-sm font-medium text-gray-700 mb-2">
                Max Uses
              </label>
              <input
                id="max-uses"
                type="number"
                min="0"
                bind:value={formData.maxUses}
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {formErrors.maxUses ? 'form-error' : ''}"
                placeholder="0 = unlimited"
              />
              {#if formErrors.maxUses}
                <p class="error-message">{formErrors.maxUses}</p>
              {/if}
            </div>

            <div>
              <label for="valid-until" class="block text-sm font-medium text-gray-700 mb-2">
                Valid Until *
              </label>
              <input
                id="valid-until"
                type="date"
                bind:value={formData.validUntil}
                class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {formErrors.validUntil ? 'form-error' : ''}"
                required
              />
              {#if formErrors.validUntil}
                <p class="error-message">{formErrors.validUntil}</p>
              {/if}
            </div>
          </div>

          <!-- Status Toggle -->
          <div class="flex items-center space-x-3">
            <input
              id="is-public"
              type="checkbox"
              bind:checked={formData.isPublic}
              class="h-4 w-4 text-primary-600 focus:ring-primary-500 border-gray-300 rounded"
            />
            <label for="is-public" class="text-sm font-medium text-gray-700">
              Make this promotion public (visible on website)
            </label>
          </div>

          <!-- Live Preview -->
          {#if formData.title || formData.description}
            <div class="bg-gray-50 rounded-lg p-4">
              <h4 class="font-medium text-gray-900 mb-2 flex items-center gap-2">
                <span>👁️</span>
                <span>Preview</span>
              </h4>
              <div class="bg-white rounded-lg p-4 border border-gray-200">
                {#if formData.title}
                  <div class="flex items-start justify-between mb-2">
                    <h5 class="text-lg font-semibold text-gray-900">{formData.title}</h5>
                    {#if formData.discount}
                      <span class="status-active">{formData.discount} OFF</span>
                    {/if}
                  </div>
                {/if}
                {#if formData.description}
                  <p class="text-gray-600 mb-3">{formData.description}</p>
                {/if}
                <div class="flex items-center justify-between text-sm">
                  {#if formData.promoCode}
                    <span class="bg-gray-100 px-2 py-1 rounded font-mono text-primary-600">
                      Code: {formData.promoCode}
                    </span>
                  {/if}
                  {#if formData.validUntil}
                    <span class="text-gray-500">
                      Valid until {formatDisplayDate(formData.validUntil)}
                    </span>
                  {/if}
                </div>
              </div>
            </div>
          {/if}

          <!-- Form Actions -->
          <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" on:click={cancelForm} class="btn-secondary" disabled={saving}>
              Cancel
            </button>
            <button type="submit" disabled={saving} class="btn-primary">
              {#if saving}
                <div class="loading-spinner"></div>
                <span>Saving...</span>
              {:else}
                <span>{editingId ? '💾' : '🎉'}</span>
                <span>{editingId ? 'Update' : 'Create'} Promotion</span>
              {/if}
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
{/if}

<!-- Enhanced Promotions List -->
{#if loading}
  <div class="flex justify-center items-center py-16">
    <div class="text-center">
      <div class="loading-spinner h-12 w-12 text-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading promotions...</p>
    </div>
  </div>
{:else if filteredPromos.length > 0}
  <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
    {#each filteredPromos as promo}
      {@const status = getPromoStatus(promo)}
      <div class="card p-6 hover:shadow-card-hover transition-all duration-300">
        
        <!-- Header -->
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <h3 class="text-lg font-semibold text-gray-900 mb-1">{promo.title}</h3>
            {#if promo.discount}
              <div class="text-primary-600 font-bold text-sm">{promo.discount} OFF</div>
            {/if}
          </div>
          <div class="flex items-center gap-2 ml-4">
            <span class="{status.color} px-2 py-1 rounded-full text-xs font-medium">
              {status.text}
            </span>
          </div>
        </div>

        <!-- Description -->
        <p class="text-gray-600 mb-4 line-clamp-3 text-sm leading-relaxed">{promo.description}</p>

        <!-- Details Grid -->
        <div class="grid grid-cols-2 gap-4 mb-4 text-sm">
          <div>
            <p class="text-gray-500">Valid Until</p>
            <p class="font-medium text-gray-900">{formatDisplayDate(promo.validUntil)}</p>
          </div>
          <div>
            <p class="text-gray-500">Usage</p>
            <p class="font-medium text-gray-900">
              {#if promo.maxUses > 0}
                {promo.currentUses} / {promo.maxUses}
              {:else}
                {promo.currentUses} (unlimited)
              {/if}
            </p>
          </div>
        </div>

        <!-- Promo Code -->
        {#if promo.promoCode}
          <div class="mb-4">
            <p class="text-gray-500 text-xs mb-1">Promo Code</p>
            <div class="bg-gray-100 px-3 py-2 rounded-lg font-mono text-sm text-primary-600 border border-dashed border-primary-300">
              {promo.promoCode}
            </div>
          </div>
        {/if}

        <!-- Actions -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-200">
          <div class="flex items-center gap-2">
            <button
              on:click={() => editPromotion(promo)}
              class="btn-ghost btn-sm"
              title="Edit promotion"
            >
              ✏️ Edit
            </button>
            <button
              on:click={() => deletePromotion(promo.id)}
              class="btn-ghost btn-sm text-error-600 hover:text-error-700"
              title="Delete promotion"
            >
              🗑️ Delete
            </button>
          </div>
          
          <div class="flex items-center gap-2">
            <button
              on:click={() => togglePromoStatus(promo)}
              class="{promo.isPublic ? 'btn-warning' : 'btn-success'} btn-sm"
              title="{promo.isPublic ? 'Make private' : 'Make public'}"
            >
              {promo.isPublic ? '👁️ Public' : '👁️‍🗨️ Draft'}
            </button>
          </div>
        </div>
      </div>
    {/each}
  </div>
{:else}
  <!-- Enhanced Empty State -->
  <div class="card p-8 sm:p-12 text-center">
    <div class="text-gray-400 text-5xl sm:text-6xl mb-4">🎉</div>
    <h3 class="text-xl font-semibold text-gray-900 mb-2">
      {searchTerm || filterStatus !== 'all' ? 'No promotions found' : 'No promotions created'}
    </h3>
    <p class="text-gray-500 mb-6 max-w-md mx-auto">
      {searchTerm || filterStatus !== 'all' 
        ? 'Try adjusting your filters or search terms to find what you\'re looking for.' 
        : 'Create your first promotion to attract new patients and reward existing ones with special offers.'}
    </p>
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <button on:click={showAddPromoForm} class="btn-primary">
        <span>🎉</span>
        <span>Create First Promotion</span>
      </button>
      {#if searchTerm || filterStatus !== 'all'}
        <button
          on:click={() => { filterStatus = 'all'; searchTerm = ''; }}
          class="btn-secondary"
        >
          Clear All Filters
        </button>
      {/if}
    </div>
  </div>
{/if}

<!-- Information Panel -->
<div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
  
  <!-- Marketing Tips -->
  <div class="card p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <span class="text-xl">💡</span>
      <span>Promotion Best Practices</span>
    </h3>
    <ul class="space-y-3 text-sm text-gray-600">
      <li class="flex items-start gap-2">
        <span class="text-success-500 font-bold">✓</span>
        <span>Create urgency with limited-time offers and countdown dates</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-success-500 font-bold">✓</span>
        <span>Use clear, benefit-focused headlines that highlight the value</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-success-500 font-bold">✓</span>
        <span>Include specific terms and conditions to avoid confusion</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-success-500 font-bold">✓</span>
        <span>Track usage with promo codes to measure campaign success</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-success-500 font-bold">✓</span>
        <span>Test different discount amounts to find what converts best</span>
      </li>
    </ul>
  </div>

  <!-- Quick Stats -->
  <div class="card p-6">
    <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <span class="text-xl">📊</span>
      <span>Promotion Performance</span>
    </h3>
    <div class="space-y-4">
      <div class="flex items-center justify-between p-3 bg-success-50 rounded-lg">
        <div>
          <p class="text-sm font-medium text-success-700">Active Promotions</p>
          <p class="text-lg font-bold text-success-900">{getActivePromosCount()}</p>
        </div>
        <div class="text-success-600 text-2xl">🎯</div>
      </div>

      <div class="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
        <div>
          <p class="text-sm font-medium text-primary-700">Total Reach</p>
          <p class="text-lg font-bold text-primary-900">
            {promos.reduce((sum, promo) => sum + promo.currentUses, 0)} uses
          </p>
        </div>
        <div class="text-primary-600 text-2xl">📈</div>
      </div>

      <div class="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
        <div>
          <p class="text-sm font-medium text-warning-700">Draft Promotions</p>
          <p class="text-lg font-bold text-warning-900">{getDraftPromosCount()}</p>
        </div>
        <div class="text-warning-600 text-2xl">📝</div>
      </div>
    </div>
  </div>
</div>

<!-- Promotion Guidelines -->
<div class="mt-6 card p-6">
  <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
    <span class="text-xl">ℹ️</span>
    <span>How Promotions Work</span>
  </h3>
  <div class="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm text-gray-600">
    <div>
      <h4 class="font-semibold text-gray-800 mb-2">Visibility</h4>
      <ul class="space-y-1">
        <li>• <strong>Public</strong> promotions appear on your website automatically</li>
        <li>• <strong>Draft</strong> promotions are hidden until you make them public</li>
        <li>• Expired promotions are automatically hidden from public view</li>
      </ul>
    </div>
    <div>
      <h4 class="font-semibold text-gray-800 mb-2">Usage Tracking</h4>
      <ul class="space-y-1">
        <li>• Set max uses to limit promotion availability</li>
        <li>• Track redemptions with unique promo codes</li>
        <li>• Monitor performance to optimize future campaigns</li>
      </ul>
    </div>
  </div>
</div>}