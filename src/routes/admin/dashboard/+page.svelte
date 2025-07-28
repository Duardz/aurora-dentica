<script lang="ts">
  import { onMount } from 'svelte';
  import { db, auth } from '$lib/firebase/config';
  import { collection, getDocs, query, where, orderBy, limit } from 'firebase/firestore';
  import { formatDisplayDate, formatTime, isLowStock, isNearExpiry, isExpired } from '$lib/utils';
  import { decrypt } from '$lib/encryption';

  // Dashboard data interfaces
  interface DashboardStats {
    totalAppointments: number;
    todayAppointments: number;
    upcomingAppointments: number;
    totalInventoryItems: number;
    lowStockItems: number;
    expiringItems: number;
    activePromotions: number;
    totalPromotions: number;
  }

  interface RecentActivity {
    id: string;
    type: 'appointment' | 'inventory' | 'promotion';
    title: string;
    description: string;
    timestamp: Date;
    status: 'success' | 'warning' | 'info' | 'error';
  }

  interface QuickAction {
    title: string;
    description: string;
    href: string;
    icon: string;
    color: string;
    urgent?: boolean;
  }

  // Reactive state
  let loading = true;
  let debugInfo = '';
  let dashboardStats: DashboardStats = {
    totalAppointments: 0,
    todayAppointments: 0,
    upcomingAppointments: 0,
    totalInventoryItems: 0,
    lowStockItems: 0,
    expiringItems: 0,
    activePromotions: 0,
    totalPromotions: 0
  };

  let recentActivities: RecentActivity[] = [];
  let quickActions: QuickAction[] = [
    {
      title: 'New Appointment',
      description: 'Schedule a patient visit',
      href: '/admin/appointments',
      icon: 'M8 7V3a1 1 0 012 0v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H4a1 1 0 110-2h4z',
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Add Inventory',
      description: 'Track new supplies',
      href: '/admin/inventory',
      icon: 'M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10',
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Create Promotion',
      description: 'Launch marketing campaign',
      href: '/admin/promos',
      icon: 'M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z',
      color: 'from-orange-500 to-orange-600'
    },
    {
      title: 'View Reports',
      description: 'Analytics and insights',
      href: '/admin/dashboard',
      icon: 'M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z',
      color: 'from-green-500 to-green-600'
    }
  ];

  // Time-based greeting
  let greeting = '';
  let currentTime = '';

  onMount(() => {
    updateTimeAndGreeting();
    setInterval(updateTimeAndGreeting, 60000); // Update every minute
    
    // Debug authentication state
    if (auth) {
      auth.onAuthStateChanged((user) => {
        if (user) {
          console.log('🔍 Dashboard - Current user:', {
            email: user.email,
            emailVerified: user.emailVerified,
            uid: user.uid
          });
          debugInfo = `Logged in as: ${user.email}`;
          loadDashboardData();
        } else {
          console.log('❌ Dashboard - No user logged in');
          debugInfo = 'No user logged in';
          loading = false;
        }
      });
    }
  });

  function updateTimeAndGreeting() {
    const now = new Date();
    const hour = now.getHours();
    
    // Update current time
    currentTime = now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });

    // Update greeting based on time
    if (hour < 12) {
      greeting = 'Good Morning';
    } else if (hour < 17) {
      greeting = 'Good Afternoon';
    } else {
      greeting = 'Good Evening';
    }
  }

  async function loadDashboardData() {
    if (!db || !auth?.currentUser) {
      debugInfo += ' | Database or auth not available';
      loading = false;
      return;
    }

    try {
      console.log('📊 Loading dashboard data...');
      
      // Load appointments data
      await loadAppointmentsStats();
      
      // Load inventory data
      await loadInventoryStats();
      
      // Load promotions data
      await loadPromotionsStats();
      
      // Generate recent activities (mock data for demo)
      generateRecentActivities();
      
      debugInfo += ' | Dashboard data loaded successfully';
      
    } catch (error) {
      console.error('❌ Dashboard loading error:', error);
      debugInfo += ` | Error: ${error instanceof Error ? error.message : String(error)}`;
    } finally {
      loading = false;
    }
  }

  async function loadAppointmentsStats() {
    if (!db) return;
    
    try {
      const appointmentsRef = collection(db, 'appointments');
      const snapshot = await getDocs(appointmentsRef);
      
      const today = new Date().toISOString().split('T')[0];
      let todayCount = 0;
      let upcomingCount = 0;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.date === today) {
          todayCount++;
        } else if (data.date > today) {
          upcomingCount++;
        }
      });
      
      dashboardStats.totalAppointments = snapshot.docs.length;
      dashboardStats.todayAppointments = todayCount;
      dashboardStats.upcomingAppointments = upcomingCount;
      
      console.log('✅ Appointments stats loaded:', {
        total: dashboardStats.totalAppointments,
        today: dashboardStats.todayAppointments,
        upcoming: dashboardStats.upcomingAppointments
      });
    } catch (error) {
      console.log('❌ Appointments stats failed:', error);
    }
  }

  async function loadInventoryStats() {
    if (!db) return;
    
    try {
      const inventoryRef = collection(db, 'inventory');
      const snapshot = await getDocs(inventoryRef);
      
      let lowStockCount = 0;
      let expiringCount = 0;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (isLowStock(data.quantity || 0)) {
          lowStockCount++;
        }
        if (isNearExpiry(data.expiryDate) && !isExpired(data.expiryDate)) {
          expiringCount++;
        }
      });
      
      dashboardStats.totalInventoryItems = snapshot.docs.length;
      dashboardStats.lowStockItems = lowStockCount;
      dashboardStats.expiringItems = expiringCount;
      
      console.log('✅ Inventory stats loaded:', {
        total: dashboardStats.totalInventoryItems,
        lowStock: dashboardStats.lowStockItems,
        expiring: dashboardStats.expiringItems
      });
    } catch (error) {
      console.log('❌ Inventory stats failed:', error);
    }
  }

  async function loadPromotionsStats() {
    if (!db) return;
    
    try {
      const promosRef = collection(db, 'promos');
      const snapshot = await getDocs(promosRef);
      
      const today = new Date().toISOString().split('T')[0];
      let activeCount = 0;
      
      snapshot.docs.forEach(doc => {
        const data = doc.data();
        if (data.isPublic && data.validUntil >= today) {
          activeCount++;
        }
      });
      
      dashboardStats.totalPromotions = snapshot.docs.length;
      dashboardStats.activePromotions = activeCount;
      
      console.log('✅ Promotions stats loaded:', {
        total: dashboardStats.totalPromotions,
        active: dashboardStats.activePromotions
      });
    } catch (error) {
      console.log('❌ Promotions stats failed:', error);
    }
  }

  function generateRecentActivities() {
    // Generate mock recent activities based on current stats
    const activities: RecentActivity[] = [];
    
    if (dashboardStats.todayAppointments > 0) {
      activities.push({
        id: '1',
        type: 'appointment',
        title: 'Appointments Today',
        description: `${dashboardStats.todayAppointments} appointments scheduled for today`,
        timestamp: new Date(),
        status: 'info'
      });
    }
    
    if (dashboardStats.lowStockItems > 0) {
      activities.push({
        id: '2',
        type: 'inventory',
        title: 'Low Stock Alert',
        description: `${dashboardStats.lowStockItems} items are running low`,
        timestamp: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        status: 'warning'
      });
    }
    
    if (dashboardStats.expiringItems > 0) {
      activities.push({
        id: '3',
        type: 'inventory',
        title: 'Items Expiring Soon',
        description: `${dashboardStats.expiringItems} items expire within 30 days`,
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        status: 'warning'
      });
    }
    
    if (dashboardStats.activePromotions > 0) {
      activities.push({
        id: '4',
        type: 'promotion',
        title: 'Active Promotions',
        description: `${dashboardStats.activePromotions} promotions are currently live`,
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        status: 'success'
      });
    }
    
    // Add some default activities if none exist
    if (activities.length === 0) {
      activities.push({
        id: 'welcome',
        type: 'appointment',
        title: 'Welcome to Aurora Dentica',
        description: 'Your admin dashboard is ready to use',
        timestamp: new Date(),
        status: 'success'
      });
    }
    
    recentActivities = activities.slice(0, 5); // Show latest 5 activities
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'success': return 'text-green-600 bg-green-50 border-green-200';
      case 'warning': return 'text-yellow-600 bg-yellow-50 border-yellow-200';
      case 'error': return 'text-red-600 bg-red-50 border-red-200';
      case 'info': return 'text-blue-600 bg-blue-50 border-blue-200';
      default: return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }

  function getStatusIcon(status: string): string {
    switch (status) {
      case 'success': return 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'warning': return 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z';
      case 'error': return 'M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z';
      case 'info': return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
      default: return 'M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z';
    }
  }

  function formatRelativeTime(date: Date): string {
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
    
    if (diffInMinutes === 0) return 'Just now';
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    
    const diffInDays = Math.floor(diffInHours / 24);
    return `${diffInDays}d ago`;
  }

  // Quick action handlers
  function handleQuickAction(href: string) {
    window.location.href = href;
  }

  // Refresh dashboard data
  async function refreshDashboard() {
    loading = true;
    await loadDashboardData();
  }
