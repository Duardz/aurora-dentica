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
  let showMobileFilters = false;

  // Form data
  let formData: InventoryForm = {
    itemName: '',
    quantity: 0,
    expiryDate: '',
    notes: ''
  };

  let formErrors: { itemName?: string; quantity?: string; expiryDate?: string; notes?: string } = {};
  let saving = false;

  // Reactive stats - Fixed to properly update
  $: expiredCount = items.filter(item => isExpired(item.expiryDate)).length;
  $: expiringCount = items.filter(item => isNearExpiry(item.expiryDate) && !isExpired(item.expiryDate)).length;
  $: lowStockCount = items.filter(item => isLowStock(item.quantity)).length;
  $: goodCount = items.filter(item => !isLowStock(item.quantity) && !isNearExpiry(item.expiryDate) && !isExpired(item.expiryDate)).length;

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

      console.log('📦 Loaded inventory items:', items.length);
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
    showMobileFilters = false;
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
    showMobileFilters = false;
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
      return { type: 'expiring', text: 'Expiring Soon', color: 'bg-orange-100 text-orange-800 border-orange-200', icon: '⚠️' };
    }
    if (isLowStock(item.quantity)) {
      return { type: 'low-stock', text: 'Low Stock', color: 'bg-blue-100 text-blue-800 border-blue-200', icon: '📦' };
    }
    return { type: 'good', text: 'Good', color: 'bg-green-100 text-green-800 border-green-200', icon: '✅' };
  }

  function getDaysUntilExpiry(expiryDate: string): number {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return Math.ceil((expiry.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  }

  function clearFilters() {
    filterType = 'all';
    searchTerm = '';
    showMobileFilters = false;
  }

  function selectCommonItem(itemName: string) {
    formData.itemName = itemName;
  }

  function toggleMobileFilters() {
    showMobileFilters = !showMobileFilters;
  }

  // Close mobile filters when clicking outside
  function handleClickOutside(event: MouseEvent) {
    const target = event.target as Element;
    if (!target.closest('.mobile-filters') && !target.closest('.filter-toggle-btn')) {
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
  <title>Inventory Management - Aurora Dentica Admin</title>
</svelte:head>

<div class="space-y-4 md:space-y-6">

  <!-- Enhanced Page Header -->
  <div class="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-700 rounded-xl md:rounded-2xl shadow-lg text-white overflow-hidden relative">
    <!-- Background Pattern -->
    <div class="absolute inset-0 opacity-10">
      <div class="absolute top-4 right-4 w-16 h-16 md:w-24 md:h-24 bg-white rounded-full"></div>
      <div class="absolute bottom-4 left-4 w-12 h-12 md:w-16 md:h-16 bg-white rounded-full"></div>
    </div>
    
    <div class="relative p-4 md:p-6 lg:p-8">
      <div class="flex flex-col space-y-4 md:space-y-0 md:flex-row md:items-center md:justify-between">
        
        <!-- Header Content -->
        <div class="flex-1">
          <div class="flex items-center gap-3 mb-3">
            <div class="w-10 h-10 md:w-12 md:h-12 bg-white/20 backdrop-blur-sm rounded-xl flex items-center justify-center">
              <span class="text-xl md:text-2xl">📦</span>
            </div>
            <div>
              <h1 class="text-xl md:text-2xl lg:text-3xl font-bold">Inventory Management</h1>
              <p class="text-blue-100 text-sm md:text-base">Track dental supplies efficiently</p>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <div class="flex-shrink-0">
          <button
            on:click={showAddItemForm}
            class="w-full md:w-auto bg-white text-blue-600 hover:bg-blue-50 px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <span class="text-lg">➕</span>
            <span>Add Item</span>
          </button>
        </div>
      </div>

      <!-- Enhanced Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mt-4 md:mt-6">
        <div class="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-white/20">
          <div class="text-lg md:text-2xl font-bold">{expiredCount}</div>
          <div class="text-xs md:text-sm text-blue-100 font-medium">Expired</div>
          <div class="text-red-300 text-lg md:text-xl mt-1">🚫</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-white/20">
          <div class="text-lg md:text-2xl font-bold">{expiringCount}</div>
          <div class="text-xs md:text-sm text-blue-100 font-medium">Expiring</div>
          <div class="text-orange-300 text-lg md:text-xl mt-1">⚠️</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-white/20">
          <div class="text-lg md:text-2xl font-bold">{lowStockCount}</div>
          <div class="text-xs md:text-sm text-blue-100 font-medium">Low Stock</div>
          <div class="text-blue-300 text-lg md:text-xl mt-1">📦</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-white/20">
          <div class="text-lg md:text-2xl font-bold">{goodCount}</div>
          <div class="text-xs md:text-sm text-blue-100 font-medium">Good</div>
          <div class="text-green-300 text-lg md:text-xl mt-1">✅</div>
        </div>
      </div>
    </div>
  </div>

  <!-- Enhanced Filters Section -->
  <div class="bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100">
    
    <!-- Desktop Filters -->
    <div class="hidden lg:block p-6">
      <div class="space-y-6">
        <!-- Quick Filter Buttons -->
        <div class="flex flex-wrap gap-2">
          <button 
            on:click={() => filterType = 'all'}
            class="{filterType === 'all' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <span>📊</span>
            <span>All ({items.length})</span>
          </button>
          <button 
            on:click={() => filterType = 'expired'}
            class="{filterType === 'expired' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <span>🚫</span>
            <span>Expired ({expiredCount})</span>
          </button>
          <button 
            on:click={() => filterType = 'expiring'}
            class="{filterType === 'expiring' ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <span>⚠️</span>
            <span>Expiring ({expiringCount})</span>
          </button>
          <button 
            on:click={() => filterType = 'low-stock'}
            class="{filterType === 'low-stock' ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <span>📦</span>
            <span>Low Stock ({lowStockCount})</span>
          </button>
          <button 
            on:click={() => filterType = 'good'}
            class="{filterType === 'good' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <span>✅</span>
            <span>Good ({goodCount})</span>
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
            <span>Showing <strong>{filteredItems.length}</strong> of <strong>{items.length}</strong> items</span>
          </p>
          {#if searchTerm || filterType !== 'all'}
            <button
              on:click={clearFilters}
              class="text-gray-500 hover:text-gray-700 text-sm font-medium flex items-center gap-2 transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-100"
            >
              <span>✖️</span>
              <span>Clear</span>
            </button>
          {/if}
        </div>
      </div>
    </div>

    <!-- Mobile Filters -->
    <div class="lg:hidden">
      <!-- Mobile Filter Header -->
      <div class="p-4 border-b border-gray-200 flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-lg">📋</span>
          <span class="text-sm text-gray-600">
            <strong>{filteredItems.length}</strong> of <strong>{items.length}</strong> items
          </span>
        </div>
        <button
          on:click={toggleMobileFilters}
          class="filter-toggle-btn bg-blue-600 text-white px-3 py-2 rounded-lg font-medium flex items-center gap-2 text-sm"
        >
          <span>🔍</span>
          <span>Filters</span>
        </button>
      </div>

      <!-- Mobile Filter Panel -->
      {#if showMobileFilters}
        <div class="mobile-filters p-4 bg-gray-50 border-b border-gray-200 space-y-4">
          
          <!-- Mobile Search -->
          <div>
            <div class="relative">
              <input
                type="text"
                placeholder="Search items..."
                bind:value={searchTerm}
                class="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-400">🔍</span>
              </div>
            </div>
          </div>

          <!-- Mobile Filter Buttons -->
          <div class="grid grid-cols-2 gap-2">
            <button 
              on:click={() => { filterType = 'all'; }}
              class="{filterType === 'all' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'} px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
            >
              <span>📊</span>
              <span>All</span>
            </button>
            <button 
              on:click={() => { filterType = 'expired'; }}
              class="{filterType === 'expired' ? 'bg-red-600 text-white' : 'bg-white text-gray-700 border border-gray-200'} px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
            >
              <span>🚫</span>
              <span>Expired</span>
            </button>
            <button 
              on:click={() => { filterType = 'expiring'; }}
              class="{filterType === 'expiring' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 border border-gray-200'} px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
            >
              <span>⚠️</span>
              <span>Expiring</span>
            </button>
            <button 
              on:click={() => { filterType = 'low-stock'; }}
              class="{filterType === 'low-stock' ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'} px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
            >
              <span>📦</span>
              <span>Low Stock</span>
            </button>
          </div>

          <!-- Clear Filters Button -->
          {#if searchTerm || filterType !== 'all'}
            <button
              on:click={clearFilters}
              class="w-full bg-gray-200 text-gray-700 px-4 py-2.5 rounded-lg font-medium flex items-center justify-center gap-2"
            >
              <span>✖️</span>
              <span>Clear Filters</span>
            </button>
          {/if}
        </div>
      {/if}
    </div>
  </div>

  <!-- Enhanced Add/Edit Form Modal -->
  {#if showAddForm}
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl md:rounded-2xl shadow-xl w-full max-w-2xl md:max-w-4xl max-h-[90vh] overflow-y-auto">
        
        <!-- Modal Header -->
        <div class="sticky top-0 bg-white px-4 md:px-6 py-4 border-b border-gray-200 rounded-t-xl md:rounded-t-2xl">
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-3">
              <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-blue-500 to-purple-500 rounded-xl flex items-center justify-center">
                <span class="text-white text-lg md:text-xl">{editingId ? '✏️' : '➕'}</span>
              </div>
              <div>
                <h2 class="text-lg md:text-xl font-bold text-gray-900">
                  {editingId ? 'Edit Item' : 'Add New Item'}
                </h2>
                <p class="text-gray-500 text-sm">
                  {editingId ? 'Update item details' : 'Add item to inventory'}
                </p>
              </div>
            </div>
            <button
              on:click={cancelForm}
              class="p-2 hover:bg-gray-100 rounded-lg transition-colors" 
              disabled={saving}
              aria-label="Close form"
            >
              <svg class="w-5 h-5 md:w-6 md:h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        </div>

        <!-- Modal Body -->
        <div class="p-4 md:p-6">
          <form on:submit|preventDefault={saveItem} class="space-y-6">
            
            <!-- Quick Select (Mobile Optimized) -->
            {#if !editingId}
              <div class="bg-blue-50 rounded-xl p-4 md:p-6">
                <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                  <span class="text-lg md:text-xl">⚡</span>
                  <span>Quick Select</span>
                </h3>
                <div class="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
                  {#each categories.slice(0, 3) as category}
                    <div class="space-y-1">
                      <p class="text-xs font-semibold text-gray-500 uppercase">{category}</p>
                      {#each commonItems.filter(item => item.category === category).slice(0, 2) as item}
                        <button
                          type="button"
                          on:click={() => selectCommonItem(item.name)}
                          class="w-full text-left px-3 py-2 text-sm border border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 {formData.itemName === item.name ? 'border-blue-500 bg-blue-100' : ''}"
                        >
                          {item.name}
                        </button>
                      {/each}
                    </div>
                  {/each}
                </div>
              </div>
            {/if}

            <!-- Item Information -->
            <div class="bg-gray-50 rounded-xl p-4 md:p-6">
              <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span class="text-lg md:text-xl">🏷️</span>
                <span>Item Details</span>
              </h3>
              
              <!-- Item Name -->
              <div class="mb-4">
                <label for="item-name" class="block text-sm font-semibold text-gray-700 mb-2">
                  Item Name *
                </label>
                <input
                  id="item-name"
                  type="text"
                  bind:value={formData.itemName}
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 {formErrors.itemName ? 'border-red-500' : ''}"
                  placeholder="Enter item name"
                  required
                />
                {#if formErrors.itemName}
                  <p class="text-red-600 text-sm mt-2 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{formErrors.itemName}</span>
                  </p>
                {/if}
              </div>

              <!-- Quantity and Expiry Grid -->
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                <!-- Quantity -->
                <div>
                  <label for="quantity" class="block text-sm font-semibold text-gray-700 mb-2">
                    Quantity *
                  </label>
                  <div class="relative">
                    <input
                      id="quantity"
                      type="number"
                      min="0"
                      max="99999"
                      bind:value={formData.quantity}
                      class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 {formErrors.quantity ? 'border-red-500' : ''}"
                      placeholder="0"
                      required
                    />
                    <div class="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                      <span class="text-gray-400 text-sm">units</span>
                    </div>
                  </div>
                  {#if formErrors.quantity}
                    <p class="text-red-600 text-sm mt-2 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{formErrors.quantity}</span>
                    </p>
                  {/if}
                  
                  <!-- Stock Level Indicator -->
                  {#if formData.quantity >= 0}
                    <div class="mt-2 flex items-center gap-2 text-sm">
                      {#if formData.quantity === 0}
                        <span class="flex items-center gap-1 text-red-600">
                          <span>🚫</span>
                          <span>Out of Stock</span>
                        </span>
                      {:else if isLowStock(formData.quantity)}
                        <span class="flex items-center gap-1 text-orange-600">
                          <span>⚠️</span>
                          <span>Low Stock</span>
                        </span>
                      {:else}
                        <span class="flex items-center gap-1 text-green-600">
                          <span>✅</span>
                          <span>Good Level</span>
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
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 {formErrors.expiryDate ? 'border-red-500' : ''}"
                    required
                  />
                  {#if formErrors.expiryDate}
                    <p class="text-red-600 text-sm mt-2 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{formErrors.expiryDate}</span>
                    </p>
                  {/if}
                  
                  <!-- Expiry Status Indicator -->
                  {#if formData.expiryDate}
                    {@const daysUntilExpiry = getDaysUntilExpiry(formData.expiryDate)}
                    <div class="mt-2 flex items-center gap-2 text-sm">
                      {#if daysUntilExpiry < 0}
                        <span class="flex items-center gap-1 text-red-600">
                          <span>🚫</span>
                          <span>Expired</span>
                        </span>
                      {:else if daysUntilExpiry <= 30}
                        <span class="flex items-center gap-1 text-orange-600">
                          <span>⚠️</span>
                          <span>{daysUntilExpiry} days left</span>
                        </span>
                      {:else}
                        <span class="flex items-center gap-1 text-green-600">
                          <span>✅</span>
                          <span>{daysUntilExpiry} days left</span>
                        </span>
                      {/if}
                    </div>
                  {/if}
                </div>
              </div>

              <!-- Notes -->
              <div class="mt-4">
                <label for="notes" class="block text-sm font-semibold text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  bind:value={formData.notes}
                  rows="3"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                  placeholder="Storage instructions, supplier info, etc..."
                ></textarea>
              </div>
            </div>

            <!-- Preview Section -->
            {#if formData.itemName && formData.quantity >= 0 && formData.expiryDate}
              <div class="bg-gradient-to-r from-blue-50 to-purple-50 rounded-xl p-4 md:p-6 border-2 border-dashed border-blue-200">
                <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span class="text-lg md:text-xl">👁️</span>
                  <span>Preview</span>
                </h3>
                <div class="bg-white rounded-xl p-4 border border-blue-200">
                  <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p class="text-sm text-gray-500">Item</p>
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

        <!-- Modal Footer -->
        <div class="sticky bottom-0 bg-white px-4 md:px-6 py-4 border-t border-gray-200 rounded-b-xl md:rounded-b-2xl">
          <div class="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              type="button"
              on:click={cancelForm}
              class="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all duration-200"
              disabled={saving}
            >
              <span class="mr-2">✖️</span>
              <span>Cancel</span>
            </button>
            <button
              type="submit"
              on:click={saveItem}
              disabled={saving || !formData.itemName || formData.quantity < 0 || !formData.expiryDate}
              class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              {#if saving}
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
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
    <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div class="bg-white rounded-xl md:rounded-2xl shadow-xl max-w-md w-full">
        <div class="p-6">
          <div class="flex items-center gap-3 mb-4">
            <div class="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center">
              <span class="text-white text-xl">🗑️</span>
            </div>
            <div>
              <h2 class="text-xl font-bold text-gray-900">Delete Item</h2>
              <p class="text-gray-500 text-sm">This action cannot be undone</p>
            </div>
          </div>
          <div class="text-center mb-6">
            <div class="text-6xl mb-4">⚠️</div>
            <p class="text-gray-600">
              Are you sure you want to delete this inventory item? This action is permanent.
            </p>
          </div>
          <div class="flex flex-col-reverse sm:flex-row justify-end gap-3">
            <button
              on:click={() => { showDeleteConfirm = false; deleteItemId = ''; }}
              class="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-3 rounded-xl font-semibold transition-all duration-200"
            >
              <span class="mr-2">✖️</span>
              <span>Cancel</span>
            </button>
            <button
              on:click={deleteItem}
              class="w-full sm:w-auto bg-red-600 hover:bg-red-700 text-white px-4 py-3 rounded-xl font-semibold transition-all duration-200"
            >
              <span class="mr-2">🗑️</span>
              <span>Delete</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Enhanced Inventory List -->
  {#if loading}
    <div class="flex justify-center items-center py-16 md:py-20">
      <div class="text-center">
        <div class="relative mb-6">
          <div class="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-xl md:text-2xl">📦</span>
          </div>
        </div>
        <h3 class="text-lg md:text-xl font-semibold text-gray-900 mb-2">Loading Inventory</h3>
        <p class="text-gray-600 text-sm md:text-base">Please wait while we fetch your data...</p>
      </div>
    </div>
  {:else if filteredItems.length > 0}
    <!-- Desktop Table -->
    <div class="hidden md:block bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Item</th>
              <th class="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Quantity</th>
              <th class="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Expiry</th>
              <th class="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th class="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            {#each filteredItems as item}
              {@const status = getItemStatus(item)}
              {@const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate)}
              <tr class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-4 md:px-6 py-4">
                  <div>
                    <p class="font-semibold text-gray-900 flex items-center gap-2">
                      <span class="text-lg">📦</span>
                      <span>{item.itemName}</span>
                    </p>
                    {#if item.notes}
                      <p class="text-sm text-gray-600 mt-1 italic bg-gray-50 rounded-lg p-2">
                        💬 {item.notes}
                      </p>
                    {/if}
                  </div>
                </td>
                <td class="px-4 md:px-6 py-4">
                  <div class="text-center">
                    <span class="font-bold text-xl text-gray-900">{item.quantity}</span>
                    <p class="text-xs text-gray-500">units</p>
                  </div>
                </td>
                <td class="px-4 md:px-6 py-4">
                  <div>
                    <p class="font-medium text-gray-900">{formatDisplayDate(item.expiryDate)}</p>
                    {#if daysUntilExpiry < 0}
                      <p class="text-xs text-red-600 font-medium">🚫 Expired</p>
                    {:else if daysUntilExpiry <= 30}
                      <p class="text-xs text-orange-600 font-medium">⚠️ {daysUntilExpiry} days</p>
                    {:else}
                      <p class="text-xs text-green-600 font-medium">✅ {daysUntilExpiry} days</p>
                    {/if}
                  </div>
                </td>
                <td class="px-4 md:px-6 py-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold border {status.color}">
                    <span class="mr-1">{status.icon}</span>
                    <span>{status.text}</span>
                  </span>
                </td>
                <td class="px-4 md:px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button
                      on:click={() => editItem(item)}
                      class="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="Edit item"
                    >
                      <span class="text-lg">✏️</span>
                    </button>
                    <button
                      on:click={() => confirmDelete(item.id)}
                      class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
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
    <div class="md:hidden space-y-3">
      {#each filteredItems as item}
        {@const status = getItemStatus(item)}
        {@const daysUntilExpiry = getDaysUntilExpiry(item.expiryDate)}
        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-2 mb-2">
                <span class="text-lg">📦</span>
                <h3 class="font-bold text-gray-900 text-base truncate">{item.itemName}</h3>
              </div>
              <div class="flex items-center gap-2">
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-bold border {status.color}">
                  <span class="mr-1">{status.icon}</span>
                  <span>{status.text}</span>
                </span>
              </div>
            </div>
            <div class="flex items-center gap-1 ml-3">
              <button
                on:click={() => editItem(item)}
                class="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <span class="text-lg">✏️</span>
              </button>
              <button
                on:click={() => confirmDelete(item.id)}
                class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <span class="text-lg">🗑️</span>
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div class="bg-blue-50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-500 uppercase font-semibold">Quantity</p>
              <p class="text-lg font-bold text-gray-900">{item.quantity}</p>
              <p class="text-xs text-gray-500">units</p>
            </div>
            <div class="bg-gray-50 rounded-lg p-3 text-center">
              <p class="text-xs text-gray-500 uppercase font-semibold">Expires</p>
              <p class="font-semibold text-gray-900 text-sm">{formatDisplayDate(item.expiryDate)}</p>
              {#if daysUntilExpiry < 0}
                <p class="text-xs text-red-600 font-medium">🚫 Expired</p>
              {:else if daysUntilExpiry <= 30}
                <p class="text-xs text-orange-600 font-medium">⚠️ {daysUntilExpiry} days</p>
              {:else}
                <p class="text-xs text-green-600 font-medium">✅ {daysUntilExpiry} days</p>
              {/if}
            </div>
          </div>

          {#if item.notes}
            <div class="mt-3 pt-3 border-t border-gray-200">
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-sm text-gray-700 italic flex items-start gap-2">
                  <span class="text-base flex-shrink-0">💬</span>
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
    <div class="bg-white rounded-xl md:rounded-2xl p-8 md:p-16 text-center shadow-sm border border-gray-100">
      <div class="text-gray-400 text-5xl md:text-6xl mb-6">📦</div>
      <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-4">
        {searchTerm || filterType !== 'all' ? 'No items found' : 'No inventory items'}
      </h3>
      <p class="text-gray-500 mb-8 max-w-md mx-auto text-base md:text-lg leading-relaxed">
        {searchTerm || filterType !== 'all' 
          ? 'Try adjusting your filters or search terms.' 
          : 'Get started by adding your first inventory item to track supplies and stock levels.'}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          on:click={showAddItemForm}
          class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-base md:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          <span class="text-xl">➕</span>
          <span>Add First Item</span>
        </button>
        {#if searchTerm || filterType !== 'all'}
          <button
            on:click={clearFilters}
            class="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-base md:text-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>✖️</span>
            <span>Clear Filters</span>
          </button>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Mobile FAB -->
  <div class="md:hidden fixed bottom-6 right-6 z-40">
    <button
      on:click={showAddItemForm}
      class="bg-blue-600 hover:bg-blue-700 text-white w-14 h-14 rounded-full shadow-lg hover:shadow-xl transition-all duration-200 flex items-center justify-center"
    >
      <span class="text-2xl">➕</span>
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

  /* Table hover effects */
  table tbody tr {
    transition: all 0.15s ease;
  }

  table tbody tr:hover {
    transform: translateY(-1px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
  }

  /* Form enhancements */
  input:focus, select:focus, textarea:focus {
    outline: none;
    box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    .mobile-padding {
      padding-left: 1rem;
      padding-right: 1rem;
    }
  }

  /* Enhanced focus states */
  button:focus-visible,
  input:focus-visible,
  select:focus-visible,
  textarea:focus-visible {
    outline: 2px solid #3b82f6;
    outline-offset: 2px;
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

  /* Reduced motion support */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
  }
</style>