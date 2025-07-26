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
  let currentTime = new Date();

  onMount(() => {
    loadDashboardData();

    // Update time every minute
    const timeInterval = setInterval(() => {
      currentTime = new Date();
    }, 60000);

    return () => clearInterval(timeInterval);
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

  function formatCurrentTime(): string {
    return currentTime.toLocaleTimeString('en-NZ', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  }

  function getGreeting(): string {
    const hour = currentTime.getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  }
</script>

<svelte:head>
  <title>Dashboard - Aurora Dentica Admin</title>
</svelte:head>

{#if loading}
  <!-- Enhanced Loading State -->
  <div class="flex justify-center items-center py-16">
    <div class="text-center">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading dashboard...</p>
    </div>
  </div>
{:else}
  <!-- Page Header with Time -->
  <div class="mb-6 sm:mb-8">
    <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">
          {getGreeting()}! 👋
        </h1>
        <p class="text-gray-600">Here's what's happening at Aurora Dentica today</p>
      </div>
      <div class="mt-4 sm:mt-0 text-right">
        <div class="text-2xl sm:text-3xl font-bold text-primary-600">{formatCurrentTime()}</div>
        <div class="text-sm text-gray-500">{formatDisplayDate(getTodayDate())}</div>
      </div>
    </div>
  </div>

  <!-- Stats Cards with improved responsive design -->
  <div class="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 mb-6 sm:mb-8">
    
    <!-- Today's Appointments -->
    <div class="bg-white rounded-xl shadow-card p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">Today's Appointments</p>
          <p class="text-2xl sm:text-3xl font-bold text-gray-900">{stats.todayAppointments}</p>
          <a href="/admin/appointments" class="text-xs text-primary-600 hover:text-primary-700 font-medium">View all →</a>
        </div>
        <div class="text-primary-600 text-2xl sm:text-3xl ml-2">📅</div>
      </div>
    </div>

    <!-- Upcoming Appointments -->
    <div class="bg-white rounded-xl shadow-card p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">Upcoming</p>
          <p class="text-2xl sm:text-3xl font-bold text-gray-900">{stats.upcomingAppointments}</p>
          <a href="/admin/appointments" class="text-xs text-accent-600 hover:text-accent-700 font-medium">Schedule →</a>
        </div>
        <div class="text-accent-600 text-2xl sm:text-3xl ml-2">📆</div>
      </div>
    </div>

    <!-- Low Stock Items -->
    <div class="bg-white rounded-xl shadow-card p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">Low Stock</p>
          <p class="text-2xl sm:text-3xl font-bold text-gray-900">{stats.lowStockItems}</p>
          <a href="/admin/inventory" class="text-xs text-blue-600 hover:text-blue-700 font-medium">Manage →</a>
        </div>
        <div class="text-blue-600 text-2xl sm:text-3xl ml-2">📦</div>
      </div>
    </div>

    <!-- Expiring Items -->
    <div class="bg-white rounded-xl shadow-card p-4 sm:p-6 border border-gray-100 hover:shadow-md transition-shadow">
      <div class="flex items-center justify-between">
        <div class="flex-1 min-w-0">
          <p class="text-xs sm:text-sm font-medium text-gray-600 truncate">Expiring Soon</p>
          <p class="text-2xl sm:text-3xl font-bold text-gray-900">{stats.expiringItems}</p>
          <a href="/admin/inventory" class="text-xs text-warning-600 hover:text-warning-700 font-medium">Check →</a>
        </div>
        <div class="text-warning-600 text-2xl sm:text-3xl ml-2">⚠️</div>
      </div>
    </div>
  </div>

  <!-- Main Content Grid -->
  <div class="grid grid-cols-1 xl:grid-cols-3 gap-6 sm:gap-8">
    
    <!-- Today's Schedule (spans 2 columns on xl screens) -->
    <div class="xl:col-span-2">
      <div class="bg-white rounded-xl shadow-card border border-gray-100">
        <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
          <div class="flex items-center justify-between">
            <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <span class="text-xl">📅</span>
              <span>Today's Schedule</span>
            </h2>
            <a href="/admin/appointments" class="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
              <span>View All</span>
              <span>→</span>
            </a>
          </div>
        </div>
        
        <div class="p-4 sm:p-6">
          {#if todayAppointments.length > 0}
            <div class="space-y-3 sm:space-y-4">
              {#each todayAppointments as appointment}
                <div class="flex items-center justify-between p-3 sm:p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                  <div class="flex-1 min-w-0">
                    <div class="flex items-center gap-3">
                      <div class="text-primary-600 font-medium text-sm bg-primary-100 px-2 py-1 rounded">
                        {formatTime(appointment.time)}
                      </div>
                      <div class="flex-1 min-w-0">
                        <p class="font-medium text-gray-900 truncate">{appointment.patientName}</p>
                        <p class="text-sm text-gray-600 truncate">{appointment.procedure}</p>
                      </div>
                    </div>
                    {#if appointment.notes}
                      <p class="text-xs text-gray-500 mt-1 truncate">{appointment.notes}</p>
                    {/if}
                  </div>
                  <div class="text-right ml-4 flex-shrink-0">
                    <span class="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">{appointment.frequency}</span>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-8 sm:py-12">
              <div class="text-gray-400 text-4xl sm:text-5xl mb-3">📅</div>
              <h3 class="text-lg font-medium text-gray-900 mb-2">No appointments today</h3>
              <p class="text-gray-500 mb-4">Looks like a quiet day at the clinic</p>
              <a href="/admin/appointments" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
                Schedule Appointment →
              </a>
            </div>
          {/if}
        </div>
      </div>
    </div>

    <!-- Inventory Alerts -->
    <div class="bg-white rounded-xl shadow-card border border-gray-100">
      <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
        <div class="flex items-center justify-between">
          <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <span class="text-xl">📦</span>
            <span>Inventory Alerts</span>
          </h2>
          <a href="/admin/inventory" class="text-primary-600 hover:text-primary-700 text-sm font-medium flex items-center gap-1">
            <span>View All</span>
            <span>→</span>
          </a>
        </div>
      </div>
      
      <div class="p-4 sm:p-6">
        {#if alertInventory.length > 0}
          <div class="space-y-3">
            {#each alertInventory.slice(0, 5) as item}
              {@const alertType = getInventoryAlertType(item)}
              <div class="flex items-center justify-between p-3 rounded-lg border {getAlertColor(alertType)}">
                <div class="flex items-center space-x-3 flex-1 min-w-0">
                  <span class="text-lg flex-shrink-0">{getAlertIcon(alertType)}</span>
                  <div class="flex-1 min-w-0">
                    <p class="font-medium truncate">{item.itemName}</p>
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
                <div class="text-right flex-shrink-0 ml-2">
                  <p class="text-sm font-medium">Qty: {item.quantity}</p>
                </div>
              </div>
            {/each}
            {#if alertInventory.length > 5}
              <div class="text-center pt-2">
                <a href="/admin/inventory" class="text-sm text-primary-600 hover:text-primary-700 font-medium">
                  View {alertInventory.length - 5} more alerts →
                </a>
              </div>
            {/if}
          </div>
        {:else}
          <div class="text-center py-8">
            <div class="text-green-400 text-4xl mb-3">✅</div>
            <h3 class="text-lg font-medium text-gray-900 mb-2">All Good!</h3>
            <p class="text-gray-500 text-sm mb-4">All inventory items are in good condition</p>
            <a href="/admin/inventory" class="text-primary-600 hover:text-primary-700 text-sm font-medium">
              Manage Inventory →
            </a>
          </div>
        {/if}
      </div>
    </div>
  </div>

  <!-- Upcoming Appointments Preview -->
  {#if upcomingAppointments.length > 0}
    <div class="mt-6 sm:mt-8 bg-white rounded-xl shadow-card border border-gray-100">
      <div class="px-4 sm:px-6 py-4 border-b border-gray-200">
        <h2 class="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <span class="text-xl">📆</span>
          <span>Next 5 Appointments</span>
        </h2>
      </div>
      
      <div class="p-4 sm:p-6">
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-3 sm:gap-4">
          {#each upcomingAppointments as appointment}
            <div class="bg-gray-50 rounded-lg p-3 sm:p-4 hover:bg-gray-100 transition-colors">
              <div class="text-center">
                <div class="text-primary-600 font-bold text-sm mb-1">
                  {formatDisplayDate(appointment.date)}
                </div>
                <div class="text-xs text-gray-500 mb-2">
                  {formatTime(appointment.time)}
                </div>
                <div class="font-medium text-gray-900 text-sm truncate mb-1">
                  {appointment.patientName}
                </div>
                <div class="text-xs text-gray-600 truncate">
                  {appointment.procedure}
                </div>
              </div>
            </div>
          {/each}
        </div>
      </div>
    </div>
  {/if}

  <!-- Quick Actions -->
  <div class="mt-6 sm:mt-8 bg-gradient-to-r from-primary-50 to-accent-50 rounded-xl p-4 sm:p-6">
    <h2 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
      <span class="text-xl">⚡</span>
      <span>Quick Actions</span>
    </h2>
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
      <a href="/admin/appointments" class="flex items-center space-x-3 p-3 sm:p-4 bg-white rounded-lg hover:shadow-md transition-all duration-200 group">
        <span class="text-2xl group-hover:scale-110 transition-transform">📅</span>
        <div>
          <span class="font-medium text-gray-900 block">Add Appointment</span>
          <span class="text-sm text-gray-500">Schedule a new patient visit</span>
        </div>
      </a>
      <a href="/admin/inventory" class="flex items-center space-x-3 p-3 sm:p-4 bg-white rounded-lg hover:shadow-md transition-all duration-200 group">
        <span class="text-2xl group-hover:scale-110 transition-transform">📦</span>
        <div>
          <span class="font-medium text-gray-900 block">Update Inventory</span>
          <span class="text-sm text-gray-500">Manage supplies and stock</span>
        </div>
      </a>
      <a href="/admin/promos" class="flex items-center space-x-3 p-3 sm:p-4 bg-white rounded-lg hover:shadow-md transition-all duration-200 group sm:col-span-2 lg:col-span-1">
        <span class="text-2xl group-hover:scale-110 transition-transform">🎉</span>
        <div>
          <span class="font-medium text-gray-900 block">Create Promotion</span>
          <span class="text-sm text-gray-500">Add special offers</span>
        </div>
      </a>
    </div>
  </div>

  <!-- Performance Summary -->
  <div class="mt-6 sm:mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
    
    <!-- System Status -->
    <div class="bg-white rounded-xl shadow-card border border-gray-100 p-4 sm:p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span class="text-xl">⚙️</span>
        <span>System Status</span>
      </h3>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-gray-600">Database Connection</span>
          <span class="flex items-center gap-2 text-green-600">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            Online
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600">Data Encryption</span>
          <span class="flex items-center gap-2 text-green-600">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            Active
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600">Backup Status</span>
          <span class="flex items-center gap-2 text-green-600">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            Up to date
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600">Last Sync</span>
          <span class="text-gray-500 text-sm">
            {formatCurrentTime()}
          </span>
        </div>
      </div>
    </div>

    <!-- Recent Activity -->
    <div class="bg-white rounded-xl shadow-card border border-gray-100 p-4 sm:p-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
        <span class="text-xl">📊</span>
        <span>Quick Stats</span>
      </h3>
      <div class="space-y-3">
        <div class="flex items-center justify-between">
          <span class="text-gray-600">Total Appointments</span>
          <span class="font-semibold text-gray-900">
            {stats.todayAppointments + stats.upcomingAppointments}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600">Inventory Items</span>
          <span class="font-semibold text-gray-900">
            {alertInventory.length > 0 ? `${alertInventory.length} need attention` : 'All good'}
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600">Active Promotions</span>
          <span class="font-semibold text-gray-900">
            <a href="/admin/promos" class="text-primary-600 hover:text-primary-700">View all →</a>
          </span>
        </div>
        <div class="flex items-center justify-between">
          <span class="text-gray-600">System Health</span>
          <span class="flex items-center gap-2 text-green-600">
            <div class="w-2 h-2 bg-green-500 rounded-full"></div>
            Excellent
          </span>
        </div>
      </div>
    </div>
  </div>
{/if}