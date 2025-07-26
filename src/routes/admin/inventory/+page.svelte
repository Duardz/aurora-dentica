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

  // Form data
  let formData: InventoryForm = {
    itemName: '',
    quantity: 0,
    expiryDate: '',
    notes: ''
  };

  let formErrors: Partial<InventoryForm> = {};
  let saving = false;

  const commonItems = [
    'Dental Gloves',
    'Face Masks',
    'Disposable Syringes',
    'Dental Floss',
    'Toothbrushes',
    'Fluoride Gel',
    'Dental Impression Material',
    'Anesthetic Cartridges',
    'Cotton Rolls',
    'Gauze Pads',
    'Dental Cement',
    'Polishing Paste',
    'Bite Registration Material',
    'Disinfectant Solution',
    'Dental Bibs'
  ];

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
          default:
            return true;
        }
      });
    }

    filteredItems = filtered;
  }

  function resetForm() {
    formData = {
      itemName: '',
      quantity: 0,
      expiryDate: '',
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

  async function deleteItem(id: string) {
    if (!db || !confirm('Are you sure you want to delete this item?')) return;

    try {
      await deleteDoc(doc(db, 'inventory', id));
      await loadInventory();
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

  function getItemStatus(item: InventoryItem): { type: string; text: string; color: string } {
    if (isExpired(item.expiryDate)) {
      return { type: 'expired', text: 'Expired', color: 'bg-red-100 text-red-800' };
    }
    if (isNearExpiry(item.expiryDate)) {
      return { type: 'expiring', text: 'Expiring Soon', color: 'bg-warning-100 text-warning-800' };
    }
    if (isLowStock(item.quantity)) {
      return { type: 'low-stock', text: 'Low Stock', color: 'bg-blue-100 text-blue-800' };
    }
    return { type: 'good', text: 'Good', color: 'bg-green-100 text-green-800' };
  }

  function getAlertCount(type: string): number {
    return items.filter(item => {
      switch (type) {
        case 'low-stock': return isLowStock(item.quantity);
        case 'expiring': return isNearExpiry(item.expiryDate) && !isExpired(item.expiryDate);
        case 'expired': return isExpired(item.expiryDate);
        default: return false;
      }
    }).length;
  }
</script>

<svelte:head>
  <title>Inventory - Aurora Dentica Admin</title>
</svelte:head>

<!-- Page Header -->
<div class="mb-8">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Inventory Management</h1>
      <p class="text-gray-600">Track dental supplies and equipment</p>
    </div>
    <button
      on:click={showAddItemForm}
      class="mt-4 sm:mt-0 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors inline-flex items-center space-x-2"
    >
      <span>➕</span>
      <span>Add Item</span>
    </button>
  </div>
</div>

<!-- Alert Summary -->
<div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
  <div class="bg-red-50 border border-red-200 rounded-lg p-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-red-800">Expired Items</p>
        <p class="text-2xl font-bold text-red-900">{getAlertCount('expired')}</p>
      </div>
      <div class="text-red-600 text-2xl">🚫</div>
    </div>
  </div>

  <div class="bg-warning-50 border border-warning-200 rounded-lg p-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-warning-800">Expiring Soon</p>
        <p class="text-2xl font-bold text-warning-900">{getAlertCount('expiring')}</p>
      </div>
      <div class="text-warning-600 text-2xl">⚠️</div>
    </div>
  </div>

  <div class="bg-blue-50 border border-blue-200 rounded-lg p-4">
    <div class="flex items-center justify-between">
      <div>
        <p class="text-sm font-medium text-blue-800">Low Stock</p>
        <p class="text-2xl font-bold text-blue-900">{getAlertCount('low-stock')}</p>
      </div>
      <div class="text-blue-600 text-2xl">📦</div>
    </div>
  </div>
</div>

<!-- Filters -->
<div class="bg-white rounded-xl shadow-card border border-gray-100 p-6 mb-8">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Filter Type -->
    <div>
      <label for="filter-type" class="block text-sm font-medium text-gray-700 mb-2">
        Filter by Status
      </label>
      <select
        id="filter-type"
        bind:value={filterType}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      >
        <option value="all">All Items</option>
        <option value="expired">Expired</option>
        <option value="expiring">Expiring Soon</option>
        <option value="low-stock">Low Stock</option>
      </select>
    </div>

    <!-- Search -->
    <div>
      <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
        Search Items
      </label>
      <input
        id="search"
        type="text"
        placeholder="Search by item name or notes..."
        bind:value={searchTerm}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
    </div>
  </div>

  <div class="mt-4 flex items-center justify-between">
    <p class="text-sm text-gray-600">
      Showing {filteredItems.length} item{filteredItems.length !== 1 ? 's' : ''}
    </p>
    <button
      on:click={() => { filterType = 'all'; searchTerm = ''; }}
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
      <form on:submit|preventDefault={saveItem} class="p-6 space-y-6">
        
        <!-- Item Name -->
        <div>
          <label for="item-name" class="block text-sm font-medium text-gray-700 mb-2">
            Item Name *
          </label>
          <select
            id="item-name"
            bind:value={formData.itemName}
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {formErrors.itemName ? 'border-red-500' : ''}"
            required
          >
            <option value="">Select item</option>
            {#each commonItems as item}
              <option value={item}>{item}</option>
            {/each}
            <option value="Other">Other</option>
          </select>
          {#if formData.itemName === 'Other'}
            <input
              type="text"
              bind:value={formData.itemName}
              placeholder="Enter custom item name"
              class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          {/if}
          {#if formErrors.itemName}
            <p class="mt-1 text-sm text-red-600">{formErrors.itemName}</p>
          {/if}
        </div>

        <!-- Quantity and Expiry Date -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="quantity" class="block text-sm font-medium text-gray-700 mb-2">
              Quantity *
            </label>
            <input
              id="quantity"
              type="number"
              min="0"
              bind:value={formData.quantity}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {formErrors.quantity ? 'border-red-500' : ''}"
              placeholder="0"
              required
            />
            {#if formErrors.quantity}
              <p class="mt-1 text-sm text-red-600">{formErrors.quantity}</p>
            {/if}
          </div>

          <div>
            <label for="expiry-date" class="block text-sm font-medium text-gray-700 mb-2">
              Expiry Date *
            </label>
            <input
              id="expiry-date"
              type="date"
              bind:value={formData.expiryDate}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {formErrors.expiryDate ? 'border-red-500' : ''}"
              required
            />
            {#if formErrors.expiryDate}
              <p class="mt-1 text-sm text-red-600">{formErrors.expiryDate}</p>
            {/if}
          </div>
        </div>

        <!-- Notes -->
        <div>
          <label for="notes" class="block text-sm font-medium text-gray-700 mb-2">
            Notes (Optional)
          </label>
          <textarea
            id="notes"
            bind:value={formData.notes}
            rows="3"
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Additional notes about this item..."
          ></textarea>
        </div>

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
              <span>{editingId ? 'Update' : 'Save'} Item</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Inventory List -->
{#if loading}
  <div class="flex justify-center items-center py-16">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
{:else if filteredItems.length > 0}
  <div class="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
    
    <!-- Desktop Table -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Expiry Date</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          {#each filteredItems as item}
            {@const status = getItemStatus(item)}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div>
                  <p class="font-medium text-gray-900">{item.itemName}</p>
                  {#if item.notes}
                    <p class="text-sm text-gray-500 mt-1">{item.notes}</p>
                  {/if}
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="font-medium text-gray-900">{item.quantity}</span>
                {#if isLowStock(item.quantity)}
                  <span class="ml-2 text-xs text-blue-600">⚠️ Low</span>
                {/if}
              </td>
              <td class="px-6 py-4">
                <p class="text-gray-900">{formatDisplayDate(item.expiryDate)}</p>
                {#if isNearExpiry(item.expiryDate) || isExpired(item.expiryDate)}
                  <p class="text-xs {isExpired(item.expiryDate) ? 'text-red-600' : 'text-warning-600'} mt-1">
                    {isExpired(item.expiryDate) ? '🚫 Expired' : '⚠️ Expiring Soon'}
                  </p>
                {/if}
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {status.color}">
                  {status.text}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <button
                    on:click={() => editItem(item)}
                    class="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Edit
                  </button>
                  <button
                    on:click={() => deleteItem(item.id)}
                    class="text-red-600 hover:text-red-700 font-medium text-sm"
                  >
                    Delete
                  </button>
                </div>
              </td>
            </tr>
          {/each}
        </tbody>
      </table>
    </div>

    <!-- Mobile Cards -->
    <div class="md:hidden divide-y divide-gray-200">
      {#each filteredItems as item}
        {@const status = getItemStatus(item)}
        <div class="p-6">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="font-medium text-gray-900">{item.itemName}</h3>
              {#if item.notes}
                <p class="text-sm text-gray-600 mt-1">{item.notes}</p>
              {/if}
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium {status.color}">
              {status.text}
            </span>
          </div>
          
          <div class="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p class="text-xs text-gray-500">Quantity</p>
              <p class="font-medium text-gray-900">
                {item.quantity}
                {#if isLowStock(item.quantity)}
                  <span class="text-xs text-blue-600">⚠️</span>
                {/if}
              </p>
            </div>
            <div>
              <p class="text-xs text-gray-500">Expires</p>
              <p class="font-medium text-gray-900">{formatDisplayDate(item.expiryDate)}</p>
              {#if isNearExpiry(item.expiryDate) || isExpired(item.expiryDate)}
                <p class="text-xs {isExpired(item.expiryDate) ? 'text-red-600' : 'text-warning-600'}">
                  {isExpired(item.expiryDate) ? '🚫 Expired' : '⚠️ Soon'}
                </p>
              {/if}
            </div>
          </div>

          <div class="flex justify-end space-x-3">
            <button
              on:click={() => editItem(item)}
              class="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              Edit
            </button>
            <button
              on:click={() => deleteItem(item.id)}
              class="text-red-600 hover:text-red-700 font-medium text-sm"
            >
              Delete
            </button>
          </div>
        </div>
      {/each}
    </div>
  </div>
{:else}
  <!-- Empty State -->
  <div class="bg-white rounded-xl shadow-card border border-gray-100 p-12 text-center">
    <div class="text-gray-400 text-6xl mb-4">📦</div>
    <h3 class="text-lg font-medium text-gray-900 mb-2">
      {searchTerm || filterType !== 'all' ? 'No items found' : 'No inventory items'}
    </h3>
    <p class="text-gray-500 mb-6">
      {searchTerm || filterType !== 'all' 
        ? 'Try adjusting your filters or search terms' 
        : 'Get started by adding your first inventory item'}
    </p>
    <button
      on:click={showAddItemForm}
      class="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
    >
      Add First Item
    </button>
  </div>
{/if}