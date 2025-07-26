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
    'Emergency Visit'
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

  $: if (selectedDate) {
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
      filtered = filtered.filter(apt => apt.date === selectedDate);
    }

    // Filter by search term
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase();
      filtered = filtered.filter(apt => 
        apt.patientName.toLowerCase().includes(search) ||
        apt.procedure.toLowerCase().includes(search)
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
</script>

<svelte:head>
  <title>Appointments - Aurora Dentica Admin</title>
</svelte:head>

<!-- Page Header -->
<div class="mb-8">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between">
    <div>
      <h1 class="text-3xl font-bold text-gray-900 mb-2">Appointments</h1>
      <p class="text-gray-600">Manage patient appointments and schedules</p>
    </div>
    <button
      on:click={showAddAppointmentForm}
      class="mt-4 sm:mt-0 bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors inline-flex items-center space-x-2"
    >
      <span>➕</span>
      <span>Add Appointment</span>
    </button>
  </div>
</div>

<!-- Filters -->
<div class="bg-white rounded-xl shadow-card border border-gray-100 p-6 mb-8">
  <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
    <!-- Date Filter -->
    <div>
      <label for="date-filter" class="block text-sm font-medium text-gray-700 mb-2">
        Filter by Date
      </label>
      <input
        id="date-filter"
        type="date"
        bind:value={selectedDate}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
    </div>

    <!-- Search -->
    <div>
      <label for="search" class="block text-sm font-medium text-gray-700 mb-2">
        Search Patients
      </label>
      <input
        id="search"
        type="text"
        placeholder="Search by patient name or procedure..."
        bind:value={searchTerm}
        class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
      />
    </div>
  </div>

  <div class="mt-4 flex items-center justify-between">
    <p class="text-sm text-gray-600">
      Showing {filteredAppointments.length} appointment{filteredAppointments.length !== 1 ? 's' : ''}
      {selectedDate ? `for ${formatDisplayDate(selectedDate)}` : ''}
    </p>
    <button
      on:click={() => { selectedDate = ''; searchTerm = ''; }}
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
      <div class="px-6 py-4 border-b border-gray-200">
        <h2 class="text-xl font-semibold text-gray-900">
          {editingId ? 'Edit Appointment' : 'Add New Appointment'}
        </h2>
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
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {formErrors.patientName ? 'border-red-500' : ''}"
            placeholder="Enter patient name"
            required
          />
          {#if formErrors.patientName}
            <p class="mt-1 text-sm text-red-600">{formErrors.patientName}</p>
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
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {formErrors.procedure ? 'border-red-500' : ''}"
            required
          >
            <option value="">Select procedure</option>
            {#each commonProcedures as procedure}
              <option value={procedure}>{procedure}</option>
            {/each}
            <option value="Other">Other</option>
          </select>
          {#if formData.procedure === 'Other'}
            <input
              type="text"
              bind:value={formData.procedure}
              placeholder="Enter custom procedure"
              class="w-full mt-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            />
          {/if}
          {#if formErrors.procedure}
            <p class="mt-1 text-sm text-red-600">{formErrors.procedure}</p>
          {/if}
        </div>

        <!-- Date and Time -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label for="appointment-date" class="block text-sm font-medium text-gray-700 mb-2">
              Date *
            </label>
            <input
              id="appointment-date"
              type="date"
              bind:value={formData.date}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {formErrors.date ? 'border-red-500' : ''}"
              required
            />
            {#if formErrors.date}
              <p class="mt-1 text-sm text-red-600">{formErrors.date}</p>
            {/if}
          </div>

          <div>
            <label for="appointment-time" class="block text-sm font-medium text-gray-700 mb-2">
              Time *
            </label>
            <input
              id="appointment-time"
              type="time"
              bind:value={formData.time}
              class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500 {formErrors.time ? 'border-red-500' : ''}"
              required
            />
            {#if formErrors.time}
              <p class="mt-1 text-sm text-red-600">{formErrors.time}</p>
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
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
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
            class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
            placeholder="Additional notes about the appointment..."
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
              <span>{editingId ? 'Update' : 'Save'} Appointment</span>
            {/if}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}

<!-- Appointments List -->
{#if loading}
  <div class="flex justify-center items-center py-16">
    <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
  </div>
{:else if filteredAppointments.length > 0}
  <div class="bg-white rounded-xl shadow-card border border-gray-100 overflow-hidden">
    
    <!-- Desktop Table -->
    <div class="hidden md:block overflow-x-auto">
      <table class="w-full">
        <thead class="bg-gray-50 border-b border-gray-200">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Patient</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Procedure</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date & Time</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Frequency</th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-200">
          {#each filteredAppointments as appointment}
            <tr class="hover:bg-gray-50">
              <td class="px-6 py-4">
                <div>
                  <p class="font-medium text-gray-900">{appointment.patientName}</p>
                  {#if appointment.notes}
                    <p class="text-sm text-gray-500 mt-1">{appointment.notes}</p>
                  {/if}
                </div>
              </td>
              <td class="px-6 py-4 text-gray-900">{appointment.procedure}</td>
              <td class="px-6 py-4">
                <div>
                  <p class="font-medium text-gray-900">{formatDisplayDate(appointment.date)}</p>
                  <p class="text-sm text-primary-600">{formatTime(appointment.time)}</p>
                </div>
              </td>
              <td class="px-6 py-4">
                <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                  {appointment.frequency}
                </span>
              </td>
              <td class="px-6 py-4">
                <div class="flex items-center space-x-3">
                  <button
                    on:click={() => editAppointment(appointment)}
                    class="text-primary-600 hover:text-primary-700 font-medium text-sm"
                  >
                    Edit
                  </button>
                  <button
                    on:click={() => deleteAppointment(appointment.id)}
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
      {#each filteredAppointments as appointment}
        <div class="p-6">
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="font-medium text-gray-900">{appointment.patientName}</h3>
              <p class="text-sm text-gray-600">{appointment.procedure}</p>
            </div>
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              {appointment.frequency}
            </span>
          </div>
          
          <div class="flex items-center justify-between mb-4">
            <div>
              <p class="text-sm font-medium text-gray-900">{formatDisplayDate(appointment.date)}</p>
              <p class="text-sm text-primary-600">{formatTime(appointment.time)}</p>
            </div>
          </div>

          {#if appointment.notes}
            <p class="text-sm text-gray-500 mb-4">{appointment.notes}</p>
          {/if}

          <div class="flex justify-end space-x-3">
            <button
              on:click={() => editAppointment(appointment)}
              class="text-primary-600 hover:text-primary-700 font-medium text-sm"
            >
              Edit
            </button>
            <button
              on:click={() => deleteAppointment(appointment.id)}
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
    <div class="text-gray-400 text-6xl mb-4">📅</div>
    <h3 class="text-lg font-medium text-gray-900 mb-2">
      {searchTerm || selectedDate ? 'No appointments found' : 'No appointments scheduled'}
    </h3>
    <p class="text-gray-500 mb-6">
      {searchTerm || selectedDate 
        ? 'Try adjusting your filters or search terms' 
        : 'Get started by adding your first appointment'}
    </p>
    <button
      on:click={showAddAppointmentForm}
      class="bg-primary-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-primary-700 transition-colors"
    >
      Add First Appointment
    </button>
  </div>
{/if}