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
  let selectedDate = getTodayDate();
  let selectedStatus = 'all';

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

  // Debounced search function
  const debouncedSearch = debounce(() => {
    filterAppointments();
  }, 300);

  $: if (searchTerm !== undefined) {
    debouncedSearch();
  }

  $: if (selectedDate || selectedStatus) {
    filterAppointments();
  }

  async function loadAppointments() {
    if (!db) {
      loading = false;
      return;
    }

    try {
      const appointmentsRef = collection(db, 'appointments');
      const q = query(appointmentsRef, orderBy('date', 'desc'), orderBy('time', 'asc'));
      
      const snapshot = await getDocs(q);
      appointments = snapshot.docs.map(doc => {
        const data = doc.data();
        return decryptFields({
          id: doc.id,
          patientName: data.patientName || '',
          procedure: data.procedure || '',
          date: data.date,
          time: data.time,
          frequency: data.frequency,
          notes: data.notes || '',
          createdAt: data.createdAt
        }, ['patientName', 'procedure', 'notes']);
      });

      filterAppointments();
    } catch (error) {
      console.error('Error loading appointments:', error);
    } finally {
      loading = false;
    }
  }

  function filterAppointments() {
    let filtered = appointments;

    // Filter by date
    if (selectedDate) {
      if (selectedStatus === 'today') {
        filtered = filtered.filter(apt => apt.date === getTodayDate());
      } else if (selectedStatus === 'upcoming') {
        filtered = filtered.filter(apt => apt.date > getTodayDate());
      } else if (selectedStatus === 'past') {
        filtered = filtered.filter(apt => apt.date < getTodayDate());
      } else {
        filtered = filtered.filter(apt => apt.date === selectedDate);
      }
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(search) ||
        apt.procedure.toLowerCase().includes(search) ||
        (apt.notes && apt.notes.toLowerCase().includes(search))
      );
    }

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
      case 'today': return 'status-warning';
      case 'upcoming': return 'status-active';
      case 'past': return 'status-neutral';
      default: return 'status-neutral';
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

  function getTodayCount(): number {
    return appointments.filter(apt => apt.date === getTodayDate()).length;
  }

  function getUpcomingCount(): number {
    return appointments.filter(apt => apt.date > getTodayDate()).length;
  }

  function getPastCount(): number {
    return appointments.filter(apt => apt.date < getTodayDate()).length;
  }

  function clearFilters() {
    selectedStatus = 'all';
    selectedDate = '';
    searchTerm = '';
  }
</script>

<svelte:head>
  <title>Appointments - Aurora Dentica Admin</title>
</svelte:head>

