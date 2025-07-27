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
  import { formatDisplayDate, isLowStock, isNearExpiry, isExpired, sanitizeInput, debounce } from '$lib/utils';

  interface InventoryItem {
    id: string;
    itemName: string;
    quantity: number;
    expiryDate: string;
    notes?: string;
    createdAt?: any;
  }

  interface InventoryForm {
    itemName: string;
    quantity: number;
    expiryDate: string;
    notes: string;
  }

  let items: InventoryItem[] = [];
  let filteredItems: InventoryItem[] = [];
  let loading = true;
  let showAddForm = false;
  let editingId: string | null = null;
  let searchTerm = '';
  let filterType = 'all'; // all, low-stock, expiring, expired
  let showDeleteConfirm = false;
  let deleteItemId = '';

  // Form data
  let formData: InventoryForm = {
    itemName: '',
    quantity: 0,
    expiryDate: '',
    notes: ''
  };

  let formErrors: { itemName?: string; quantity?: string; expiryDate?: string; notes?: string } = {};
  let saving = false;

  const commonItems = [
    { name: 'Dental Gloves', category: 'PPE' },
    { name: 'Face Masks', category: 'PPE' },
    { name: 'Disposable Syringes', category: 'Instruments' },
    { name: 'Dental Floss', category: 'Patient Care' },
    { name: 'Toothbrushes', category: 'Patient Care' },
    { name: 'Fluoride Gel', category: 'Treatment' },
    { name: 'Dental Impression Material', category: 'Treatment' },
    { name: 'Anesthetic Cartridges', category: 'Medication' },
    { name: 'Cotton Rolls', category: 'Supplies' },
    { name: 'Gauze Pads', category: 'Supplies' },
    { name: 'Dental Cement', category: 'Treatment' },
    { name: 'Polishing Paste', category: 'Treatment' },
    { name: 'Bite Registration Material', category: 'Treatment' },
    { name: 'Disinfectant Solution', category: 'Cleaning' },
    { name: 'Dental Bibs', category: 'Patient Care' },
    { name: 'Composite Filling Material', category: 'Treatment' },
    { name: 'Dental Sutures', category: 'Surgery' },
    { name: 'X-ray Film', category: 'Imaging' },
    { name: 'Ultrasonic Cleaning Solution', category: 'Cleaning' },
    { name: 'Prophylaxis Paste', category: 'Treatment' }
  ];

  const categories = [...new Set(commonItems.map(item => item.category))].sort();

  onMount(async () => {
    await loadInventory();
  });

  // Debounced search function
  const debouncedSearch = debounce(() => {
    filterItems();
  }, 300);

  $: if (searchTerm !== undefined) {
    debouncedSearch();
  }

  $: if (filterType) {
    filterItems();
  }

  async function loadInventory() {
    if (!db) {
      loading = false;
      return;
    }

    try {
      const inventoryRef = collection(db, 'inventory');
      const q = query(inventoryRef, orderBy('itemName', 'asc'));
      
      const snapshot = await getDocs(q);
      items = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          itemName: data.itemName,
          quantity: data.quantity,
          expiryDate: data.expiryDate,
          notes: data.notes || '',
          createdAt: data.createdAt
        };
      });

      filterItems();
    } catch (error) {
      console.error('Error loading inventory:', error);
    } finally {
      loading = false;
    }
  }

  function filterItems() {
    let filtered = items;

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(item => 
        item.itemName.toLowerCase().includes(search) ||
        (item.notes && item.notes.toLowerCase().includes(search))
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter(item => {
        switch (filterType) {
          case 'low-stock':
            return isLowStock(item.quantity);
          case 'expiring':
            return isNearExpiry(item.expiryDate) && !isExpired(item.expiryDate);
          case 'expired':
            return isExpired(item.expiryDate);
          case 'good':
            return !isLowStock(item.quantity) && !isNearExpiry(item.expiryDate) && !isExpired(item.expiryDate);
          default:
            return true;
        }
      });
    }

    filteredItems = filtered;
  }

  function resetForm() {
    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);
    
    formData = {
      itemName: '',
      quantity: 0,
      expiryDate: futureDate.toISOString().split('T')[0],
      notes: ''
    };
    formErrors = {};
    editingId = null;
  }

  function validateForm(): boolean {
    formErrors = {};

    if (!formData.itemName.trim()) {
      formErrors.itemName = 'Item name is required';
    }

    if (formData.quantity < 0) {
      formErrors.quantity = 'Quantity cannot be negative';
    }

    if (!formData.expiryDate) {
      formErrors.expiryDate = 'Expiry date is required';
    } else if (new Date(formData.expiryDate) < new Date()) {
      formErrors.expiryDate = 'Expiry date cannot be in the past';
    }

    return Object.keys(formErrors).length === 0;
  }

  async function saveItem() {
    if (!validateForm() || !db) return;

    saving = true;

    try {
      // Sanitize inputs
      const sanitizedData = {
        itemName: sanitizeInput(formData.itemName),
        quantity: formData.quantity,
        expiryDate: formData.expiryDate,
        notes: sanitizeInput(formData.notes)
      };

      if (editingId) {
        // Update existing item
        const itemRef = doc(db, 'inventory', editingId);
        await updateDoc(itemRef, sanitizedData);
      } else {
        // Create new item
        const itemData = {
          ...sanitizedData,
          createdAt: Timestamp.now()
        };
        await addDoc(collection(db, 'inventory'), itemData);
      }

      await loadInventory();
      showAddForm = false;
      resetForm();
    } catch (error) {
      console.error('Error saving item:', error);
    } finally {
      saving = false;
    }
  }

  function editItem(item: InventoryItem) {
    formData = {
      itemName: item.itemName,
      quantity: item.quantity,
      expiryDate: item.expiryDate,
      notes: item.notes || ''
    };
    editingId = item.id;
    showAddForm = true;
  }

  function confirmDelete(id: string) {
    deleteItemId = id;
    showDeleteConfirm = true;
  }

  async function deleteItem() {
    if (!db || !deleteItemId) return;

    try {
      await deleteDoc(doc(db, 'inventory', deleteItemId));
      await loadInventory();
      showDeleteConfirm = false;
      deleteItemId = '';
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  }

  function showAddItemForm() {
    resetForm();
    showAddForm = true;
  }

  function cancelForm() {
    showAddForm = false;
    resetForm();
  }

  function getItemStatus(item: InventoryItem): { type: string; text: string; color: string; icon: string } {
    if (isExpired(item.expiryDate)) {
      return { type: 'expired', text: 'Expired', color: 'bg-red-100 text-red-800 border-red-200', icon: '🚫' };
    }
    if (isNearExpiry(item.expiryDate)) {
      return { type: 'expiring', text: 'Expiring Soon', color: 'bg-warning-100 text-warning-800 border-warning-200', icon: '⚠️' };
    }
    if (isLowStock(item.quantity)) {
      return { type: 'low-stock', text: 'Low Stock', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📦' };
    }
    return { type: 'good', text: 'Good', color: 'bg-green-100 text-green-800 border-green-200', icon: '✅' };
  }

  function getAlertCount(type: string): number {
    return items.filter(item => {
      switch (type) {
        case 'low-stock': return isLowStock(item.quantity);
        case 'expiring': return isNearExpiry(item.expiryDate) && !isExpired(item.expiryDate);
        case 'expired': return isExpired(item.expiryDate);
        case 'good': return !isLowStock(item.quantity) && !isNearExpiry(item.expiryDate) && !isExpired(item.expiryDate);
        default: return false;
      }
    }).length;
  }

  function getDaysUntilExpiry(expiryDate: string): number {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  function clearFilters() {
    filterType = 'all';
    searchTerm = '';
  }

  function selectCommonItem(itemName: string) {
    formData.itemName = itemName;
  }
</script>

<svelte:head>
  <title>Inventory Management - Aurora Dentica Admin</title>
</svelte:head>

<!-- Enhanced Page Header -->
<div class="mb-8">
  <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
    <div>
      <div class="flex items-center gap-3 mb-4">
        <div class="p-3 bg-gradient-to-br from-accent-500 to-primary-500 rounded-2xl shadow-lg">
          <span class="text-2xl text-white">📦</span>
        </div>
        <div>
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900">Inventory Management</h1>
          <p class="text-gray-600 text-lg">Track dental supplies and equipment efficiently</p>
        </div>
      </div>
    </div>
    <div class="flex flex-col sm:flex-row gap-3">
      <button
        on:click={showAddItemForm}
        class="btn-primary btn-lg dental-glow group"
      >
        <span class="text-xl group-hover:scale-110 transition-transform duration-300">➕</span>
        <span>Add New Item</span>
      </button>
    </div>
  </div>

  <!-- Enhanced Alert Summary Cards -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
    <div class="card p-6 border-l-4 border-error-500 hover:shadow-lg transition-all duration-300 dental-glow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-error-700 uppercase tracking-wide">Expired</p>
          <p class="text-3xl font-bold text-error-900">{getAlertCount('expired')}</p>
          <p class="text-xs text-gray-500 mt-1">Items past expiry</p>
        </div>
        <div class="text-error-600 text-3xl opacity-80">🚫</div>
      </div>
    </div>

    <div class="card p-6 border-l-4 border-warning-500 hover:shadow-lg transition-all duration-300 dental-glow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-warning-700 uppercase tracking-wide">Expiring</p>
          <p class="text-3xl font-bold text-warning-900">{getAlertCount('expiring')}</p>
          <p class="text-xs text-gray-500 mt-1">Within 30 days</p>
        </div>
        <div class="text-warning-600 text-3xl opacity-80">⚠️</div>
      </div>
    </div>

    <div class="card p-6 border-l-4 border-blue-500 hover:shadow-lg transition-all duration-300 dental-glow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-blue-700 uppercase tracking-wide">Low Stock</p>
          <p class="text-3xl font-bold text-blue-900">{getAlertCount('low-stock')}</p>
          <p class="text-xs text-gray-500 mt-1">Need restocking</p>
        </div>
        <div class="text-blue-600 text-3xl opacity-80">📦</div>
      </div>
    </div>

    <div class="card p-6 border-l-4 border-success-500 hover:shadow-lg transition-all duration-300 dental-glow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-success-700 uppercase tracking-wide">Good</p>
          <p class="text-3xl font-bold text-success-900">{getAlertCount('good')}</p>
          <p class="text-xs text-gray-500 mt-1">Well stocked</p>
        </div>
        <div class="text-success-600 text-3xl opacity-80">✅</div>
      </div>
    </div>
  </div>
</div>

<!-- Enhanced Filters -->
<div class="card p-6 lg:p-8 mb-8 dental-glow">
  <div class="flex flex-col space-y-6">
    <!-- Quick Filter Buttons -->
    <div class="flex flex-wrap gap-3">
      <button 
        on:click={() => filterType = 'all'}
        class="{filterType === 'all' ? 'btn-primary' : 'btn-ghost'} btn-sm transition-all duration-300"
      >
        <span class="mr-2">📊</span>
        <span>All Items ({items.length})</span>
      </button>
      <button 
        on:click={() => filterType = 'expired'}
        class="{filterType === 'expired' ? 'btn-danger' : 'btn-ghost'} btn-sm transition-all duration-300"
      >
        <span class="mr-2">🚫</span>
        <span>Expired ({getAlertCount('expired')})</span>
      </button>
      <button 
        on:click={() => filterType = 'expiring'}
        class="{filterType === 'expiring' ? 'btn-warning' : 'btn-ghost'} btn-sm transition-all duration-300"
      >
        <span class="mr-2">⚠️</span>
        <span>Expiring ({getAlertCount('expiring')})</span>
      </button>
      <button 
        on:click={() => filterType = 'low-stock'}
        class="{filterType === 'low-stock' ? 'btn-secondary' : 'btn-ghost'} btn-sm transition-all duration-300"
      >
        <span class="mr-2">📦</span>
        <span>Low Stock ({getAlertCount('low-stock')})</span>
      </button>
      <button 
        on:click={() => filterType = 'good'}
        class="{filterType === 'good' ? 'btn-success' : 'btn-ghost'} btn-sm transition-all duration-300"
      >
        <span class="mr-2">✅</span>
        <span>Good ({getAlertCount('good')})</span>
      </button>
    </div>

    <!-- Search Filter -->
    <div>
      <label for="search" class="block text-sm font-semibold text-gray-700 mb-2">
        Search Inventory
      </label>
      <div class="relative">
        <input
          id="search"
          type="text"
          placeholder="Search by item name or notes..."
          bind:value={searchTerm}
          class="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
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
        <span>Showing <strong>{filteredItems.length}</strong> of <strong>{items.length}</strong> items</span>
      </p>
      {#if searchTerm || filterType !== 'all'}
        <button
          on:click={clearFilters}
          class="btn-ghost btn-sm text-gray-500 hover:text-gray-700"
        >
          <span class="mr-2">✖️</span>
          <span>Clear Filters</span>
        </button>
      {/if}
    </div>
  </div>
</div>

<!-- Enhanced Add/Edit Form Modal -->
{#if showAddForm}
  <div class="modal-overlay">
    <div class="modal-content max-w-4xl">
      <div class="modal-header">
        <div class="flex items-center justify-between">
          <div class="flex items-center gap-3">
            <div class="p-2 bg-gradient-to-br from-accent-500 to-primary-500 rounded-xl">
              <span class="text-xl text-white">{editingId ? '✏️' : '➕'}</span>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Inventory Item' : 'Add New Item'}
              </h2>
              <p class="text-gray-500 text-sm">
                {editingId ? 'Update item details and stock levels' : 'Add a new item to your inventory'}
              </p>
            </div>
          </div>
          <button
            on:click={cancelForm}
            class="btn-ghost p-3 rounded-xl hover:bg-gray-100"
            disabled={saving}
            aria-label="Close form"
          >
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <div class="modal-body">
        <form on:submit|preventDefault={saveItem} class="space-y-8">
          
          <!-- Item Selection Section -->
          <div class="bg-primary-50 rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span class="text-xl">🏷️</span>
              <span>Item Information</span>
            </h3>
            
            {#if !editingId}
              <!-- Common Items Quick Select -->
              <div class="mb-6">
                <p class="text-sm font-semibold text-gray-700 mb-3">Quick Select Common Items:</p>
                <div class="grid grid-cols-2 lg:grid-cols-3 gap-2">
                  {#each categories as category}
                    <div class="mb-3">
                      <p class="text-xs font-semibold text-gray-500 uppercase tracking-wide mb-1">{category}</p>
                      <div class="space-y-1">
                        {#each commonItems.filter(item => item.category === category).slice(0, 3) as item}
                          <button
                            type="button"
                            on:click={() => selectCommonItem(item.name)}
                            class="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-primary-300 hover:bg-primary-50 transition-all duration-200 {formData.itemName === item.name ? 'border-primary-500 bg-primary-100' : ''}"
                          >
                            {item.name}
                          </button>
                        {/each}
                      </div>
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Item Name Input -->
            <div>
              <label for="item-name" class="block text-sm font-semibold text-gray-700 mb-2">
                Item Name *
              </label>
              <input
                id="item-name"
                type="text"
                bind:value={formData.itemName}
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 {formErrors.itemName ? 'form-error' : ''}"
                placeholder="Enter item name or select from common items above"
                required
              />
              {#if formErrors.itemName}
                <p class="error-message mt-2">
                  <span>⚠️</span>
                  <span>{formErrors.itemName}</span>
                </p>
              {/if}
            </div>
          </div>

          <!-- Stock Information Section -->
          <div class="bg-accent-50 rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span class="text-xl">📊</span>
              <span>Stock Information</span>
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
              <!-- Quantity -->
              <div>
                <label for="quantity" class="block text-sm font-semibold text-gray-700 mb-2">
                  Current Quantity *
                </label>
                <div class="relative">
                  <input
                    id="quantity"
                    type="number"
                    min="0"
                    max="99999"
                    bind:value={formData.quantity}
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 {formErrors.quantity ? 'form-error' : ''}"
                    placeholder="0"
                    required
                  />
                  <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                    <span class="text-gray-400 text-sm">units</span>
                  </div>
                </div>
                {#if formErrors.quantity}
                  <p class="error-message mt-2">
                    <span>⚠️</span>
                    <span>{formErrors.quantity}</span>
                  </p>
                {/if}
                
                <!-- Stock Level Indicator -->
                {#if formData.quantity >= 0}
                  <div class="mt-2 flex items-center gap-2 text-sm">
                    {#if formData.quantity === 0}
                      <span class="flex items-center gap-1 text-error-600">
                        <span>🚫</span>
                        <span>Out of Stock</span>
                      </span>
                    {:else if isLowStock(formData.quantity)}
                      <span class="flex items-center gap-1 text-warning-600">
                        <span>⚠️</span>
                        <span>Low Stock</span>
                      </span>
                    {:else}
                      <span class="flex items-center gap-1 text-success-600">
                        <span>✅</span>
                        <span>Good Stock Level</span>
                      </span>
                    {/if}
                  </div>
                {/if}
              </div>

              <!-- Expiry Date -->
              <div>
                <label for="expiry-date" class="block text-sm font-semibold text-gray-700 mb-2">
                  Expiry Date *
                </label>
                <input
                  id="expiry-date"
                  type="date"
                  bind:value={formData.expiryDate}
                  min={new Date().toISOString().split('T')[0]}
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 {formErrors.expiryDate ? 'form-error' : ''}"
                  required
                />
                {#if formErrors.expiryDate}
                  <p class="error-message mt-2">
                    <span>⚠️</span>
                    <span>{formErrors.expiryDate}</span>
                  </p>
                {/if}
                
                <!-- Expiry Status Indicator -->
                {#if formData.expiryDate}
                  {@const daysUntilExpiry = getDaysUntilExpiry(formData.expiryDate)}
                  <div class="mt-2 flex items-center gap-2 text-sm">
                    {#if daysUntilExpiry < 0}
                      <span class="flex items-center gap-1 text-error-600">
                        <span>🚫</span>
                        <span>Expired {Math.abs(daysUntilExpiry)} days ago</span>
                      </span>
                    {:else if daysUntilExpiry <= 30}
                      <span class="flex items-center gap-1 text-warning-600">
                        <span>⚠️</span>
                        <span>Expires in {daysUntilExpiry} days</span>
                      </span>
                    {:else}
                      <span class="flex items-center gap-1 text-success-600">
                        <span>✅</span>
                        <span>Expires in {daysUntilExpiry} days</span>
                      </span>
                    {/if}
                  </div>
                {/if}
              </div>
            </div>
          </div>

          <!-- Notes Section -->
          <div class="bg-warning-50 rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span class="text-xl">📝</span>
              <span>Additional Information</span>
            </h3>
            <div>
              <label for="notes" class="block text-sm font-semibold text-gray-700 mb-2">
                Notes & Comments (Optional)
              </label>
              <textarea
                id="notes"
                bind:value={formData.notes}
                rows="4"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-all duration-300"
                placeholder="Storage instructions, supplier information, special handling requirements..."
              ></textarea>
            </div>
          </div>

          <!-- Preview Section -->
          {#if formData.itemName && formData.quantity >= 0 && formData.expiryDate}
            <div class="bg-gradient-to-r from-gray-50 to-primary-50 rounded-2xl p-6 border-2 border-dashed border-primary-200">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span class="text-xl">👁️</span>
                <span>Item Preview</span>
              </h3>
              <div class="bg-white rounded-xl p-4 border border-primary-200">
                <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <p class="text-sm text-gray-500">Item Name</p>
                    <p class="font-semibold text-gray-900">{formData.itemName}</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Quantity</p>
                    <p class="font-semibold text-gray-900">{formData.quantity} units</p>
                  </div>
                  <div>
                    <p class="text-sm text-gray-500">Expires</p>
                    <p class="font-semibold text-gray-900">{formatDisplayDate(formData.expiryDate)}</p>
                  </div>
                </div>
                {#if formData.notes}
                  <div class="mt-4 pt-4 border-t border-gray-200">
                    <p class="text-sm text-gray-500">Notes</p>
                    <p class="text-gray-700 text-sm">{formData.notes}</p>
                  </div>
                {/if}
              </div>
            </div>
          {/if}

        </form>
      </div>

      <!-- Enhanced Form Actions -->
      <div class="modal-footer">
        <div class="flex flex-col sm:flex-row justify-end gap-3">
          <button
            type="button"
            on:click={cancelForm}
            class="btn-secondary order-2 sm:order-1"
            disabled={saving}
          >
            <span>✖️</span>
            <span>Cancel</span>
          </button>
          <button
            type="submit"
            on:click={saveItem}
            disabled={saving || !formData.itemName || formData.quantity < 0 || !formData.expiryDate}
            class="btn-primary order-1 sm:order-2 dental-glow"
          >
            {#if saving}
              <div class="loading-spinner"></div>
              <span>Saving...</span>
            {:else}
              <span>{editingId ? '💾' : '➕'}</span>
              <span>{editingId ? 'Update' : 'Add'} Item</span>
            {/if}
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Enhanced Delete Confirmation Modal -->
{#if showDeleteConfirm}
  <div class="modal-overlay">
    <div class="modal-content max-w-md">
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-error-500 rounded-xl">
            <span class="text-xl text-white">🗑️</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Delete Item</h2>
            <p class="text-gray-500 text-sm">This action cannot be undone</p>
          </div>
        </div>
      </div>
      <div class="modal-body">
        <div class="text-center">
          <div class="text-6xl mb-4">⚠️</div>
          <p class="text-gray-600 mb-6">
            Are you sure you want to delete this inventory item? This action is permanent and cannot be reversed.
          </p>
        </div>
      </div>
      <div class="modal-footer">
        <div class="flex flex-col sm:flex-row justify-end gap-3">
          <button
            on:click={() => { showDeleteConfirm = false; deleteItemId = ''; }}
            class="btn-secondary order-2 sm:order-1"
          >
            <span>✖️</span>
            <span>Cancel</span>
          </button>
          <button
            on:click={deleteItem}
            class="btn-danger order-1 sm:order-2"
          >
            <span>🗑️</span>
            <span>Delete Item</span>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Enhanced Inventory List -->
{#if loading}
  <div class="flex justify-center items-center py-20">
    <div class="text-center">
      <div class="relative mb-6">
        <div class="loading-spinner h-16 w-16 text-primary-600 mx-auto"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-2xl">📦</span>
        </div>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">Loading Inventory</h3>
      <p class="text-gray-600">Please wait while we fetch your inventory data...</p>
    </div>
  </div>
{:else if filteredItems.length > 0}
  <!-- Desktop Table -->
  <div class="hidden md:block card overflow-hidden dental-glow">
    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th>Item & Notes</th>
            <th class="w-24">Quantity</th>
            <th class="w-32">Expiry Date</th>
            <th class="w-32">Status</th>
            <th class="w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredItems as item}
            {@const status = getItemStatus(item)}
            {@const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate)}
            <tr class="hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-300">
              <td>
                <div>
                  <p class="font-semibold text-gray-900 text-lg flex items-center gap-2">
                    <span class="text-lg">📦</span>
                    <span>{item.itemName}</span>
                  </p>
                  {#if item.notes}
                    <p class="text-sm text-gray-600 mt-1 bg-gray-50 rounded-lg p-2 italic">
                      💬 {item.notes}
                    </p>
                  {/if}
                </div>
              </td>
              <td>
                <div class="text-center">
                  <span class="font-bold text-2xl text-gray-900">{item.quantity}</span>
                  <p class="text-xs text-gray-500">units</p>
                  {#if isLowStock(item.quantity)}
                    <p class="text-xs text-blue-600 font-medium">⚠️ Low</p>
                  {/if}
                </div>
              </td>
              <td>
                <div>
                  <p class="font-medium text-gray-900">{formatDisplayDate(item.expiryDate)}</p>
                  {#if daysUntilExpiry < 0}
                    <p class="text-xs text-error-600 font-medium">🚫 Expired</p>
                  {:else if daysUntilExpiry <= 30}
                    <p class="text-xs text-warning-600 font-medium">⚠️ {daysUntilExpiry} days</p>
                  {:else}
                    <p class="text-xs text-success-600 font-medium">✅ {daysUntilExpiry} days</p>
                  {/if}
                </div>
              </td>
              <td>
                <span class="inline-flex items-center px-3 py-2 rounded-xl text-xs font-bold border {status.color}">
                  <span class="mr-2">{status.icon}</span>
                  <span>{status.text}</span>
                </span>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <button
                    on:click={() => editItem(item)}
                    class="btn-ghost btn-sm hover:bg-primary-100 hover:text-primary-700 transition-all duration-300"
                    title="Edit item"
                  >
                    <span class="text-lg">✏️</span>
                  </button>
                  <button
                    on:click={() => confirmDelete(item.id)}
                    class="btn-ghost btn-sm text-error-600 hover:text-error-700 hover:bg-error-100 transition-all duration-300"
                    title="Delete item"
                  >
                    <span class="text-lg">🗑️</span>
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>
  </div>

  <!-- Mobile Cards -->
  <div class="md:hidden space-y-4">
    {#each filteredItems as item}
      {@const status = getItemStatus(item)}
      {@const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate)}
      <div class="card p-6 dental-glow hover:shadow-xl transition-all duration-300">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <span class="text-xl">📦</span>
              <h3 class="font-bold text-gray-900 text-lg">{item.itemName}</h3>
            </div>
            <div class="flex items-center gap-2">
              <span class="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold border {status.color}">
                <span class="mr-1">{status.icon}</span>
                <span>{status.text}</span>
              </span>
            </div>
          </div>
          <div class="flex items-center gap-2 ml-4">
            <button
              on:click={() => editItem(item)}
              class="btn-ghost btn-sm p-3 hover:bg-primary-100 hover:text-primary-700 transition-all duration-300"
            >
              <span class="text-lg">✏️</span>
            </button>
            <button
              on:click={() => confirmDelete(item.id)}
              class="btn-ghost btn-sm p-3 text-error-600 hover:text-error-700 hover:bg-error-100 transition-all duration-300"
            >
              <span class="text-lg">🗑️</span>
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="bg-primary-50 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Quantity</p>
            <p class="text-2xl font-bold text-gray-900">{item.quantity}</p>
            <p class="text-xs text-gray-500">units</p>
          </div>
          <div class="bg-accent-50 rounded-xl p-3 text-center">
            <p class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Expires</p>
            <p class="font-semibold text-gray-900">{formatDisplayDate(item.expiryDate)}</p>
            {#if daysUntilExpiry < 0}
              <p class="text-xs text-error-600 font-medium">🚫 Expired</p>
            {:else if daysUntilExpiry <= 30}
              <p class="text-xs text-warning-600 font-medium">⚠️ {daysUntilExpiry} days</p>
            {:else}
              <p class="text-xs text-success-600 font-medium">✅ {daysUntilExpiry} days</p>
            {/if}
          </div>
        </div>

        {#if item.notes}
          <div class="mt-4 pt-4 border-t border-gray-200">
            <p class="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Notes</p>
            <div class="bg-gray-50 rounded-xl p-3">
              <p class="text-sm text-gray-700 italic flex items-start gap-2">
                <span class="text-lg flex-shrink-0">💬</span>
                <span>{item.notes}</span>
              </p>
            </div>
          </div>
        {/if}
      </div>
    {/each}
  </div>
{:else}
  <!-- Enhanced Empty State -->
  <div class="card p-12 sm:p-16 text-center dental-glow">
    <div class="text-gray-400 text-6xl sm:text-7xl mb-6 animate-pulse-subtle">📦</div>
    <h3 class="text-2xl font-bold text-gray-900 mb-4">
      {searchTerm || filterType !== 'all' ? 'No items found' : 'No inventory items'}
    </h3>
    <p class="text-gray-500 mb-8 max-w-md mx-auto text-lg leading-relaxed">
      {searchTerm || filterType !== 'all' 
        ? 'Try adjusting your filters or search terms to find what you\'re looking for.' 
        : 'Get started by adding your first inventory item. Keep track of supplies, stock levels, and expiry dates efficiently.'}
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        on:click={showAddItemForm}
        class="btn-primary btn-lg dental-glow"
      >
        <span class="text-xl">➕</span>
        <span>Add First Item</span>
      </button>
      {#if searchTerm || filterType !== 'all'}
        <button
          on:click={clearFilters}
          class="btn-secondary btn-lg"
        >
          <span>✖️</span>
          <span>Clear All Filters</span>
        </button>
      {/if}
    </div>
  </div>
{/if}

<!-- Inventory Management Tips -->
<div class="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
  
  <!-- Best Practices -->
  <div class="card p-6 dental-glow">
    <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <span class="text-xl">💡</span>
      <span>Inventory Best Practices</span>
    </h3>
    <ul class="space-y-3 text-sm text-gray-600">
      <li class="flex items-start gap-2">
        <span class="text-success-500 font-bold flex-shrink-0">✓</span>
        <span>Check expiry dates weekly and prioritize items expiring soon</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-success-500 font-bold flex-shrink-0">✓</span>
        <span>Maintain minimum stock levels to avoid running out of essentials</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-success-500 font-bold flex-shrink-0">✓</span>
        <span>Store items according to manufacturer recommendations</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-success-500 font-bold flex-shrink-0">✓</span>
        <span>Use FIFO (First In, First Out) principle for stock rotation</span>
      </li>
      <li class="flex items-start gap-2">
        <span class="text-success-500 font-bold flex-shrink-0">✓</span>
        <span>Regular inventory audits help maintain accurate records</span>
      </li>
    </ul>
  </div>

  <!-- Quick Stats -->
  <div class="card p-6 dental-glow">
    <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <span class="text-xl">📊</span>
      <span>Inventory Overview</span>
    </h3>
    <div class="space-y-4">
      <div class="flex items-center justify-between p-3 bg-success-50 rounded-lg">
        <div>
          <p class="text-sm font-medium text-success-700">Well Stocked Items</p>
          <p class="text-lg font-bold text-success-900">{getAlertCount('good')}</p>
        </div>
        <div class="text-success-600 text-2xl">✅</div>
      </div>

      <div class="flex items-center justify-between p-3 bg-warning-50 rounded-lg">
        <div>
          <p class="text-sm font-medium text-warning-700">Items Needing Attention</p>
          <p class="text-lg font-bold text-warning-900">{getAlertCount('low-stock') + getAlertCount('expiring') + getAlertCount('expired')}</p>
        </div>
        <div class="text-warning-600 text-2xl">⚠️</div>
      </div>

      <div class="flex items-center justify-between p-3 bg-primary-50 rounded-lg">
        <div>
          <p class="text-sm font-medium text-primary-700">Total Items Tracked</p>
          <p class="text-lg font-bold text-primary-900">{items.length}</p>
        </div>
        <div class="text-primary-600 text-2xl">📦</div>
      </div>
    </div>
  </div>
</div>