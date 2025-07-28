<script lang="ts">
  import { onMount } from 'svelte';
  import { db } from '$lib/firebase/config';
  import { 
    collection, 
    query, 
    where, 
    orderBy, 
    getDocs, 
    addDoc, 
    updateDoc, 
    deleteDoc, 
    doc,
    Timestamp 
  } from 'firebase/firestore';
  import { encrypt, decrypt, encryptFields, decryptFields } from '$lib/encryption';
  import { getTodayDate, formatTime, formatDisplayDate, debounce, sanitizeInput } from '$lib/utils';

  interface Appointment {
    id: string;
    patientName: string;
    procedure: string;
    date: string;
    time: string;
    frequency: string;
    notes?: string;
    createdAt?: any;
  }

  interface AppointmentForm {
    patientName: string;
    procedure: string;
    date: string;
    time: string;
    frequency: string;
    notes: string;
  }

  let appointments: Appointment[] = [];
  let filteredAppointments: Appointment[] = [];
  let loading = true;
  let showAddForm = false;
  let editingId: string | null = null;
  let searchTerm = '';
  let selectedDate = '';
  let selectedStatus = 'all';
  let showMobileFilters = false;

  // Form data
  let formData: AppointmentForm = {
    patientName: '',
    procedure: '',
    date: getTodayDate(),
    time: '',
    frequency: 'One-time',
    notes: ''
  };

  let formErrors: Partial<AppointmentForm> = {};
  let saving = false;
  let showDeleteConfirm = false;
  let deleteItemId = '';

  // Reactive stats - Fixed to properly update
  $: todayCount = appointments.filter(apt => apt.date === getTodayDate()).length;
  $: upcomingCount = appointments.filter(apt => apt.date > getTodayDate()).length;
  $: pastCount = appointments.filter(apt => apt.date < getTodayDate()).length;
  $: totalCount = appointments.length;

  const frequencyOptions = [
    'One-time',
    'Weekly',
    'Bi-weekly', 
    'Monthly',
    'Quarterly',
    'Bi-annually',
    'Annually'
  ];

  const commonProcedures = [
    'Regular Checkup',
    'Dental Cleaning',
    'Cavity Filling',
    'Root Canal',
    'Crown Installation',
    'Tooth Extraction',
    'Teeth Whitening',
    'Dental Implant',
    'Emergency Visit',
    'Consultation',
    'Oral Surgery',
    'Periodontal Treatment',
    'Orthodontic Assessment'
  ];

  const timeSlots = [
    '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
    '11:00', '11:30', '12:00', '12:30', '13:00', '13:30',
    '14:00', '14:30', '15:00', '15:30', '16:00', '16:30',
    '17:00', '17:30'
  ];

  onMount(async () => {
    await loadAppointments();
  });

  // Fixed debounced search function
  const debouncedSearch = debounce(() => {
    filterAppointments();
  }, 300);

  // Fixed reactive statements
  $: {
    if (searchTerm !== undefined) {
      debouncedSearch();
    }
  }

  $: {
    if (selectedDate !== undefined || selectedStatus !== undefined) {
      filterAppointments();
    }
  }

  async function loadAppointments() {
    if (!db) {
      loading = false;
      return;
    }

    try {
      console.log('📅 Loading appointments...');
      const appointmentsRef = collection(db, 'appointments');
      const q = query(appointmentsRef, orderBy('date', 'desc'), orderBy('time', 'asc'));
      
      const snapshot = await getDocs(q);
      console.log('📊 Raw appointments from Firestore:', snapshot.docs.length);
      
      appointments = snapshot.docs.map(doc => {
        const data = doc.data();
        console.log('📋 Raw appointment data:', {
          id: doc.id,
          date: data.date,
          time: data.time,
          encryptedPatientName: data.patientName ? 'encrypted' : 'missing',
          encryptedProcedure: data.procedure ? 'encrypted' : 'missing'
        });
        
        // Decrypt the appointment data
        const decryptedAppointment = decryptFields({
          id: doc.id,
          patientName: data.patientName || '',
          procedure: data.procedure || '',
          date: data.date,
          time: data.time,
          frequency: data.frequency || 'One-time',
          notes: data.notes || '',
          createdAt: data.createdAt
        }, ['patientName', 'procedure', 'notes']);
        
        console.log('🔓 Decrypted appointment:', {
          id: decryptedAppointment.id,
          patientName: decryptedAppointment.patientName,
          procedure: decryptedAppointment.procedure,
          date: decryptedAppointment.date,
          time: decryptedAppointment.time
        });
        
        return decryptedAppointment;
      });

      console.log('✅ Total appointments loaded:', appointments.length);
      console.log('📊 Sample appointments:', appointments.slice(0, 3));
      
      filterAppointments();
    } catch (error) {
      console.error('❌ Error loading appointments:', error);
    } finally {
      loading = false;
    }
  }

  // Fixed filter function with better debugging
  function filterAppointments() {
    let filtered = [...appointments]; // Create a copy to avoid mutations
    const today = getTodayDate();

    console.log('🔍 Starting filter process:', {
      totalAppointments: appointments.length,
      searchTerm: searchTerm,
      selectedDate: selectedDate,
      selectedStatus: selectedStatus,
      todayDate: today
    });

    // Filter by status first
    if (selectedStatus !== 'all') {
      const beforeStatusFilter = filtered.length;
      filtered = filtered.filter(apt => {
        switch (selectedStatus) {
          case 'today':
            return apt.date === today;
          case 'upcoming':
            return apt.date > today;
          case 'past':
            return apt.date < today;
          default:
            return true;
        }
      });
      console.log(`📊 After status filter (${selectedStatus}):`, {
        before: beforeStatusFilter,
        after: filtered.length,
        filtered: filtered.map(apt => ({ date: apt.date, patient: apt.patientName }))
      });
    }

    // Filter by specific date
    if (selectedDate && selectedDate.trim() !== '') {
      const beforeDateFilter = filtered.length;
      filtered = filtered.filter(apt => apt.date === selectedDate);
      console.log(`📅 After date filter (${selectedDate}):`, {
        before: beforeDateFilter,
        after: filtered.length
      });
    }

    // Filter by search term
    if (searchTerm && searchTerm.trim() !== '') {
      const beforeSearchFilter = filtered.length;
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(search) ||
        apt.procedure.toLowerCase().includes(search) ||
        (apt.notes && apt.notes.toLowerCase().includes(search))
      );
      console.log(`🔍 After search filter (${searchTerm}):`, {
        before: beforeSearchFilter,
        after: filtered.length
      });
    }

    console.log('✅ Final filtered result:', {
      originalCount: appointments.length,
      filteredCount: filtered.length,
      finalResults: filtered.map(apt => ({ 
        id: apt.id, 
        patient: apt.patientName, 
        date: apt.date, 
        procedure: apt.procedure 
      }))
    });

    filteredAppointments = filtered;
  }

  function resetForm() {
    formData = {
      patientName: '',
      procedure: '',
      date: selectedDate || getTodayDate(),
      time: '',
      frequency: 'One-time',
      notes: ''
    };
    formErrors = {};
    editingId = null;
  }

  function validateForm(): boolean {
    formErrors = {};

    if (!formData.patientName.trim()) {
      formErrors.patientName = 'Patient name is required';
    }

    if (!formData.procedure.trim()) {
      formErrors.procedure = 'Procedure is required';
    }

    if (!formData.date) {
      formErrors.date = 'Date is required';
    }

    if (!formData.time) {
      formErrors.time = 'Time is required';
    }

    return Object.keys(formErrors).length === 0;
  }

  async function saveAppointment() {
    if (!validateForm() || !db) return;

    saving = true;

    try {
      // Sanitize inputs
      const sanitizedData = {
        patientName: sanitizeInput(formData.patientName),
        procedure: sanitizeInput(formData.procedure),
        date: formData.date,
        time: formData.time,
        frequency: formData.frequency,
        notes: sanitizeInput(formData.notes)
      };

      // Encrypt sensitive fields
      const encryptedData = encryptFields(sanitizedData, ['patientName', 'procedure', 'notes']);

      if (editingId) {
        // Update existing appointment
        const appointmentRef = doc(db, 'appointments', editingId);
        await updateDoc(appointmentRef, encryptedData);
      } else {
        // Create new appointment
        const appointmentData = {
          ...encryptedData,
          createdAt: Timestamp.now()
        };
        await addDoc(collection(db, 'appointments'), appointmentData);
      }

      await loadAppointments();
      showAddForm = false;
      resetForm();
    } catch (error) {
      console.error('Error saving appointment:', error);
    } finally {
      saving = false;
    }
  }

  function editAppointment(appointment: Appointment) {
    formData = {
      patientName: appointment.patientName,
      procedure: appointment.procedure,
      date: appointment.date,
      time: appointment.time,
      frequency: appointment.frequency,
      notes: appointment.notes || ''
    };
    editingId = appointment.id;
    showAddForm = true;
    showMobileFilters = false;
  }

  function confirmDelete(id: string) {
    deleteItemId = id;
    showDeleteConfirm = true;
  }

  async function deleteAppointment() {
    if (!db || !deleteItemId) return;

    try {
      await deleteDoc(doc(db, 'appointments', deleteItemId));
      await loadAppointments();
      showDeleteConfirm = false;
      deleteItemId = '';
    } catch (error) {
      console.error('Error deleting appointment:', error);
    }
  }

  function showAddAppointmentForm() {
    resetForm();
    showAddForm = true;
    showMobileFilters = false;
  }

  function cancelForm() {
    showAddForm = false;
    resetForm();
  }

  function getAppointmentStatus(date: string): string {
    const today = getTodayDate();
    if (date === today) return 'today';
    if (date > today) return 'upcoming';
    return 'past';
  }

  function getStatusColor(status: string): string {
    switch (status) {
      case 'today': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'upcoming': return 'bg-green-100 text-green-800 border-green-200';
      case 'past': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }

  function getStatusText(status: string): string {
    switch (status) {
      case 'today': return 'Today';
      case 'upcoming': return 'Upcoming';
      case 'past': return 'Past';
      default: return '';
    }
  }

  function getStatusIcon(status: string): string {
    switch (status) {
      case 'today': return '📅';
      case 'upcoming': return '🗓️';
      case 'past': return '✅';
      default: return '📋';
    }
  }

  function clearFilters() {
    selectedStatus = 'all';
    selectedDate = '';
    searchTerm = '';
    showMobileFilters = false;
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
  <title>Appointments - Aurora Dentica Admin</title>
</svelte:head>

<div class="space-y-4 md:space-y-6">

  <!-- Enhanced Page Header -->
  <div class="bg-gradient-to-r from-green-600 via-blue-600 to-green-700 rounded-xl md:rounded-2xl shadow-lg text-white overflow-hidden relative">
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
              <span class="text-xl md:text-2xl">📅</span>
            </div>
            <div>
              <h1 class="text-xl md:text-2xl lg:text-3xl font-bold">Appointments</h1>
              <p class="text-green-100 text-sm md:text-base">Manage patient appointments and schedules</p>
            </div>
          </div>
        </div>

        <!-- Action Button -->
        <div class="flex-shrink-0">
          <button
            on:click={showAddAppointmentForm}
            class="w-full md:w-auto bg-white text-green-600 hover:bg-green-50 px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2 shadow-md hover:shadow-lg"
          >
            <span class="text-lg">➕</span>
            <span>New Appointment</span>
          </button>
        </div>
      </div>

      <!-- Enhanced Stats Cards -->
      <div class="grid grid-cols-2 lg:grid-cols-4 gap-2 md:gap-4 mt-4 md:mt-6">
        <div class="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-white/20">
          <div class="text-lg md:text-2xl font-bold">{todayCount}</div>
          <div class="text-xs md:text-sm text-green-100 font-medium">Today</div>
          <div class="text-orange-300 text-lg md:text-xl mt-1">📅</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-white/20">
          <div class="text-lg md:text-2xl font-bold">{upcomingCount}</div>
          <div class="text-xs md:text-sm text-green-100 font-medium">Upcoming</div>
          <div class="text-green-300 text-lg md:text-xl mt-1">🗓️</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-white/20">
          <div class="text-lg md:text-2xl font-bold">{pastCount}</div>
          <div class="text-xs md:text-sm text-green-100 font-medium">Past</div>
          <div class="text-gray-300 text-lg md:text-xl mt-1">✅</div>
        </div>
        <div class="bg-white/10 backdrop-blur-sm rounded-lg md:rounded-xl p-3 md:p-4 text-center border border-white/20">
          <div class="text-lg md:text-2xl font-bold">{totalCount}</div>
          <div class="text-xs md:text-sm text-green-100 font-medium">Total</div>
          <div class="text-blue-300 text-lg md:text-xl mt-1">📊</div>
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
            on:click={() => { selectedStatus = 'all'; selectedDate = ''; }}
            class="{selectedStatus === 'all' && !selectedDate ? 'bg-blue-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <span>📊</span>
            <span>All ({totalCount})</span>
          </button>
          <button 
            on:click={() => { selectedStatus = 'today'; selectedDate = ''; }}
            class="{selectedStatus === 'today' ? 'bg-orange-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <span>📅</span>
            <span>Today ({todayCount})</span>
          </button>
          <button 
            on:click={() => { selectedStatus = 'upcoming'; selectedDate = ''; }}
            class="{selectedStatus === 'upcoming' ? 'bg-green-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <span>🗓️</span>
            <span>Upcoming ({upcomingCount})</span>
          </button>
          <button 
            on:click={() => { selectedStatus = 'past'; selectedDate = ''; }}
            class="{selectedStatus === 'past' ? 'bg-gray-600 text-white shadow-md' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'} px-4 py-2 rounded-lg font-medium transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <span>✅</span>
            <span>Past ({pastCount})</span>
          </button>
        </div>
        
        <!-- Date and Search Filters -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div>
            <label for="date-filter" class="block text-sm font-semibold text-gray-700 mb-2">
              Specific Date
            </label>
            <input
              id="date-filter"
              type="date"
              bind:value={selectedDate}
              class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
            />
          </div>
          <div class="lg:col-span-2">
            <label for="search" class="block text-sm font-semibold text-gray-700 mb-2">
              Search Appointments
            </label>
            <div class="relative">
              <input
                id="search"
                type="text"
                placeholder="Patient name, procedure, notes..."
                bind:value={searchTerm}
                class="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
              />
              <div class="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <span class="text-gray-400 text-lg">🔍</span>
              </div>
            </div>
          </div>
        </div>

        <!-- Filter Summary -->
        <div class="flex items-center justify-between pt-4 border-t border-gray-200">
          <p class="text-sm text-gray-600 flex items-center gap-2">
            <span class="text-lg">📋</span>
            <span>Showing <strong>{filteredAppointments.length}</strong> of <strong>{totalCount}</strong> appointments</span>
          </p>
          {#if searchTerm || selectedDate || selectedStatus !== 'all'}
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
            <strong>{filteredAppointments.length}</strong> of <strong>{totalCount}</strong> appointments
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
                placeholder="Search appointments..."
                bind:value={searchTerm}
                class="w-full px-4 py-3 pl-10 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
              <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span class="text-gray-400">🔍</span>
              </div>
            </div>
          </div>

          <!-- Mobile Date Filter -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-2">Date</label>
            <input
              type="date"
              bind:value={selectedDate}
              class="w-full px-4 py-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <!-- Mobile Filter Buttons -->
          <div class="grid grid-cols-2 gap-2">
            <button 
              on:click={() => { selectedStatus = 'all'; selectedDate = ''; }}
              class="{selectedStatus === 'all' && !selectedDate ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 border border-gray-200'} px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
            >
              <span>📊</span>
              <span>All</span>
            </button>
            <button 
              on:click={() => { selectedStatus = 'today'; selectedDate = ''; }}
              class="{selectedStatus === 'today' ? 'bg-orange-600 text-white' : 'bg-white text-gray-700 border border-gray-200'} px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
            >
              <span>📅</span>
              <span>Today</span>
            </button>
            <button 
              on:click={() => { selectedStatus = 'upcoming'; selectedDate = ''; }}
              class="{selectedStatus === 'upcoming' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 border border-gray-200'} px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
            >
              <span>🗓️</span>
              <span>Upcoming</span>
            </button>
            <button 
              on:click={() => { selectedStatus = 'past'; selectedDate = ''; }}
              class="{selectedStatus === 'past' ? 'bg-gray-600 text-white' : 'bg-white text-gray-700 border border-gray-200'} px-3 py-2 rounded-lg text-sm font-medium flex items-center justify-center gap-1"
            >
              <span>✅</span>
              <span>Past</span>
            </button>
          </div>

          <!-- Clear Filters Button -->
          {#if searchTerm || selectedDate || selectedStatus !== 'all'}
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
              <div class="w-10 h-10 md:w-12 md:h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-xl flex items-center justify-center">
                <span class="text-white text-lg md:text-xl">{editingId ? '✏️' : '➕'}</span>
              </div>
              <div>
                <h2 class="text-lg md:text-xl font-bold text-gray-900">
                  {editingId ? 'Edit Appointment' : 'New Appointment'}
                </h2>
                <p class="text-gray-500 text-sm">
                  {editingId ? 'Update appointment details' : 'Schedule a new patient visit'}
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
          <form on:submit|preventDefault={saveAppointment} class="space-y-6">
            
            <!-- Patient Information -->
            <div class="bg-blue-50 rounded-xl p-4 md:p-6">
              <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span class="text-lg md:text-xl">👤</span>
                <span>Patient Information</span>
              </h3>
              <div>
                <label for="patient-name" class="block text-sm font-semibold text-gray-700 mb-2">
                  Patient Full Name *
                </label>
                <input
                  id="patient-name"
                  type="text"
                  bind:value={formData.patientName}
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 {formErrors.patientName ? 'border-red-500' : ''}"
                  placeholder="Enter patient's full name"
                  required
                />
                {#if formErrors.patientName}
                  <p class="text-red-600 text-sm mt-2 flex items-center gap-2">
                    <span>⚠️</span>
                    <span>{formErrors.patientName}</span>
                  </p>
                {/if}
              </div>
            </div>

            <!-- Appointment Details -->
            <div class="bg-green-50 rounded-xl p-4 md:p-6">
              <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span class="text-lg md:text-xl">🏥</span>
                <span>Appointment Details</span>
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <!-- Procedure -->
                <div>
                  <label for="procedure" class="block text-sm font-semibold text-gray-700 mb-2">
                    Procedure/Treatment *
                  </label>
                  <select
                    id="procedure"
                    bind:value={formData.procedure}
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 {formErrors.procedure ? 'border-red-500' : ''}"
                    required
                  >
                    <option value="">Select procedure type</option>
                    {#each commonProcedures as procedure}
                      <option value={procedure}>{procedure}</option>
                    {/each}
                    <option value="Other">Other (specify in notes)</option>
                  </select>
                  {#if formErrors.procedure}
                    <p class="text-red-600 text-sm mt-2 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{formErrors.procedure}</span>
                    </p>
                  {/if}
                </div>

                <!-- Frequency -->
                <div>
                  <label for="frequency" class="block text-sm font-semibold text-gray-700 mb-2">
                    Appointment Frequency
                  </label>
                  <select
                    id="frequency"
                    bind:value={formData.frequency}
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                  >
                    {#each frequencyOptions as frequency}
                      <option value={frequency}>{frequency}</option>
                    {/each}
                  </select>
                </div>
              </div>
            </div>

            <!-- Schedule -->
            <div class="bg-purple-50 rounded-xl p-4 md:p-6">
              <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span class="text-lg md:text-xl">📅</span>
                <span>Schedule</span>
              </h3>
              
              <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <!-- Date -->
                <div>
                  <label for="appointment-date" class="block text-sm font-semibold text-gray-700 mb-2">
                    Appointment Date *
                  </label>
                  <input
                    id="appointment-date"
                    type="date"
                    bind:value={formData.date}
                    min={getTodayDate()}
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 {formErrors.date ? 'border-red-500' : ''}"
                    required
                  />
                  {#if formErrors.date}
                    <p class="text-red-600 text-sm mt-2 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{formErrors.date}</span>
                    </p>
                  {/if}
                </div>

                <!-- Time -->
                <div>
                  <label for="appointment-time" class="block text-sm font-semibold text-gray-700 mb-2">
                    Appointment Time *
                  </label>
                  <select
                    id="appointment-time"
                    bind:value={formData.time}
                    class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200 {formErrors.time ? 'border-red-500' : ''}"
                    required
                  >
                    <option value="">Select time slot</option>
                    {#each timeSlots as time}
                      <option value={time}>{formatTime(time)}</option>
                    {/each}
                  </select>
                  {#if formErrors.time}
                    <p class="text-red-600 text-sm mt-2 flex items-center gap-2">
                      <span>⚠️</span>
                      <span>{formErrors.time}</span>
                    </p>
                  {/if}
                </div>
              </div>
            </div>

            <!-- Notes -->
            <div class="bg-orange-50 rounded-xl p-4 md:p-6">
              <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span class="text-lg md:text-xl">📝</span>
                <span>Additional Notes</span>
              </h3>
              <div>
                <label for="notes" class="block text-sm font-semibold text-gray-700 mb-2">
                  Special Instructions or Notes (Optional)
                </label>
                <textarea
                  id="notes"
                  bind:value={formData.notes}
                  rows="3"
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none transition-all duration-200"
                  placeholder="Any special instructions, allergies, follow-up requirements..."
                ></textarea>
              </div>
            </div>

            <!-- Preview -->
            {#if formData.patientName && formData.procedure && formData.date && formData.time}
              <div class="bg-gradient-to-r from-gray-50 to-blue-50 rounded-xl p-4 md:p-6 border-2 border-dashed border-blue-200">
                <h3 class="text-base md:text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                  <span class="text-lg md:text-xl">👁️</span>
                  <span>Appointment Preview</span>
                </h3>
                <div class="bg-white rounded-xl p-4 border border-blue-200">
                  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p class="text-sm text-gray-500">Patient</p>
                      <p class="font-semibold text-gray-900">{formData.patientName}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Procedure</p>
                      <p class="font-semibold text-gray-900">{formData.procedure}</p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Date & Time</p>
                      <p class="font-semibold text-blue-700">
                        {formatDisplayDate(formData.date)} at {formatTime(formData.time)}
                      </p>
                    </div>
                    <div>
                      <p class="text-sm text-gray-500">Frequency</p>
                      <p class="font-semibold text-gray-900">{formData.frequency}</p>
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
              on:click={saveAppointment}
              disabled={saving || !formData.patientName || !formData.procedure || !formData.date || !formData.time}
              class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-4 md:px-6 py-2.5 md:py-3 rounded-lg md:rounded-xl font-semibold transition-all duration-200 flex items-center justify-center gap-2"
            >
              {#if saving}
                <div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Saving...</span>
              {:else}
                <span>{editingId ? '💾' : '➕'}</span>
                <span>{editingId ? 'Update' : 'Create'} Appointment</span>
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
              <h2 class="text-xl font-bold text-gray-900">Delete Appointment</h2>
              <p class="text-gray-500 text-sm">This action cannot be undone</p>
            </div>
          </div>
          <div class="text-center mb-6">
            <div class="text-6xl mb-4">⚠️</div>
            <p class="text-gray-600">
              Are you sure you want to delete this appointment? This action is permanent.
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
              on:click={deleteAppointment}
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

  <!-- Enhanced Appointments List -->
  {#if loading}
    <div class="flex justify-center items-center py-16 md:py-20">
      <div class="text-center">
        <div class="relative mb-6">
          <div class="w-12 h-12 md:w-16 md:h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto"></div>
          <div class="absolute inset-0 flex items-center justify-center">
            <span class="text-xl md:text-2xl">📅</span>
          </div>
        </div>
        <h3 class="text-lg md:text-xl font-semibold text-gray-900 mb-2">Loading Appointments</h3>
        <p class="text-gray-600 text-sm md:text-base">Please wait while we fetch your appointment data...</p>
      </div>
    </div>
  {:else if filteredAppointments.length > 0}
    <!-- Desktop Table -->
    <div class="hidden lg:block bg-white rounded-xl md:rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
              <th class="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Patient & Notes</th>
              <th class="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Procedure</th>
              <th class="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Date & Time</th>
              <th class="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Frequency</th>
              <th class="px-4 md:px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            {#each filteredAppointments as appointment}
              {@const status = getAppointmentStatus(appointment.date)}
              <tr class="hover:bg-gray-50 transition-colors duration-150">
                <td class="px-4 md:px-6 py-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium border {getStatusColor(status)}">
                    <span class="mr-1">{getStatusIcon(status)}</span>
                    {getStatusText(status)}
                  </span>
                </td>
                <td class="px-4 md:px-6 py-4">
                  <div>
                    <p class="font-semibold text-gray-900 text-base">{appointment.patientName}</p>
                    {#if appointment.notes}
                      <p class="text-sm text-gray-600 mt-1 bg-gray-50 rounded-lg p-2 italic">
                        💬 {appointment.notes}
                      </p>
                    {/if}
                  </div>
                </td>
                <td class="px-4 md:px-6 py-4">
                  <div class="flex items-center gap-2">
                    <span class="text-lg">🏥</span>
                    <span class="text-gray-900 font-medium">{appointment.procedure}</span>
                  </div>
                </td>
                <td class="px-4 md:px-6 py-4">
                  <div class="space-y-1">
                    <p class="font-semibold text-gray-900 flex items-center gap-2">
                      <span class="text-sm">📅</span>
                      <span>{formatDisplayDate(appointment.date)}</span>
                    </p>
                    <p class="text-sm text-blue-600 font-semibold flex items-center gap-2">
                      <span class="text-sm">🕐</span>
                      <span>{formatTime(appointment.time)}</span>
                    </p>
                  </div>
                </td>
                <td class="px-4 md:px-6 py-4">
                  <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
                    {appointment.frequency}
                  </span>
                </td>
                <td class="px-4 md:px-6 py-4">
                  <div class="flex items-center gap-2">
                    <button
                      on:click={() => editAppointment(appointment)}
                      class="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
                      title="Edit appointment"
                    >
                      <span class="text-lg">✏️</span>
                    </button>
                    <button
                      on:click={() => confirmDelete(appointment.id)}
                      class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
                      title="Delete appointment"
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
    <div class="lg:hidden space-y-3">
      {#each filteredAppointments as appointment}
        {@const status = getAppointmentStatus(appointment.date)}
        <div class="bg-white rounded-lg p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1 min-w-0">
              <div class="flex items-center gap-3 mb-2">
                <h3 class="font-bold text-gray-900 text-base">{appointment.patientName}</h3>
                <span class="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium border {getStatusColor(status)}">
                  <span class="mr-1">{getStatusIcon(status)}</span>
                  {getStatusText(status)}
                </span>
              </div>
              <p class="text-gray-600 flex items-center gap-2">
                <span class="text-lg">🏥</span>
                <span>{appointment.procedure}</span>
              </p>
            </div>
            <div class="flex items-center gap-1 ml-3">
              <button
                on:click={() => editAppointment(appointment)}
                class="p-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-lg transition-all duration-200"
              >
                <span class="text-lg">✏️</span>
              </button>
              <button
                on:click={() => confirmDelete(appointment.id)}
                class="p-2 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition-all duration-200"
              >
                <span class="text-lg">🗑️</span>
              </button>
            </div>
          </div>
          
          <div class="grid grid-cols-2 gap-3 mb-3">
            <div class="bg-gray-50 rounded-lg p-3">
              <p class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Date</p>
              <p class="font-semibold text-gray-900 flex items-center gap-2">
                <span>📅</span>
                <span>{formatDisplayDate(appointment.date)}</span>
              </p>
            </div>
            <div class="bg-blue-50 rounded-lg p-3">
              <p class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Time</p>
              <p class="font-semibold text-blue-700 flex items-center gap-2">
                <span>🕐</span>
                <span>{formatTime(appointment.time)}</span>
              </p>
            </div>
          </div>

          <div class="flex items-center justify-between mb-3">
            <span class="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800 border border-gray-200">
              {appointment.frequency}
            </span>
          </div>

          {#if appointment.notes}
            <div class="mt-3 pt-3 border-t border-gray-200">
              <div class="bg-gray-50 rounded-lg p-3">
                <p class="text-sm text-gray-700 italic flex items-start gap-2">
                  <span class="text-base flex-shrink-0">💬</span>
                  <span>{appointment.notes}</span>
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
      <div class="text-gray-400 text-5xl md:text-6xl mb-6">📅</div>
      <h3 class="text-xl md:text-2xl font-bold text-gray-900 mb-4">
        {searchTerm || selectedDate || selectedStatus !== 'all' ? 'No appointments found' : 'No appointments scheduled'}
      </h3>
      <p class="text-gray-500 mb-8 max-w-md mx-auto text-base md:text-lg leading-relaxed">
        {searchTerm || selectedDate || selectedStatus !== 'all' 
          ? 'Try adjusting your filters or search terms to find what you\'re looking for.' 
          : 'Get started by scheduling your first patient appointment. Build your patient base and manage your dental practice efficiently.'}
      </p>
      <div class="flex flex-col sm:flex-row gap-4 justify-center">
        <button
          on:click={showAddAppointmentForm}
          class="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-base md:text-lg transition-all duration-200 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center justify-center gap-2"
        >
          <span class="text-xl">➕</span>
          <span>Schedule First Appointment</span>
        </button>
        {#if searchTerm || selectedDate || selectedStatus !== 'all'}
          <button
            on:click={clearFilters}
            class="w-full sm:w-auto bg-gray-200 hover:bg-gray-300 text-gray-800 px-6 md:px-8 py-3 md:py-4 rounded-lg md:rounded-xl font-bold text-base md:text-lg transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span>✖️</span>
            <span>Clear All Filters</span>
          </button>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Mobile FAB -->
  <div class="lg:hidden fixed bottom-6 right-6 z-40">
    <button
      on:click={showAddAppointmentForm}
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