<!-- Enhanced Page Header with Stats -->
<div class="mb-8">
  <div class="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-8">
    <div>
      <div class="flex items-center gap-3 mb-4">
        <div class="p-3 bg-gradient-to-br from-primary-500 to-accent-500 rounded-2xl shadow-lg">
          <span class="text-2xl text-white">📅</span>
        </div>
        <div>
          <h1 class="text-3xl sm:text-4xl font-bold text-gray-900">Appointments</h1>
          <p class="text-gray-600 text-lg">Manage patient appointments and schedules</p>
        </div>
      </div>
    </div>
    <div class="flex flex-col sm:flex-row gap-3">
      <button
        on:click={showAddAppointmentForm}
        class="btn-primary btn-lg dental-glow group"
      >
        <span class="text-xl group-hover:scale-110 transition-transform duration-300">➕</span>
        <span>New Appointment</span>
      </button>
    </div>
  </div>

  <!-- Enhanced Stats Cards -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4 lg:gap-6">
    <div class="card p-6 border-l-4 border-warning-500 hover:shadow-lg transition-all duration-300 dental-glow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-warning-700 uppercase tracking-wide">Today</p>
          <p class="text-3xl font-bold text-warning-900">{getTodayCount()}</p>
          <p class="text-xs text-gray-500 mt-1">Scheduled now</p>
        </div>
        <div class="text-warning-600 text-3xl opacity-80">📅</div>
      </div>
    </div>

    <div class="card p-6 border-l-4 border-primary-500 hover:shadow-lg transition-all duration-300 dental-glow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-primary-700 uppercase tracking-wide">Upcoming</p>
          <p class="text-3xl font-bold text-primary-900">{getUpcomingCount()}</p>
          <p class="text-xs text-gray-500 mt-1">Future appointments</p>
        </div>
        <div class="text-primary-600 text-3xl opacity-80">🗓️</div>
      </div>
    </div>

    <div class="card p-6 border-l-4 border-gray-500 hover:shadow-lg transition-all duration-300 dental-glow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-gray-700 uppercase tracking-wide">Past</p>
          <p class="text-3xl font-bold text-gray-900">{getPastCount()}</p>
          <p class="text-xs text-gray-500 mt-1">Completed visits</p>
        </div>
        <div class="text-gray-600 text-3xl opacity-80">📋</div>
      </div>
    </div>

    <div class="card p-6 border-l-4 border-accent-500 hover:shadow-lg transition-all duration-300 dental-glow">
      <div class="flex items-center justify-between">
        <div>
          <p class="text-sm font-semibold text-accent-700 uppercase tracking-wide">Total</p>
          <p class="text-3xl font-bold text-accent-900">{appointments.length}</p>
          <p class="text-xs text-gray-500 mt-1">All appointments</p>
        </div>
        <div class="text-accent-600 text-3xl opacity-80">📊</div>
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
        on:click={() => { selectedStatus = 'all'; selectedDate = ''; }}
        class="{selectedStatus === 'all' ? 'btn-primary' : 'btn-ghost'} btn-sm transition-all duration-300"
      >
        <span class="mr-2">📊</span>
        <span>All ({appointments.length})</span>
      </button>
      <button 
        on:click={() => { selectedStatus = 'today'; selectedDate = ''; }}
        class="{selectedStatus === 'today' ? 'btn-warning' : 'btn-ghost'} btn-sm transition-all duration-300"
      >
        <span class="mr-2">📅</span>
        <span>Today ({getTodayCount()})</span>
      </button>
      <button 
        on:click={() => { selectedStatus = 'upcoming'; selectedDate = ''; }}
        class="{selectedStatus === 'upcoming' ? 'btn-success' : 'btn-ghost'} btn-sm transition-all duration-300"
      >
        <span class="mr-2">🗓️</span>
        <span>Upcoming ({getUpcomingCount()})</span>
      </button>
      <button 
        on:click={() => { selectedStatus = 'past'; selectedDate = ''; }}
        class="{selectedStatus === 'past' ? 'btn-secondary' : 'btn-ghost'} btn-sm transition-all duration-300"
      >
        <span class="mr-2">📋</span>
        <span>Past ({getPastCount()})</span>
      </button>
    </div>
    
    <!-- Date and Search Filters -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-4">
      <div>
        <label for="date-filter" class="block text-sm font-semibold text-gray-700 mb-2">
          Filter by Date
        </label>
        <input
          id="date-filter"
          type="date"
          bind:value={selectedDate}
          class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
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
            class="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
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
        <span>Showing <strong>{filteredAppointments.length}</strong> of <strong>{appointments.length}</strong> appointments</span>
      </p>
      {#if searchTerm || selectedDate || selectedStatus !== 'all'}
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
            <div class="p-2 bg-gradient-to-br from-primary-500 to-accent-500 rounded-xl">
              <span class="text-xl text-white">{editingId ? '✏️' : '➕'}</span>
            </div>
            <div>
              <h2 class="text-2xl font-bold text-gray-900">
                {editingId ? 'Edit Appointment' : 'New Appointment'}
              </h2>
              <p class="text-gray-500 text-sm">
                {editingId ? 'Update appointment details' : 'Schedule a new patient visit'}
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
        <form on:submit|preventDefault={saveAppointment} class="space-y-8">
          
          <!-- Patient Information Section -->
          <div class="bg-gray-50 rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span class="text-xl">👤</span>
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
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 {formErrors.patientName ? 'form-error' : ''}"
                placeholder="Enter patient's full name"
                required
              />
              {#if formErrors.patientName}
                <p class="error-message mt-2">
                  <span>⚠️</span>
                  <span>{formErrors.patientName}</span>
                </p>
              {/if}
            </div>
          </div>

          <!-- Appointment Details Section -->
          <div class="bg-primary-50 rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span class="text-xl">🏥</span>
              <span>Appointment Details</span>
            </h3>
            
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <!-- Procedure -->
              <div>
                <label for="procedure" class="block text-sm font-semibold text-gray-700 mb-2">
                  Procedure/Treatment *
                </label>
                <select
                  id="procedure"
                  bind:value={formData.procedure}
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 {formErrors.procedure ? 'form-error' : ''}"
                  required
                >
                  <option value="">Select procedure type</option>
                  {#each commonProcedures as procedure}
                    <option value={procedure}>{procedure}</option>
                  {/each}
                  <option value="Other">Other (specify in notes)</option>
                </select>
                {#if formErrors.procedure}
                  <p class="error-message mt-2">
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
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300"
                >
                  {#each frequencyOptions as frequency}
                    <option value={frequency}>{frequency}</option>
                  {/each}
                </select>
              </div>
            </div>
          </div>

          <!-- Schedule Section -->
          <div class="bg-accent-50 rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span class="text-xl">📅</span>
              <span>Schedule</span>
            </h3>
            
            <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 {formErrors.date ? 'form-error' : ''}"
                  required
                />
                {#if formErrors.date}
                  <p class="error-message mt-2">
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
                  class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-300 {formErrors.time ? 'form-error' : ''}"
                  required
                >
                  <option value="">Select time slot</option>
                  {#each timeSlots as time}
                    <option value={time}>{formatTime(time)}</option>
                  {/each}
                </select>
                {#if formErrors.time}
                  <p class="error-message mt-2">
                    <span>⚠️</span>
                    <span>{formErrors.time}</span>
                  </p>
                {/if}
              </div>
            </div>
          </div>

          <!-- Notes Section -->
          <div class="bg-warning-50 rounded-2xl p-6">
            <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <span class="text-xl">📝</span>
              <span>Additional Notes</span>
            </h3>
            <div>
              <label for="notes" class="block text-sm font-semibold text-gray-700 mb-2">
                Special Instructions or Notes (Optional)
              </label>
              <textarea
                id="notes"
                bind:value={formData.notes}
                rows="4"
                class="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none transition-all duration-300"
                placeholder="Any special instructions, allergies, follow-up requirements, or additional information..."
              ></textarea>
            </div>
          </div>

          <!-- Preview Section -->
          {#if formData.patientName && formData.procedure && formData.date && formData.time}
            <div class="bg-gradient-to-r from-gray-50 to-primary-50 rounded-2xl p-6 border-2 border-dashed border-primary-200">
              <h3 class="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span class="text-xl">👁️</span>
                <span>Appointment Preview</span>
              </h3>
              <div class="bg-white rounded-xl p-4 border border-primary-200">
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
                    <p class="font-semibold text-primary-700">
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
            on:click={saveAppointment}
            disabled={saving || !formData.patientName || !formData.procedure || !formData.date || !formData.time}
            class="btn-primary order-1 sm:order-2 dental-glow"
          >
            {#if saving}
              <div class="loading-spinner"></div>
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
  <div class="modal-overlay">
    <div class="modal-content max-w-md">
      <div class="modal-header">
        <div class="flex items-center gap-3">
          <div class="p-2 bg-error-500 rounded-xl">
            <span class="text-xl text-white">🗑️</span>
          </div>
          <div>
            <h2 class="text-xl font-bold text-gray-900">Delete Appointment</h2>
            <p class="text-gray-500 text-sm">This action cannot be undone</p>
          </div>
        </div>
      </div>
      <div class="modal-body">
        <div class="text-center">
          <div class="text-6xl mb-4">⚠️</div>
          <p class="text-gray-600 mb-6">
            Are you sure you want to delete this appointment? This action is permanent and cannot be reversed.
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
            on:click={deleteAppointment}
            class="btn-danger order-1 sm:order-2"
          >
            <span>🗑️</span>
            <span>Delete Appointment</span>
          </button>
        </div>
      </div>
    </div>
  </div>
{/if}

<!-- Enhanced Appointments List -->
{#if loading}
  <div class="flex justify-center items-center py-20">
    <div class="text-center">
      <div class="relative mb-6">
        <div class="loading-spinner h-16 w-16 text-primary-600 mx-auto"></div>
        <div class="absolute inset-0 flex items-center justify-center">
          <span class="text-2xl">📅</span>
        </div>
      </div>
      <h3 class="text-xl font-semibold text-gray-900 mb-2">Loading Appointments</h3>
      <p class="text-gray-600">Please wait while we fetch your appointment data...</p>
    </div>
  </div>
{:else if filteredAppointments.length > 0}
  <!-- Desktop Table -->
  <div class="hidden lg:block card overflow-hidden dental-glow">
    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th class="w-20">Status</th>
            <th>Patient & Notes</th>
            <th>Procedure</th>
            <th>Date & Time</th>
            <th>Frequency</th>
            <th class="w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredAppointments as appointment}
            {@const status = getAppointmentStatus(appointment.date)}
            <tr class="hover:bg-gradient-to-r hover:from-primary-50 hover:to-accent-50 transition-all duration-300">
              <td>
                <span class="{getStatusColor(status)} px-3 py-2 rounded-xl text-xs font-bold uppercase tracking-wide">
                  {getStatusText(status)}
                </span>
              </td>
              <td>
                <div>
                  <p class="font-semibold text-gray-900 text-lg">{appointment.patientName}</p>
                  {#if appointment.notes}
                    <p class="text-sm text-gray-600 mt-1 line-clamp-2 bg-gray-50 rounded-lg p-2 italic">
                      💬 {appointment.notes}
                    </p>
                  {/if}
                </div>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <span class="text-lg">🏥</span>
                  <span class="text-gray-900 font-medium">{appointment.procedure}</span>
                </div>
              </td>
              <td>
                <div class="space-y-1">
                  <p class="font-semibold text-gray-900 flex items-center gap-2">
                    <span class="text-sm">📅</span>
                    <span>{formatDisplayDate(appointment.date)}</span>
                  </p>
                  <p class="text-sm text-primary-600 font-semibold flex items-center gap-2">
                    <span class="text-sm">🕐</span>
                    <span>{formatTime(appointment.time)}</span>
                  </p>
                </div>
              </td>
              <td>
                <span class="status-neutral">{appointment.frequency}</span>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <button
                    on:click={() => editAppointment(appointment)}
                    class="btn-ghost btn-sm hover:bg-primary-100 hover:text-primary-700 transition-all duration-300"
                    title="Edit appointment"
                  >
                    <span class="text-lg">✏️</span>
                  </button>
                  <button
                    on:click={() => confirmDelete(appointment.id)}
                    class="btn-ghost btn-sm text-error-600 hover:text-error-700 hover:bg-error-100 transition-all duration-300"
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
  <div class="lg:hidden space-y-4">
    {#each filteredAppointments as appointment}
      {@const status = getAppointmentStatus(appointment.date)}
      <div class="card p-6 dental-glow hover:shadow-xl transition-all duration-300">
        <div class="flex items-start justify-between mb-4">
          <div class="flex-1">
            <div class="flex items-center gap-3 mb-2">
              <h3 class="font-bold text-gray-900 text-lg">{appointment.patientName}</h3>
              <span class="{getStatusColor(status)} px-3 py-1 rounded-xl text-xs font-bold uppercase tracking-wide">
                {getStatusText(status)}
              </span>
            </div>
            <p class="text-gray-600 flex items-center gap-2">
              <span class="text-lg">🏥</span>
              <span>{appointment.procedure}</span>
            </p>
          </div>
          <div class="flex items-center gap-2 ml-4">
            <button
              on:click={() => editAppointment(appointment)}
              class="btn-ghost btn-sm p-3 hover:bg-primary-100 hover:text-primary-700 transition-all duration-300"
            >
              <span class="text-lg">✏️</span>
            </button>
            <button
              on:click={() => confirmDelete(appointment.id)}
              class="btn-ghost btn-sm p-3 text-error-600 hover:text-error-700 hover:bg-error-100 transition-all duration-300"
            >
              <span class="text-lg">🗑️</span>
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-4">
          <div class="bg-gray-50 rounded-xl p-3">
            <p class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Date</p>
            <p class="font-semibold text-gray-900 flex items-center gap-2">
              <span>📅</span>
              <span>{formatDisplayDate(appointment.date)}</span>
            </p>
          </div>
          <div class="bg-primary-50 rounded-xl p-3">
            <p class="text-xs text-gray-500 uppercase tracking-wide font-semibold">Time</p>
            <p class="font-semibold text-primary-700 flex items-center gap-2">
              <span>🕐</span>
              <span>{formatTime(appointment.time)}</span>
            </p>
          </div>
        </div>

        <div class="flex items-center justify-between mb-4">
          <span class="status-neutral">{appointment.frequency}</span>
        </div>

        {#if appointment.notes}
          <div class="mt-4 pt-4 border-t border-gray-200">
            <p class="text-xs text-gray-500 uppercase tracking-wide font-semibold mb-2">Notes</p>
            <div class="bg-gray-50 rounded-xl p-3">
              <p class="text-sm text-gray-700 italic flex items-start gap-2">
                <span class="text-lg flex-shrink-0">💬</span>
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
  <div class="card p-12 sm:p-16 text-center dental-glow">
    <div class="text-gray-400 text-6xl sm:text-7xl mb-6 animate-pulse-subtle">📅</div>
    <h3 class="text-2xl font-bold text-gray-900 mb-4">
      {searchTerm || selectedDate || selectedStatus !== 'all' ? 'No appointments found' : 'No appointments scheduled'}
    </h3>
    <p class="text-gray-500 mb-8 max-w-md mx-auto text-lg leading-relaxed">
      {searchTerm || selectedDate || selectedStatus !== 'all' 
        ? 'Try adjusting your filters or search terms to find what you\'re looking for.' 
        : 'Get started by scheduling your first patient appointment. Build your patient base and manage your dental practice efficiently.'}
    </p>
    <div class="flex flex-col sm:flex-row gap-4 justify-center">
      <button
        on:click={showAddAppointmentForm}
        class="btn-primary btn-lg dental-glow"
      >
        <span class="text-xl">➕</span>
        <span>Schedule First Appointment</span>
      </button>
      {#if searchTerm || selectedDate || selectedStatus !== 'all'}
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

<style>
  /* Enhanced modal animations */
  .modal-overlay {
    animation: fadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .modal-content {
    animation: slideInUp 0.4s cubic-bezier(0.4, 0, 0.2, 1);
  }

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }

  @keyframes slideInUp {
    from {
      opacity: 0;
      transform: translateY(40px) scale(0.95);
    }
    to {
      opacity: 1;
      transform: translateY(0) scale(1);
    }
  }

  /* Enhanced table row animations */
  .table tbody tr {
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  .table tbody tr:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  }

  /* Enhanced form section styles */
  .modal-body > form > div {
    transition: all 0.3s ease;
  }

  .modal-body > form > div:hover {
    transform: translateY(-2px);
  }

  /* Line clamp utility */
  .line-clamp-2 {
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    line-clamp: 2;
  }

  /* Enhanced button hover effects */
  .btn-ghost:hover {
    transform: translateY(-1px);
  }

  /* Loading animation enhancements */
  .loading-spinner {
    animation: spin 1s linear infinite, pulse 2s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% {
      opacity: 1;
    }
    50% {
      opacity: 0.7;
    }
  }

  /* Card hover effects */
  .card:hover {
    border-color: rgb(59 130 246 / 0.3);
  }

  /* Status badge enhancements */
  .status-active,
  .status-warning,
  .status-error,
  .status-neutral {
    position: relative;
    overflow: hidden;
  }

  .status-active::before,
  .status-warning::before,
  .status-error::before,
  .status-neutral::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.3), transparent);
    transition: left 0.5s;
  }

  .status-active:hover::before,
  .status-warning:hover::before,
  .status-error:hover::before,
  .status-neutral:hover::before {
    left: 100%;
  }
</style>