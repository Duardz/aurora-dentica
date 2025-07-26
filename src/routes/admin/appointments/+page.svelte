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
    'Consultation'
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

  async function deleteAppointment(id: string) {
    if (!db || !confirm('Are you sure you want to delete this appointment?')) return;

    try {
      await deleteDoc(doc(db, 'appointments', id));
      await loadAppointments();
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
</script>

<svelte:head>
  <title>Appointments - Aurora Dentica Admin</title>
</svelte:head>

<!-- Page Header with Stats -->
<div class="mb-6 sm:mb-8">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
    <div>
      <h1 class="text-2xl sm:text-3xl font-bold text-gray-900 mb-2 flex items-center gap-2">
        <span class="text-2xl">📅</span>
        <span>Appointments</span>
      </h1>
      <p class="text-gray-600">Manage patient appointments and schedules</p>
    </div>
    <button
      on:click={showAddAppointmentForm}
      class="btn-primary btn-lg mt-4 sm:mt-0"
    >
      <span>➕</span>
      <span>New Appointment</span>
    </button>
  </div>

  <!-- Quick Stats -->
  <div class="grid grid-cols-2 sm:grid-cols-4 gap-4">
    <div class="card p-4">
      <div class="text-center">
        <div class="text-2xl font-bold text-warning-600">{getTodayCount()}</div>
        <div class="text-sm text-gray-600">Today</div>
      </div>
    </div>
    <div class="card p-4">
      <div class="text-center">
        <div class="text-2xl font-bold text-primary-600">{getUpcomingCount()}</div>
        <div class="text-sm text-gray-600">Upcoming</div>
      </div>
    </div>
    <div class="card p-4">
      <div class="text-center">
        <div class="text-2xl font-bold text-gray-600">{appointments.length}</div>
        <div class="text-sm text-gray-600">Total</div>
      </div>
    </div>
    <div class="card p-4">
      <div class="text-center">
        <div class="text-2xl font-bold text-accent-600">{filteredAppointments.length}</div>
        <div class="text-sm text-gray-600">Filtered</div>
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
        on:click={() => { selectedStatus = 'all'; selectedDate = ''; }}
        class="{selectedStatus === 'all' ? 'btn-primary' : 'btn-ghost'} btn-sm"
      >
        All
      </button>
      <button 
        on:click={() => { selectedStatus = 'today'; selectedDate = ''; }}
        class="{selectedStatus === 'today' ? 'btn-warning' : 'btn-ghost'} btn-sm"
      >
        Today ({getTodayCount()})
      </button>
      <button 
        on:click={() => { selectedStatus = 'upcoming'; selectedDate = ''; }}
        class="{selectedStatus === 'upcoming' ? 'btn-success' : 'btn-ghost'} btn-sm"
      >
        Upcoming ({getUpcomingCount()})
      </button>
      <button 
        on:click={() => { selectedStatus = 'past'; selectedDate = ''; }}
        class="{selectedStatus === 'past' ? 'btn-secondary' : 'btn-ghost'} btn-sm"
      >
        Past
      </button>
    </div>
    
    <!-- Date and Search -->
    <div class="flex flex-col sm:flex-row gap-4 flex-1">
      <div class="flex-1">
        <label for="date-filter" class="block text-sm font-medium text-gray-700 mb-1">
          Specific Date
        </label>
        <input
          id="date-filter"
          type="date"
          bind:value={selectedDate}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
      <div class="flex-1">
        <label for="search" class="block text-sm font-medium text-gray-700 mb-1">
          Search
        </label>
        <input
          id="search"
          type="text"
          placeholder="Patient name, procedure, notes..."
          bind:value={searchTerm}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
        />
      </div>
    </div>
  </div>

  <div class="mt-4 flex items-center justify-between">
    <p class="text-sm text-gray-600">
      Showing {filteredAppointments.length} of {appointments.length} appointments
    </p>
    <button
      on:click={() => { selectedDate = ''; searchTerm = ''; selectedStatus = 'all'; }}
      class="btn-ghost btn-sm"
    >
      Clear Filters
    </button>
  </div>
</div>

<!-- Enhanced Add/Edit Form Modal -->
{#if showAddForm}
  <div class="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
    <div class="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
      <div class="sticky top-0 bg-white px-6 py-4 border-b border-gray-200 rounded-t-2xl">
        <div class="flex items-center justify-between">
          <h2 class="text-xl font-semibold text-gray-900 flex items-center gap-2">
            <span>{editingId ? '✏️' : '➕'}</span>
            <span>{editingId ? 'Edit Appointment' : 'New Appointment'}</span>
          </h2>
          <button
            on:click={cancelForm}
            class="btn-ghost p-2"
            disabled={saving}
          >
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12"></path>
            </svg>
          </button>
        </div>
      </div>

      <form on:submit|preventDefault={saveAppointment} class="p-6 space-y-6">
        
        <!-- Patient Name -->
        <div>
          <label for="patient-name" class="block text-sm font-medium text-gray-700 mb-2">
            Patient Name *
          </label>
          <input
            id="patient-name"
            type="text"
            bind:value={formData.patientName}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {formErrors.patientName ? 'form-error' : ''}"
            placeholder="Enter patient full name"
            required
          />
          {#if formErrors.patientName}
            <p class="error-message">{formErrors.patientName}</p>
          {/if}
        </div>

        <!-- Procedure -->
        <div>
          <label for="procedure" class="block text-sm font-medium text-gray-700 mb-2">
            Procedure *
          </label>
          <select
            id="procedure"
            bind:value={formData.procedure}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {formErrors.procedure ? 'form-error' : ''}"
            required
          >
            <option value="">Select procedure</option>
            {#each commonProcedures as procedure}
              <option value={procedure}>{procedure}</option>
            {/each}
            <option value="Other">Other (specify in notes)</option>
          </select>
          {#if formErrors.procedure}
            <p class="error-message">{formErrors.procedure}</p>
          {/if}
        </div>

        <!-- Date and Time Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="appointment-date" class="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              id="appointment-date"
              type="date"
              bind:value={formData.date}
              min={getTodayDate()}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {formErrors.date ? 'form-error' : ''}"
              required
            />
            {#if formErrors.date}
              <p class="error-message">{formErrors.date}</p>
            {/if}
          </div>

          <div>
            <label for="appointment-time" class="block text-sm font-medium text-gray-700 mb-2">
              Time *
            </label>
            <select
              id="appointment-time"
              bind:value={formData.time}
              class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {formErrors.time ? 'form-error' : ''}"
              required
            >
              <option value="">Select time</option>
              {#each timeSlots as time}
                <option value={time}>{formatTime(time)}</option>
              {/each}
            </select>
            {#if formErrors.time}
              <p class="error-message">{formErrors.time}</p>
            {/if}
          </div>
        </div>

        <!-- Frequency -->
        <div>
          <label for="frequency" class="block text-sm font-medium text-gray-700 mb-2">
            Frequency
          </label>
          <select
            id="frequency"
            bind:value={formData.frequency}
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
          >
            {#each frequencyOptions as frequency}
              <option value={frequency}>{frequency}</option>
            {/each}
          </select>
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
            class="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 resize-none"
            placeholder="Any special instructions, allergies, or additional information..."
          ></textarea>
        </div>

        <!-- Form Actions -->
        <div class="flex flex-col sm:flex-row justify-end gap-3 pt-4 border-t border-gray-200">
          <button
            type="button"
            on:click={cancelForm}
            class="btn-secondary"
            disabled={saving}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            class="btn-primary"
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
      </form>
    </div>
  </div>
{/if}

<!-- Enhanced Appointments List -->
{#if loading}
  <div class="flex justify-center items-center py-16">
    <div class="text-center">
      <div class="loading-spinner h-12 w-12 text-primary-600 mx-auto mb-4"></div>
      <p class="text-gray-600">Loading appointments...</p>
    </div>
  </div>
{:else if filteredAppointments.length > 0}
  <!-- Desktop Table -->
  <div class="hidden lg:block card overflow-hidden">
    <div class="overflow-x-auto">
      <table class="table">
        <thead>
          <tr>
            <th class="w-16">Status</th>
            <th>Patient</th>
            <th>Procedure</th>
            <th>Date & Time</th>
            <th>Frequency</th>
            <th class="w-32">Actions</th>
          </tr>
        </thead>
        <tbody>
          {#each filteredAppointments as appointment}
            {@const status = getAppointmentStatus(appointment.date)}
            <tr class="hover:bg-primary-50">
              <td>
                <span class="{getStatusColor(status)} px-2 py-1 rounded-full text-xs font-medium">
                  {getStatusText(status)}
                </span>
              </td>
              <td>
                <div>
                  <p class="font-medium text-gray-900">{appointment.patientName}</p>
                  {#if appointment.notes}
                    <p class="text-sm text-gray-500 mt-1 line-clamp-2">{appointment.notes}</p>
                  {/if}
                </div>
              </td>
              <td>
                <span class="text-gray-900 font-medium">{appointment.procedure}</span>
              </td>
              <td>
                <div>
                  <p class="font-medium text-gray-900">{formatDisplayDate(appointment.date)}</p>
                  <p class="text-sm text-primary-600 font-medium">{formatTime(appointment.time)}</p>
                </div>
              </td>
              <td>
                <span class="status-neutral">{appointment.frequency}</span>
              </td>
              <td>
                <div class="flex items-center gap-2">
                  <button
                    on:click={() => editAppointment(appointment)}
                    class="btn-ghost btn-sm"
                    title="Edit appointment"
                  >
                    ✏️
                  </button>
                  <button
                    on:click={() => deleteAppointment(appointment.id)}
                    class="btn-ghost btn-sm text-error-600 hover:text-error-700"
                    title="Delete appointment"
                  >
                    🗑️
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
      <div class="card p-4">
        <div class="flex items-start justify-between mb-3">
          <div class="flex-1">
            <div class="flex items-center gap-2 mb-1">
              <h3 class="font-semibold text-gray-900">{appointment.patientName}</h3>
              <span class="{getStatusColor(status)} px-2 py-1 rounded-full text-xs font-medium">
                {getStatusText(status)}
              </span>
            </div>
            <p class="text-sm text-gray-600">{appointment.procedure}</p>
          </div>
          <div class="flex items-center gap-1 ml-4">
            <button
              on:click={() => editAppointment(appointment)}
              class="btn-ghost btn-sm"
            >
              ✏️
            </button>
            <button
              on:click={() => deleteAppointment(appointment.id)}
              class="btn-ghost btn-sm text-error-600"
            >
              🗑️
            </button>
          </div>
        </div>
        
        <div class="grid grid-cols-2 gap-4 mb-3">
          <div>
            <p class="text-xs text-gray-500">Date</p>
            <p class="font-medium text-gray-900">{formatDisplayDate(appointment.date)}</p>
          </div>
          <div>
            <p class="text-xs text-gray-500">Time</p>
            <p class="font-medium text-primary-600">{formatTime(appointment.time)}</p>
          </div>
        </div>

        <div class="flex items-center justify-between">
          <span class="status-neutral">{appointment.frequency}</span>
        </div>

        {#if appointment.notes}
          <div class="mt-3 pt-3 border-t border-gray-100">
            <p class="text-xs text-gray-500 mb-1">Notes</p>
            <p class="text-sm text-gray-600">{appointment.notes}</p>
          </div>
        {/if}
      </div>
    {/each}
  </div>
{:else}
  <!-- Enhanced Empty State -->
  <div class="card p-8 sm:p-12 text-center">
    <div class="text-gray-400 text-5xl sm:text-6xl mb-4">📅</div>
    <h3 class="text-xl font-semibold text-gray-900 mb-2">
      {searchTerm || selectedDate || selectedStatus !== 'all' ? 'No appointments found' : 'No appointments scheduled'}
    </h3>
    <p class="text-gray-500 mb-6 max-w-md mx-auto">
      {searchTerm || selectedDate || selectedStatus !== 'all' 
        ? 'Try adjusting your filters or search terms to find what you\'re looking for.' 
        : 'Get started by scheduling your first patient appointment.'}
    </p>
    <div class="flex flex-col sm:flex-row gap-3 justify-center">
      <button
        on:click={showAddAppointmentForm}
        class="btn-primary"
      >
        <span>➕</span>
        <span>Schedule First Appointment</span>
      </button>
      {#if searchTerm || selectedDate || selectedStatus !== 'all'}
        <button
          on:click={() => { selectedDate = ''; searchTerm = ''; selectedStatus = 'all'; }}
          class="btn-secondary"
        >
          Clear All Filters
        </button>
      {/if}
    </div>
  </div>
{/if}