</script>

<svelte:head>
  <title>Dashboard - Aurora Dentica Admin</title>
</svelte:head>

<div class="space-y-8">
  
  <!-- Enhanced Header Section -->
  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
    <div class="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-8 sm:px-8 border-b border-gray-200">
      <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between">
        
        <!-- Welcome Section -->
        <div class="flex-1 mb-6 lg:mb-0">
          <div class="flex items-center space-x-4 mb-4">
            <div class="w-12 h-12 sm:w-14 sm:h-14 bg-primary-100 rounded-xl flex items-center justify-center border border-primary-200">
              <svg class="w-6 h-6 sm:w-7 sm:h-7 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
            </div>
            <div>
              <h1 class="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900">
                {greeting}!
              </h1>
              <p class="text-gray-600 text-sm sm:text-base font-medium">Welcome back to your dashboard</p>
            </div>
          </div>
          
          <div class="space-y-3">
            <p class="text-gray-700 text-base sm:text-lg font-medium">
              Here's what's happening at Aurora Dentica today
            </p>
            <div class="flex items-center space-x-4 text-sm">
              <div class="flex items-center space-x-2 bg-green-100 px-3 py-1.5 rounded-full border border-green-200">
                <span class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span class="text-green-700 font-medium">System Online</span>
              </div>
              <span class="text-gray-400">•</span>
              <span class="text-gray-600 font-medium">Last updated: {currentTime}</span>
            </div>
          </div>
        </div>

        <!-- Quick Stats Preview -->
        <div class="lg:ml-8">
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <!-- Today's Appointments -->
            <div class="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div class="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-200">
                {dashboardStats.todayAppointments}
              </div>
              <div class="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">Today</div>
              <div class="text-xs text-gray-600 mt-1">Appointments</div>
            </div>
            
            <!-- Low Stock Items -->
            <div class="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group">
              <div class="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-200">
                {dashboardStats.lowStockItems}
              </div>
              <div class="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">Low Stock</div>
              <div class="text-xs text-gray-600 mt-1">Items</div>
            </div>
            
            <!-- Active Promotions - Hidden on mobile, visible on lg+ -->
            <div class="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group lg:block hidden">
              <div class="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-200">
                {dashboardStats.activePromotions}
              </div>
              <div class="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">Active</div>
              <div class="text-xs text-gray-600 mt-1">Promotions</div>
            </div>
            
            <!-- Total Inventory - Hidden on mobile, visible on lg+ -->
            <div class="bg-white rounded-xl p-4 text-center border border-gray-200 shadow-sm hover:shadow-md transition-all duration-200 group lg:block hidden">
              <div class="text-2xl sm:text-3xl font-bold text-gray-900 group-hover:scale-105 transition-transform duration-200">
                {dashboardStats.totalInventoryItems}
              </div>
              <div class="text-xs sm:text-sm text-gray-500 font-medium uppercase tracking-wide">Inventory</div>
              <div class="text-xs text-gray-600 mt-1">Items</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

  {#if loading}
    <!-- Enhanced Loading State -->
    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
      {#each Array(8) as _}
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <div class="animate-pulse space-y-4">
            <div class="flex items-center space-x-3">
              <div class="w-12 h-12 bg-gray-200 rounded-xl"></div>
              <div class="flex-1 space-y-2">
                <div class="h-4 bg-gray-200 rounded w-3/4"></div>
                <div class="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
            <div class="h-8 bg-gray-200 rounded w-1/3"></div>
          </div>
        </div>
      {/each}
    </div>
  {:else}
    <!-- Main Dashboard Content -->
    <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
      
      <!-- Stats Cards Section -->
      <div class="lg:col-span-8">
        
        <!-- Primary Stats Row -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          
          <!-- Today's Appointments -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 7V3a1 1 0 012 0v4h4a1 1 0 110 2h-4v4a1 1 0 11-2 0v-4H4a1 1 0 110-2h4z"></path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-2xl lg:text-3xl font-bold text-gray-900">{dashboardStats.todayAppointments}</div>
                <div class="text-xs text-gray-500 uppercase tracking-wide font-medium">Today</div>
              </div>
            </div>
            <div class="space-y-1">
              <h3 class="font-semibold text-gray-900">Today's Appointments</h3>
              <p class="text-sm text-gray-600">
                {dashboardStats.upcomingAppointments} more scheduled ahead
              </p>
            </div>
          </div>

          <!-- Total Appointments -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-green-500 to-green-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v6a2 2 0 002 2h6a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"></path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-2xl lg:text-3xl font-bold text-gray-900">{dashboardStats.totalAppointments}</div>
                <div class="text-xs text-gray-500 uppercase tracking-wide font-medium">Total</div>
              </div>
            </div>
            <div class="space-y-1">
              <h3 class="font-semibold text-gray-900">All Appointments</h3>
              <p class="text-sm text-gray-600">
                Including past and future visits
              </p>
            </div>
          </div>

          <!-- Inventory Status -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10"></path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-2xl lg:text-3xl font-bold text-gray-900">{dashboardStats.totalInventoryItems}</div>
                <div class="text-xs text-gray-500 uppercase tracking-wide font-medium">Items</div>
              </div>
            </div>
            <div class="space-y-1">
              <h3 class="font-semibold text-gray-900">Inventory Items</h3>
              <p class="text-sm text-gray-600">
                {dashboardStats.lowStockItems} need restocking
              </p>
            </div>
          </div>

          <!-- Active Promotions -->
          <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-all duration-200 group">
            <div class="flex items-center justify-between mb-4">
              <div class="w-12 h-12 bg-gradient-to-br from-orange-500 to-orange-600 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200">
                <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 14l9-5-9-5-9 5 9 5zm0 0l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z"></path>
                </svg>
              </div>
              <div class="text-right">
                <div class="text-2xl lg:text-3xl font-bold text-gray-900">{dashboardStats.activePromotions}</div>
                <div class="text-xs text-gray-500 uppercase tracking-wide font-medium">Active</div>
              </div>
            </div>
            <div class="space-y-1">
              <h3 class="font-semibold text-gray-900">Promotions</h3>
              <p class="text-sm text-gray-600">
                {dashboardStats.totalPromotions} total campaigns
              </p>
            </div>
          </div>
        </div>

        <!-- Alert Cards Section -->
        {#if dashboardStats.lowStockItems > 0 || dashboardStats.expiringItems > 0}
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-6 mb-8">
            
            {#if dashboardStats.lowStockItems > 0}
              <!-- Low Stock Alert -->
              <div class="bg-gradient-to-r from-yellow-50 to-orange-50 border border-yellow-200 rounded-xl p-6">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.502 0L4.268 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-yellow-900 mb-1">Low Stock Alert</h3>
                    <p class="text-sm text-yellow-700 mb-3">
                      {dashboardStats.lowStockItems} items are running low and need restocking
                    </p>
                    <a href="/admin/inventory" class="inline-flex items-center text-sm font-medium text-yellow-700 hover:text-yellow-800 transition-colors">
                      <span>View Inventory</span>
                      <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            {/if}

            {#if dashboardStats.expiringItems > 0}
              <!-- Expiring Items Alert -->
              <div class="bg-gradient-to-r from-red-50 to-pink-50 border border-red-200 rounded-xl p-6">
                <div class="flex items-start space-x-4">
                  <div class="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
                    <svg class="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h3 class="font-semibold text-red-900 mb-1">Expiring Soon</h3>
                    <p class="text-sm text-red-700 mb-3">
                      {dashboardStats.expiringItems} items expire within 30 days
                    </p>
                    <a href="/admin/inventory" class="inline-flex items-center text-sm font-medium text-red-700 hover:text-red-800 transition-colors">
                      <span>Check Expiry Dates</span>
                      <svg class="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7"></path>
                      </svg>
                    </a>
                  </div>
                </div>
              </div>
            {/if}
          </div>
        {/if}

        <!-- Quick Actions Grid -->
        <div class="bg-white rounded-xl p-6 lg:p-8 shadow-sm border border-gray-200">
          <div class="flex items-center justify-between mb-6">
            <h2 class="text-xl lg:text-2xl font-bold text-gray-900">Quick Actions</h2>
            <button 
              on:click={refreshDashboard}
              class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              title="Refresh dashboard"
            >
              <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>
              </svg>
            </button>
          </div>
          
          <div class="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {#each quickActions as action}
              <button
                on:click={() => handleQuickAction(action.href)}
                class="group relative bg-gradient-to-br {action.color} p-6 rounded-xl text-white hover:shadow-lg transform hover:-translate-y-1 transition-all duration-200 text-left overflow-hidden"
              >
                <!-- Background Pattern -->
                <div class="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-200"></div>
                
                <div class="relative">
                  <div class="w-8 h-8 mb-3 group-hover:scale-110 transition-transform duration-200">
                    <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={action.icon}></path>
                    </svg>
                  </div>
                  <h3 class="font-semibold text-sm lg:text-base mb-1 leading-tight">
                    {action.title}
                  </h3>
                  <p class="text-xs lg:text-sm text-white/80 leading-relaxed">
                    {action.description}
                  </p>
                </div>
              </button>
            {/each}
          </div>
        </div>
      </div>

      <!-- Right Sidebar -->
      <div class="lg:col-span-4 space-y-6">
        
        <!-- Recent Activity -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Recent Activity</h2>
          
          {#if recentActivities.length > 0}
            <div class="space-y-4">
              {#each recentActivities as activity}
                <div class="flex items-start space-x-4 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                  <div class="w-10 h-10 {getStatusColor(activity.status)} rounded-xl flex items-center justify-center flex-shrink-0 border">
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={getStatusIcon(activity.status)}></path>
                    </svg>
                  </div>
                  <div class="flex-1 min-w-0">
                    <h4 class="font-medium text-gray-900 text-sm leading-tight">{activity.title}</h4>
                    <p class="text-xs text-gray-600 mt-1 leading-relaxed">{activity.description}</p>
                    <p class="text-xs text-gray-400 mt-2">{formatRelativeTime(activity.timestamp)}</p>
                  </div>
                </div>
              {/each}
            </div>
          {:else}
            <div class="text-center py-8 text-gray-500">
              <svg class="w-12 h-12 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"></path>
              </svg>
              <p class="text-sm">No recent activity</p>
            </div>
          {/if}
        </div>

        <!-- System Status -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 class="text-xl font-bold text-gray-900 mb-6">System Status</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span class="text-sm font-medium text-green-800">Database</span>
              </div>
              <span class="text-xs text-green-600 font-medium px-2 py-1 bg-green-100 rounded-full">Online</span>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span class="text-sm font-medium text-green-800">Authentication</span>
              </div>
              <span class="text-xs text-green-600 font-medium px-2 py-1 bg-green-100 rounded-full">Active</span>
            </div>
            
            <div class="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
              <div class="flex items-center space-x-3">
                <div class="w-3 h-3 bg-blue-500 rounded-full animate-pulse"></div>
                <span class="text-sm font-medium text-blue-800">Backup</span>
              </div>
              <span class="text-xs text-blue-600 font-medium px-2 py-1 bg-blue-100 rounded-full">Synced</span>
            </div>
            
            <!-- Debug Info (Development Only) -->
            {#if debugInfo}
              <div class="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <h4 class="text-xs font-semibold text-gray-700 mb-2">Debug Info</h4>
                <p class="text-xs text-gray-600 font-mono leading-relaxed break-all">{debugInfo}</p>
              </div>
            {/if}
          </div>
        </div>

        <!-- Quick Stats Summary -->
        <div class="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
          <h2 class="text-xl font-bold text-gray-900 mb-6">Summary</h2>
          
          <div class="space-y-4">
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Total Appointments</span>
              <span class="font-semibold text-gray-900">{dashboardStats.totalAppointments}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Inventory Items</span>
              <span class="font-semibold text-gray-900">{dashboardStats.totalInventoryItems}</span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-sm text-gray-600">Active Promotions</span>
              <span class="font-semibold text-gray-900">{dashboardStats.activePromotions}</span>
            </div>
            
            <div class="border-t pt-4 mt-4">
              <div class="flex items-center justify-between text-sm">
                <span class="text-gray-600">Last Updated</span>
                <span class="text-gray-500">{currentTime}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <!-- Mobile-Optimized Action Bar -->
  <div class="lg:hidden fixed bottom-4 left-4 right-4 z-40">
    <div class="bg-white rounded-2xl shadow-xl border border-gray-200 p-2">
      <div class="grid grid-cols-4 gap-2">
        {#each quickActions as action}
          <button
            on:click={() => handleQuickAction(action.href)}
            class="flex flex-col items-center p-3 rounded-xl hover:bg-gray-50 transition-colors"
          >
            <div class="w-8 h-8 mb-1 text-gray-600">
              <svg class="w-full h-full" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d={action.icon}></path>
              </svg>
            </div>
            <span class="text-xs font-medium text-gray-700 text-center leading-tight">{action.title.split(' ')[0]}</span>
          </button>
        {/each}
      </div>
    </div>
  </div>
</div>

<style>
  /* Enhanced animations for dashboard */
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

  @keyframes pulse-gentle {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.8;
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

  /* Loading skeleton animations */
  @keyframes skeleton-loading {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  .skeleton {
    background: linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%);
    background-size: 200% 100%;
    animation: skeleton-loading 1.5s infinite;
  }

  /* Mobile optimizations */
  @media (max-width: 640px) {
    .mobile-padding {
      padding-left: 1rem;
      padding-right: 1rem;
    }
    
    .mobile-text {
      font-size: 0.875rem;
    }
    
    /* Optimize touch targets */
    .touch-target {
      min-height: 44px;
      min-width: 44px;
    }
  }

  /* Smooth scrolling for mobile */
  @media (max-width: 1024px) {
    .scroll-smooth {
      scroll-behavior: smooth;
      -webkit-overflow-scrolling: touch;
    }
  }

  /* Enhanced focus states */
  .focus-ring:focus-visible {
    outline: 2px solid #0ea5e9;
    outline-offset: 2px;
    border-radius: 0.75rem;
  }

  /* High contrast mode support */
  @media (prefers-contrast: high) {
    .card {
      border: 2px solid currentColor;
    }
    
    .stat-card {
      border: 2px solid currentColor;
      background: white !important;
    }
  }

  /* Reduced motion for accessibility */
  @media (prefers-reduced-motion: reduce) {
    * {
      animation-duration: 0.01ms !important;
      animation-iteration-count: 1 !important;
      transition-duration: 0.01ms !important;
    }
    
    .animate-pulse {
      animation: none;
    }
  }

  /* Print styles */
  @media print {
    .no-print {
      display: none !important;
    }
    
    .print-friendly {
      background: white !important;
      color: black !important;
      box-shadow: none !important;
    }
  }

  /* Custom scrollbar for activity feed */
  .activity-scroll {
    scrollbar-width: thin;
    scrollbar-color: #cbd5e1 #f1f5f9;
  }

  .activity-scroll::-webkit-scrollbar {
    width: 4px;
  }

  .activity-scroll::-webkit-scrollbar-track {
    background: #f1f5f9;
    border-radius: 2px;
  }

  .activity-scroll::-webkit-scrollbar-thumb {
    background: #cbd5e1;
    border-radius: 2px;
  }

  .activity-scroll::-webkit-scrollbar-thumb:hover {
    background: #94a3b8;
  }
</style>