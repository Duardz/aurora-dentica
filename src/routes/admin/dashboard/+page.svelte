<script lang="ts">
  import { onMount } from 'svelte';
  import { db } from '$lib/firebase/config';
  import { collection, query, where, getDocs, orderBy, limit } from 'firebase/firestore';
  import { decrypt } from '$lib/encryption';
  import { getTodayDate, formatTime, formatDisplayDate, isLowStock, isNearExpiry, isExpired } from '$lib/utils';

  interface Appointment {
    id: string;
    patientName: string;
    procedure: string;
    date: string;
    time: string;
    frequency: string;
    notes?: string;
  }

  interface InventoryItem {
    id: string;
    itemName: string;
    quantity: number;
    expiryDate: string;
    notes?: string;
  }

  interface DashboardStats {
    todayAppointments: number;
    upcomingAppointments: number;
    lowStockItems: number;
    expiringItems: number;
  }

  let todayAppointments: Appointment[] = [];
  let upcomingAppointments: Appointment[] = [];
  let alertInventory: InventoryItem[] = [];
  let stats: DashboardStats = {
    todayAppointments: 0,
    upcomingAppointments: 0,
    lowStockItems: 0,
    expiringItems: 0
  };
  let loading = true;

  onMount(async () => {
    await loadDashboardData();
  });

  async function loadDashboardData() {
    if (!db) {
      loading = false;
      return;
    }

    try {
      await Promise.all([
        loadTodayAppointments(),
        loadUpcomingAppointments(),
        loadInventoryAlerts()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      loading = false;
    }
  }

  async function loadTodayAppointments() {
    const today = getTodayDate();
    const appointmentsRef = collection(db!, 'appointments');
    const q = query(
      appointmentsRef,
      where('date', '==', today),
      orderBy('time', 'asc')
    );

    const snapshot = await getDocs(q);
    todayAppointments = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        patientName: decrypt(data.patientName || ''),
        procedure: decrypt(data.procedure || ''),
        date: data.date,
        time: data.time,
        frequency: data.frequency,
        notes: data.notes ? decrypt(data.notes) : ''
      };
    });

    stats.todayAppointments = todayAppointments.length;
  }

  async function loadUpcomingAppointments() {
    const today = getTodayDate();
    const appointmentsRef = collection(db!, 'appointments');
    const q = query(
      appointmentsRef,
      where('date', '>', today),
      orderBy('date', 'asc'),
      limit(5)
    );

    const snapshot = await getDocs(q);
    upcomingAppointments = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        patientName: decrypt(data.patientName || ''),
        procedure: decrypt(data.procedure || ''),
        date: data.date,
        time: data.time,
        frequency: data.frequency,
        notes: data.notes ? decrypt(data.notes) : ''
      };
    });

    stats.upcomingAppointments = upcomingAppointments.length;
  }

  async function loadInventoryAlerts() {
    const inventoryRef = collection(db!, 'inventory');
    const snapshot = await getDocs(inventoryRef);
    
    alertInventory = [];
    let lowStockCount = 0;
    let expiringCount = 0;

    snapshot.docs.forEach(doc => {
      const data = doc.data();
      const item: InventoryItem = {
        id: doc.id,
        itemName: data.itemName,
        quantity: data.quantity,
        expiryDate: data.expiryDate,
        notes: data.notes || ''
      };

      // Check for alerts
      const isLow = isLowStock(item.quantity);
      const isExpiring = isNearExpiry(item.expiryDate) || isExpired(item.expiryDate);

      if (isLow) lowStockCount++;
      if (isExpiring) expiringCount++;

      if (isLow || isExpiring) {
        alertInventory.push(item);
      }
    });

    stats.lowStockItems = lowStockCount;
    stats.expiringItems = expiringCount;
  }

  function getInventoryAlertType(item: InventoryItem): string {
    if (isExpired(item.expiryDate)) return 'expired';
    if (isNearExpiry(item.expiryDate)) return 'expiring';
    if (isLowStock(item.quantity)) return 'low-stock';
    return '';
  }

  function getAlertColor(type: string): string {
    switch (type) {
      case 'expired': return 'bg-red-50 border-red-200 text-red-800';
      case 'expiring': return 'bg-warning-50 border-warning-200 text-warning-800';
      case 'low-stock': return 'bg-blue-50 border-blue-200 text-blue-800';
      default: return 'bg-gray-50 border-gray-200 text-gray-800';
    }
  }

  function getAlertIcon(type: string): string {
    switch (type) {
      case 'expired': return '🚫';
      case 'expiring': return '⚠️';
      case 'low-stock': return '📦';
      default: return '⚠️';
    }
  }
</script>

<svelte:head>
  <title>Dashboard - Aurora Dentica Admin</title>
</svelte:head>

<!-- Page Header -->
<div class="mb-8">
  <h1 class="text-3xl font-bold text-gray-900 mb-2">Dashboard</h1>
  <p class="text-gray-600">Welcome back! Here's what's happening today.</p>
</div>

{#if loading}
  <!-- Loading State -->
  <div class="flex justify-center items-center py-16">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
{:else}
  <!-- Stats Cards -->
  <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
    
    <!-- Today's Appointments -->
    <div class="bg-white rounded-xl shadow-card p-6 border border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Today's Appointments</p>
          <p class="text-3xl font-bold text-gray-900">{stats.todayAppointments}</p>
        </div>
        <div class="text-primary-600 text-3xl">📅</div>
      </div>
    </div>

    <!-- Upcoming Appointments -->
    <div class="bg-white rounded-xl shadow-card p-6 border border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Upcoming</p>
          <p class="text-3xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
        </div>
        <div class="text-accent-600 text-3xl">📆</div>
      </div>
    </div>

    <!-- Low Stock Items -->
    <div class="bg-white rounded-xl shadow-card p-6 border border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Low Stock</p>
          <p class="text-3xl font-bold text-gray-900">{stats.lowStockItems}</p>
        </div>
        <div class="text-blue-600 text-3xl">📦</div>
      </div>
    </div>

    <!-- Expiring Items -->
    <div class="bg-white rounded-xl shadow-card p-6 border border-gray-100">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-medium text-gray-600">Expiring Soon</p>
          <p class="text-3xl font-bold text-gray-900">{stats.expiringItems}</p>
        </div>
        <div class="text-warning-600 text-3xl">⚠️</div>
      </div>
    </div>
  </div>

  <div class="grid grid-cols-1 lg:grid-cols-2 gap-8">
    
    <!-- Today's Appointments -->
    <div class="bg-white rounded-xl shadow-card border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Today's Schedule</h2>
          <a href="/admin/appointments" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All →
          </a>
        </div>
      </div>
      
      <div class="p-6">
        {#if todayAppointments.length > 0}
          <div class="space-y-4">
            {#each todayAppointments as appointment}
              <div class="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div class="flex-1">
                  <p class="font-medium text-gray-900">{appointment.patientName}</p>
                  <p class="text-sm text-gray-600">{appointment.procedure}</p>
                  {#if appointment.notes}
                    <p class="text-xs text-gray-500 mt-1">{appointment.notes}</p>
                  {/if}
                </div>
                <div class="text-right">
                  <p class="font-medium text-primary-600">{formatTime(appointment.time)}</p>
                  <p class="text-xs text-gray-500">{appointment.frequency}</p>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-8">
            <div class="text-gray-400 text-4xl mb-2">📅</div>
            <p class="text-gray-500">No appointments scheduled for today</p>
            <a href="/admin/appointments" class="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
              Schedule Appointment
            </a>
          </div>
        {/if}
      </div>
    </div>

    <!-- Inventory Alerts -->
    <div class="bg-white rounded-xl shadow-card border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900">Inventory Alerts</h2>
          <a href="/admin/inventory" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All →
          </a>
        </div>
      </div>
      
      <div class="p-6">
        {#if alertInventory.length > 0}
          <div class="space-y-3">
            {#each alertInventory as item}
              {@const alertType = getInventoryAlertType(item)}
              <div class="flex items-center justify-between p-3 rounded-lg border {getAlertColor(alertType)}">
                <div class="flex items-center space-x-3">
                  <span class="text-lg">{getAlertIcon(alertType)}</span>
                  <div>
                    <p class="font-medium">{item.itemName}</p>
                    <p class="text-xs opacity-75">
                      {#if alertType === 'low-stock'}
                        Only {item.quantity} left
                      {:else if alertType === 'expired'}
                        Expired {formatDisplayDate(item.expiryDate)}
                      {:else}
                        Expires {formatDisplayDate(item.expiryDate)}
                      {/if}
                    </p>
                  </div>
                </div>
                <div class="text-right">
                  <p class="text-sm font-medium">Qty: {item.quantity}</p>
                </div>
              </div>
            {/each}
          </div>
        {:else}
          <div class="text-center py-8">
            <div class="text-green-400 text-4xl mb-2">✅</div>
            <p class="text-gray-500">All inventory items are in good condition</p>
            <a href="/admin/inventory" class="text-primary-600 hover:text-primary-700 text-sm font-medium mt-2 inline-block">
              Manage Inventory
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Upcoming Appointments Preview -->
  {#if upcomingAppointments.length > 0}
    <div class="mt-8 bg-white rounded-xl shadow-card border border-gray-100">
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900">Next 5 Appointments</h2>
      </div>
      
      <div class="p-6">
        <div class="space-y-3">
          {#each upcomingAppointments as appointment}
            <div class="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div class="flex-1">
                <p class="font-medium text-gray-900">{appointment.patientName}</p>
                <p class="text-sm text-gray-600">{appointment.procedure}</p>
              </div>
              <div class="text-right">
                <p class="font-medium text-gray-900">{formatDisplayDate(appointment.date)}</p>
                <p class="text-sm text-primary-600">{formatTime(appointment.time)}</p>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Quick Actions -->
  <div class="mt-8 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
    <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <a href="/admin/appointments" class="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
        <span class="text-2xl">📅</span>
        <span class="font-medium text-gray-900">Add Appointment</span>
      </a>
      <a href="/admin/inventory" class="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
        <span class="text-2xl">📦</span>
        <span class="font-medium text-gray-900">Update Inventory</span>
      </a>
      <a href="/admin/promos" class="flex items-center space-x-3 p-4 bg-white rounded-lg hover:shadow-md transition-shadow">
        <span class="text-2xl">🎉</span>
        <span class="font-medium text-gray-900">Create Promotion</span>
      </a>
    </div>
  </div>
{/if}