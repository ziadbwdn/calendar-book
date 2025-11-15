/**
 * Organizer Dashboard page
 * Handles settings management, bookings overview, and sharing
 */

import { OrganizerService } from '../services/organizer.service';
import { AuthService } from '../services/auth.service';
import type { OrganizerSettings, WorkingHour } from '../types/organizer';
import type { Booking } from '../types/booking';
import { ApiError } from '../services/api';
import { createErrorAlertFromApiError } from '../components/error-alert';
import { showSuccessMessage } from '../components/success-alert';
import { createLoadingSpinner } from '../components/loading';
import { TIMEZONES, DAYS_OF_WEEK } from '../utils/constants';
import { formatDateTimeInTimezone } from '../utils/date';

export type DashboardTab = 'settings' | 'bookings' | 'share';

export interface DashboardOptions {
  initialTab?: DashboardTab;
}

/**
 * Create organizer dashboard page
 */
export function createOrganizerDashboard(options: DashboardOptions = {}): HTMLElement {
  const { initialTab = 'settings' } = options;

  const page = document.createElement('div');
  page.className = 'organizer-dashboard';

  // Tab navigation
  const tabs = createTabNavigation(initialTab);
  page.appendChild(tabs);

  // Tab content container
  const contentContainer = document.createElement('div');
  contentContainer.id = 'dashboard-content';
  contentContainer.style.marginTop = '2rem';
  page.appendChild(contentContainer);

  // Render initial tab
  renderTab(contentContainer, initialTab);

  return page;
}

/**
 * Create tab navigation
 */
function createTabNavigation(activeTab: DashboardTab): HTMLElement {
  const nav = document.createElement('div');
  nav.style.borderBottom = '2px solid #e0e0e0';
  nav.style.display = 'flex';
  nav.style.gap = '1rem';

  const tabs: { id: DashboardTab; label: string }[] = [
    { id: 'settings', label: 'Settings' },
    { id: 'bookings', label: 'Bookings' },
    { id: 'share', label: 'Share Link' },
  ];

  tabs.forEach((tab) => {
    const button = document.createElement('button');
    button.textContent = tab.label;
    button.style.padding = '1rem 1.5rem';
    button.style.border = 'none';
    button.style.background = 'none';
    button.style.cursor = 'pointer';
    button.style.fontSize = '1rem';
    button.style.fontWeight = '500';
    button.style.borderBottom = '2px solid transparent';
    button.style.marginBottom = '-2px';
    button.style.transition = 'all 0.3s ease';

    if (tab.id === activeTab) {
      button.style.color = '#2c3e50';
      button.style.borderBottomColor = '#2c3e50';
    } else {
      button.style.color = '#666';
    }

    button.addEventListener('click', () => {
      // Update active state
      nav.querySelectorAll('button').forEach((btn) => {
        btn.style.color = '#666';
        btn.style.borderBottomColor = 'transparent';
      });
      button.style.color = '#2c3e50';
      button.style.borderBottomColor = '#2c3e50';

      // Render tab content
      const contentContainer = document.getElementById('dashboard-content');
      if (contentContainer) {
        renderTab(contentContainer, tab.id);
      }
    });

    nav.appendChild(button);
  });

  return nav;
}

/**
 * Render tab content
 */
function renderTab(container: HTMLElement, tab: DashboardTab): void {
  container.innerHTML = '';

  if (tab === 'settings') {
    container.appendChild(createSettingsTab());
  } else if (tab === 'bookings') {
    container.appendChild(createBookingsTab());
  } else if (tab === 'share') {
    container.appendChild(createShareTab());
  }
}

/**
 * Create settings tab
 */
function createSettingsTab(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'settings-tab';

  // Loading state
  const loading = createLoadingSpinner({ text: 'Loading settings...', fullPage: true });
  container.appendChild(loading);

  // Fetch settings
  fetchAndRenderSettings(container);

  return container;
}

/**
 * Fetch and render settings form
 */
async function fetchAndRenderSettings(container: HTMLElement): Promise<void> {
  try {
    let settings = await OrganizerService.getSettings();

    // If no settings exist, provide defaults
    if (!settings) {
      settings = {
        id: '',
        userId: '',
        timezone: 'America/New_York',
        workingHours: [
          { day: 1, start: '09:00', end: '17:00' },
          { day: 2, start: '09:00', end: '17:00' },
          { day: 3, start: '09:00', end: '17:00' },
          { day: 4, start: '09:00', end: '17:00' },
          { day: 5, start: '09:00', end: '17:00' },
        ],
        meetingDuration: 30,
        bufferBefore: 0,
        bufferAfter: 0,
        minimumNotice: 24,
        blackoutDates: [],
        createdAt: new Date(),
        updatedAt: new Date(),
      };
    }

    // Remove loading
    container.innerHTML = '';

    // Render form
    const form = createSettingsForm(settings, container);
    container.appendChild(form);
  } catch (error) {
    container.innerHTML = '';
    if (error instanceof ApiError) {
      container.appendChild(createErrorAlertFromApiError(error));
    } else {
      container.appendChild(
        createErrorAlertFromApiError(new ApiError(0, 'Failed to load settings'))
      );
    }
  }
}

/**
 * Create settings form
 */
function createSettingsForm(settings: OrganizerSettings, container: HTMLElement): HTMLElement {
  const card = document.createElement('div');
  card.className = 'card';

  const title = document.createElement('h2');
  title.className = 'card-title';
  title.textContent = 'Organizer Settings';
  card.appendChild(title);

  // Error container
  const errorContainer = document.createElement('div');
  errorContainer.id = 'settings-error-container';
  card.appendChild(errorContainer);

  const form = document.createElement('form');
  form.id = 'settings-form';

  // Timezone
  const timezoneGroup = createSelectGroup(
    'timezone',
    'Timezone',
    TIMEZONES.map((tz) => ({ value: tz, label: tz })),
    settings.timezone
  );
  form.appendChild(timezoneGroup);

  // Meeting Duration
  const durationGroup = createNumberGroup(
    'meetingDuration',
    'Meeting Duration (minutes)',
    settings.meetingDuration,
    15,
    240,
    15
  );
  form.appendChild(durationGroup);

  // Buffer Before
  const bufferBeforeGroup = createNumberGroup(
    'bufferBefore',
    'Buffer Before Meeting (minutes)',
    settings.bufferBefore,
    0,
    60,
    5
  );
  form.appendChild(bufferBeforeGroup);

  // Buffer After
  const bufferAfterGroup = createNumberGroup(
    'bufferAfter',
    'Buffer After Meeting (minutes)',
    settings.bufferAfter,
    0,
    60,
    5
  );
  form.appendChild(bufferAfterGroup);

  // Minimum Notice
  const minNoticeGroup = createNumberGroup(
    'minimumNotice',
    'Minimum Notice (hours)',
    settings.minimumNotice,
    0,
    72,
    1
  );
  form.appendChild(minNoticeGroup);

  // Working Hours
  const workingHoursSection = createWorkingHoursSection(settings.workingHours);
  form.appendChild(workingHoursSection);

  // Blackout Dates
  const blackoutDatesSection = createBlackoutDatesSection(settings.blackoutDates);
  form.appendChild(blackoutDatesSection);

  // Submit button
  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.textContent = 'Save Settings';
  submitBtn.style.marginTop = '1rem';
  form.appendChild(submitBtn);

  // Form submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    errorContainer.innerHTML = '';

    // Get form values
    const timezone = (form.querySelector('#timezone') as HTMLSelectElement).value;
    const meetingDuration = parseInt(
      (form.querySelector('#meetingDuration') as HTMLInputElement).value
    );
    const bufferBefore = parseInt(
      (form.querySelector('#bufferBefore') as HTMLInputElement).value
    );
    const bufferAfter = parseInt(
      (form.querySelector('#bufferAfter') as HTMLInputElement).value
    );
    const minimumNotice = parseInt(
      (form.querySelector('#minimumNotice') as HTMLInputElement).value
    );

    // Get working hours
    const workingHours = getWorkingHoursFromForm(form);

    // Get blackout dates
    const blackoutDates = getBlackoutDatesFromForm(form);

    // Disable submit
    submitBtn.disabled = true;
    submitBtn.textContent = 'Saving...';

    try {
      await OrganizerService.updateSettings({
        timezone,
        meetingDuration,
        bufferBefore,
        bufferAfter,
        minimumNotice,
        workingHours,
        blackoutDates,
      });

      showSuccessMessage(errorContainer, 'Settings saved successfully!');

      // Re-fetch and re-render
      setTimeout(() => {
        fetchAndRenderSettings(container);
      }, 1500);
    } catch (error) {
      if (error instanceof ApiError) {
        errorContainer.appendChild(createErrorAlertFromApiError(error));
      } else {
        errorContainer.appendChild(
          createErrorAlertFromApiError(new ApiError(0, 'Failed to save settings'))
        );
      }

      submitBtn.disabled = false;
      submitBtn.textContent = 'Save Settings';
    }
  });

  card.appendChild(form);
  return card;
}

/**
 * Create working hours section
 */
function createWorkingHoursSection(workingHours: WorkingHour[]): HTMLElement {
  const section = document.createElement('div');
  section.className = 'form-group';
  section.style.marginTop = '2rem';

  const label = document.createElement('label');
  label.textContent = 'Working Hours';
  label.style.display = 'block';
  label.style.marginBottom = '1rem';
  label.style.fontSize = '1.125rem';
  label.style.fontWeight = '600';
  section.appendChild(label);

  const hoursContainer = document.createElement('div');
  hoursContainer.id = 'working-hours-container';
  section.appendChild(hoursContainer);

  // Add existing working hours
  workingHours.forEach((wh) => {
    hoursContainer.appendChild(createWorkingHourRow(wh));
  });

  // Add button
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn btn-secondary';
  addBtn.textContent = '+ Add Working Hours';
  addBtn.style.marginTop = '0.5rem';
  addBtn.addEventListener('click', () => {
    hoursContainer.appendChild(createWorkingHourRow());
  });
  section.appendChild(addBtn);

  return section;
}

/**
 * Create working hour row
 */
function createWorkingHourRow(workingHour?: WorkingHour): HTMLElement {
  const row = document.createElement('div');
  row.className = 'working-hour-row';
  row.style.display = 'flex';
  row.style.gap = '1rem';
  row.style.marginBottom = '0.75rem';
  row.style.alignItems = 'center';

  // Day selector
  const daySelect = document.createElement('select');
  daySelect.name = 'day';
  daySelect.style.flex = '1';
  daySelect.style.padding = '0.75rem';
  daySelect.style.border = '1px solid #ddd';
  daySelect.style.borderRadius = '4px';

  DAYS_OF_WEEK.forEach((day) => {
    const option = document.createElement('option');
    option.value = String(day.value);
    option.textContent = day.label;
    if (workingHour && day.value === workingHour.day) {
      option.selected = true;
    }
    daySelect.appendChild(option);
  });

  // Start time
  const startInput = document.createElement('input');
  startInput.type = 'time';
  startInput.name = 'start';
  startInput.value = workingHour?.start || '09:00';
  startInput.style.flex = '1';
  startInput.style.padding = '0.75rem';
  startInput.style.border = '1px solid #ddd';
  startInput.style.borderRadius = '4px';

  // End time
  const endInput = document.createElement('input');
  endInput.type = 'time';
  endInput.name = 'end';
  endInput.value = workingHour?.end || '17:00';
  endInput.style.flex = '1';
  endInput.style.padding = '0.75rem';
  endInput.style.border = '1px solid #ddd';
  endInput.style.borderRadius = '4px';

  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn btn-danger';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', () => {
    row.remove();
  });

  row.appendChild(daySelect);
  row.appendChild(startInput);
  row.appendChild(endInput);
  row.appendChild(removeBtn);

  return row;
}

/**
 * Create blackout dates section
 */
function createBlackoutDatesSection(blackoutDates: string[]): HTMLElement {
  const section = document.createElement('div');
  section.className = 'form-group';
  section.style.marginTop = '2rem';

  const label = document.createElement('label');
  label.textContent = 'Blackout Dates';
  label.style.display = 'block';
  label.style.marginBottom = '1rem';
  label.style.fontSize = '1.125rem';
  label.style.fontWeight = '600';
  section.appendChild(label);

  const datesContainer = document.createElement('div');
  datesContainer.id = 'blackout-dates-container';
  section.appendChild(datesContainer);

  // Add existing blackout dates
  blackoutDates.forEach((date) => {
    datesContainer.appendChild(createBlackoutDateRow(date));
  });

  // Add button
  const addBtn = document.createElement('button');
  addBtn.type = 'button';
  addBtn.className = 'btn btn-secondary';
  addBtn.textContent = '+ Add Blackout Date';
  addBtn.style.marginTop = '0.5rem';
  addBtn.addEventListener('click', () => {
    datesContainer.appendChild(createBlackoutDateRow());
  });
  section.appendChild(addBtn);

  return section;
}

/**
 * Create blackout date row
 */
function createBlackoutDateRow(date?: string): HTMLElement {
  const row = document.createElement('div');
  row.className = 'blackout-date-row';
  row.style.display = 'flex';
  row.style.gap = '1rem';
  row.style.marginBottom = '0.75rem';
  row.style.alignItems = 'center';

  // Date input
  const dateInput = document.createElement('input');
  dateInput.type = 'date';
  dateInput.name = 'blackoutDate';
  dateInput.value = date || '';
  dateInput.style.flex = '1';
  dateInput.style.padding = '0.75rem';
  dateInput.style.border = '1px solid #ddd';
  dateInput.style.borderRadius = '4px';

  // Remove button
  const removeBtn = document.createElement('button');
  removeBtn.type = 'button';
  removeBtn.className = 'btn btn-danger';
  removeBtn.textContent = 'Remove';
  removeBtn.addEventListener('click', () => {
    row.remove();
  });

  row.appendChild(dateInput);
  row.appendChild(removeBtn);

  return row;
}

/**
 * Helper: Create select group
 */
function createSelectGroup(
  id: string,
  label: string,
  options: { value: string; label: string }[],
  selectedValue?: string
): HTMLElement {
  const group = document.createElement('div');
  group.className = 'form-group';

  const labelElement = document.createElement('label');
  labelElement.htmlFor = id;
  labelElement.textContent = label;

  const select = document.createElement('select');
  select.id = id;
  select.name = id;

  options.forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    if (selectedValue && opt.value === selectedValue) {
      option.selected = true;
    }
    select.appendChild(option);
  });

  group.appendChild(labelElement);
  group.appendChild(select);

  return group;
}

/**
 * Helper: Create number input group
 */
function createNumberGroup(
  id: string,
  label: string,
  value: number,
  min: number,
  max: number,
  step: number
): HTMLElement {
  const group = document.createElement('div');
  group.className = 'form-group';

  const labelElement = document.createElement('label');
  labelElement.htmlFor = id;
  labelElement.textContent = label;

  const input = document.createElement('input');
  input.type = 'number';
  input.id = id;
  input.name = id;
  input.value = String(value);
  input.min = String(min);
  input.max = String(max);
  input.step = String(step);

  group.appendChild(labelElement);
  group.appendChild(input);

  return group;
}

/**
 * Get working hours from form
 */
function getWorkingHoursFromForm(form: HTMLFormElement): WorkingHour[] {
  const rows = form.querySelectorAll('.working-hour-row');
  const workingHours: WorkingHour[] = [];

  rows.forEach((row) => {
    const day = parseInt((row.querySelector('[name="day"]') as HTMLSelectElement).value);
    const start = (row.querySelector('[name="start"]') as HTMLInputElement).value;
    const end = (row.querySelector('[name="end"]') as HTMLInputElement).value;

    workingHours.push({ day, start, end });
  });

  return workingHours;
}

/**
 * Get blackout dates from form
 */
function getBlackoutDatesFromForm(form: HTMLFormElement): string[] {
  const inputs = form.querySelectorAll('[name="blackoutDate"]');
  const dates: string[] = [];

  inputs.forEach((input) => {
    const value = (input as HTMLInputElement).value;
    if (value) {
      dates.push(value);
    }
  });

  return dates;
}

/**
 * Create bookings tab
 */
function createBookingsTab(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'bookings-tab';

  const card = document.createElement('div');
  card.className = 'card';

  const title = document.createElement('h2');
  title.className = 'card-title';
  title.textContent = 'My Bookings';
  card.appendChild(title);

  // Loading state
  const loading = createLoadingSpinner({ text: 'Loading bookings...', fullPage: true });
  card.appendChild(loading);

  container.appendChild(card);

  // Fetch bookings
  fetchAndRenderBookings(card, 1);

  return container;
}

/**
 * Create share tab
 */
function createShareTab(): HTMLElement {
  const container = document.createElement('div');
  container.className = 'share-tab';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.maxWidth = '600px';

  const title = document.createElement('h2');
  title.className = 'card-title';
  title.textContent = 'Share Your Booking Link';
  card.appendChild(title);

  const user = AuthService.getStoredUser();
  if (!user) {
    card.appendChild(
      createErrorAlertFromApiError(new ApiError(0, 'User information not available'))
    );
    container.appendChild(card);
    return container;
  }

  // Description
  const description = document.createElement('p');
  description.style.color = '#666';
  description.style.marginBottom = '2rem';
  description.textContent =
    'Share your booking link with invitees so they can schedule meetings with you. You can share the link via email, calendar invites, or direct messaging.';
  card.appendChild(description);

  // Organizer ID Section
  const idSection = document.createElement('div');
  idSection.style.marginBottom = '2rem';
  idSection.style.padding = '1.5rem';
  idSection.style.backgroundColor = '#f9f9f9';
  idSection.style.borderRadius = '8px';
  idSection.style.border = '1px solid #e0e0e0';

  const idLabel = document.createElement('label');
  idLabel.style.display = 'block';
  idLabel.style.fontWeight = '600';
  idLabel.style.marginBottom = '0.75rem';
  idLabel.style.fontSize = '0.95rem';
  idLabel.textContent = 'Your Organizer ID';
  idSection.appendChild(idLabel);

  const idDisplay = document.createElement('div');
  idDisplay.style.display = 'flex';
  idDisplay.style.gap = '0.5rem';
  idDisplay.style.alignItems = 'center';

  const idInput = document.createElement('input');
  idInput.type = 'text';
  idInput.value = user.id;
  idInput.readOnly = true;
  idInput.style.flex = '1';
  idInput.style.padding = '0.75rem';
  idInput.style.border = '1px solid #ddd';
  idInput.style.borderRadius = '4px';
  idInput.style.fontFamily = 'monospace';
  idInput.style.backgroundColor = '#fff';
  idInput.style.fontSize = '0.85rem';

  const idCopyBtn = document.createElement('button');
  idCopyBtn.className = 'btn btn-secondary';
  idCopyBtn.textContent = 'Copy ID';
  idCopyBtn.style.whiteSpace = 'nowrap';
  idCopyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(user.id).then(() => {
      showSuccessMessage(card, 'Organizer ID copied to clipboard!');
    });
  });

  idDisplay.appendChild(idInput);
  idDisplay.appendChild(idCopyBtn);
  idSection.appendChild(idDisplay);

  card.appendChild(idSection);

  // Booking Link Section
  const linkSection = document.createElement('div');
  linkSection.style.marginBottom = '2rem';
  linkSection.style.padding = '1.5rem';
  linkSection.style.backgroundColor = '#f9f9f9';
  linkSection.style.borderRadius = '8px';
  linkSection.style.border = '1px solid #e0e0e0';

  const linkLabel = document.createElement('label');
  linkLabel.style.display = 'block';
  linkLabel.style.fontWeight = '600';
  linkLabel.style.marginBottom = '0.75rem';
  linkLabel.style.fontSize = '0.95rem';
  linkLabel.textContent = 'Your Booking Link';
  linkSection.appendChild(linkLabel);

  const bookingUrl = `${window.location.origin}/book/${user.id}`;

  const linkDisplay = document.createElement('div');
  linkDisplay.style.display = 'flex';
  linkDisplay.style.gap = '0.5rem';
  linkDisplay.style.alignItems = 'center';

  const linkInput = document.createElement('input');
  linkInput.type = 'text';
  linkInput.value = bookingUrl;
  linkInput.readOnly = true;
  linkInput.style.flex = '1';
  linkInput.style.padding = '0.75rem';
  linkInput.style.border = '1px solid #ddd';
  linkInput.style.borderRadius = '4px';
  linkInput.style.fontFamily = 'monospace';
  linkInput.style.backgroundColor = '#fff';
  linkInput.style.fontSize = '0.85rem';
  linkInput.style.wordBreak = 'break-all';

  const linkCopyBtn = document.createElement('button');
  linkCopyBtn.className = 'btn btn-primary';
  linkCopyBtn.textContent = 'Copy Link';
  linkCopyBtn.style.whiteSpace = 'nowrap';
  linkCopyBtn.addEventListener('click', () => {
    navigator.clipboard.writeText(bookingUrl).then(() => {
      showSuccessMessage(card, 'Booking link copied to clipboard!');
    });
  });

  linkDisplay.appendChild(linkInput);
  linkDisplay.appendChild(linkCopyBtn);
  linkSection.appendChild(linkDisplay);

  card.appendChild(linkSection);

  // Share Instructions
  const instructionsSection = document.createElement('div');
  instructionsSection.style.padding = '1.5rem';
  instructionsSection.style.backgroundColor = '#e3f2fd';
  instructionsSection.style.borderRadius = '8px';
  instructionsSection.style.border = '1px solid #90caf9';

  const instructionsTitle = document.createElement('h3');
  instructionsTitle.style.margin = '0 0 1rem 0';
  instructionsTitle.style.fontSize = '1rem';
  instructionsTitle.style.color = '#1565c0';
  instructionsTitle.textContent = 'How to Share';
  instructionsSection.appendChild(instructionsTitle);

  const instructions = document.createElement('ul');
  instructions.style.margin = '0';
  instructions.style.paddingLeft = '1.5rem';
  instructions.style.color = '#333';

  const shareOptions = [
    'Send the link via email to invitees',
    'Add the link to your calendar availability',
    'Share via messaging or social media',
    'Embed the link in your website or bio',
  ];

  shareOptions.forEach((option) => {
    const li = document.createElement('li');
    li.style.marginBottom = '0.5rem';
    li.textContent = option;
    instructions.appendChild(li);
  });

  instructionsSection.appendChild(instructions);
  card.appendChild(instructionsSection);

  container.appendChild(card);

  return container;
}

/**
 * Fetch and render bookings
 */
async function fetchAndRenderBookings(container: HTMLElement, page: number): Promise<void> {
  try {
    const response = await OrganizerService.getBookings(page, 20);

    // Remove loading/previous content (keep title)
    const title = container.querySelector('.card-title');
    container.innerHTML = '';
    if (title) {
      container.appendChild(title);
    }

    if (response.data.length === 0) {
      const emptyMessage = document.createElement('p');
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.color = '#666';
      emptyMessage.style.padding = '2rem';
      emptyMessage.textContent = 'No bookings found.';
      container.appendChild(emptyMessage);
      return;
    }

    // Render bookings table
    const table = createBookingsTable(response.data, container);
    container.appendChild(table);

    // Render pagination
    const pagination = createPagination(response.metadata, (newPage) => {
      const loading = createLoadingSpinner({ text: 'Loading bookings...', fullPage: true });
      container.innerHTML = '';
      if (title) {
        container.appendChild(title);
      }
      container.appendChild(loading);
      fetchAndRenderBookings(container, newPage);
    });
    container.appendChild(pagination);
  } catch (error) {
    const title = container.querySelector('.card-title');
    container.innerHTML = '';
    if (title) {
      container.appendChild(title);
    }

    if (error instanceof ApiError) {
      container.appendChild(createErrorAlertFromApiError(error));
    } else {
      container.appendChild(
        createErrorAlertFromApiError(new ApiError(0, 'Failed to load bookings'))
      );
    }
  }
}

/**
 * Create bookings table
 */
function createBookingsTable(bookings: Booking[], container: HTMLElement): HTMLElement {
  const table = document.createElement('table');
  table.className = 'table';

  // Header
  const thead = document.createElement('thead');
  thead.innerHTML = `
    <tr>
      <th>Date & Time</th>
      <th>Invitee</th>
      <th>Email</th>
      <th>Status</th>
      <th>Actions</th>
    </tr>
  `;
  table.appendChild(thead);

  // Body
  const tbody = document.createElement('tbody');

  bookings.forEach((booking) => {
    const tr = document.createElement('tr');

    // Date & Time
    const tdDate = document.createElement('td');
    tdDate.textContent = formatDateTimeInTimezone(booking.startTime, 'UTC', 'short');
    tr.appendChild(tdDate);

    // Invitee
    const tdName = document.createElement('td');
    tdName.textContent = booking.inviteeName;
    tr.appendChild(tdName);

    // Email
    const tdEmail = document.createElement('td');
    tdEmail.textContent = booking.inviteeEmail;
    tr.appendChild(tdEmail);

    // Status
    const tdStatus = document.createElement('td');
    const statusBadge = document.createElement('span');
    statusBadge.style.padding = '0.25rem 0.75rem';
    statusBadge.style.borderRadius = '4px';
    statusBadge.style.fontSize = '0.875rem';
    statusBadge.style.fontWeight = '500';

    if (booking.status === 'confirmed') {
      statusBadge.style.backgroundColor = '#d5f4e6';
      statusBadge.style.color = '#1e8449';
      statusBadge.textContent = 'Confirmed';
    } else {
      statusBadge.style.backgroundColor = '#fadbd8';
      statusBadge.style.color = '#c0392b';
      statusBadge.textContent = 'Cancelled';
    }

    tdStatus.appendChild(statusBadge);
    tr.appendChild(tdStatus);

    // Actions
    const tdActions = document.createElement('td');
    tdActions.style.display = 'flex';
    tdActions.style.gap = '0.5rem';

    if (booking.status === 'confirmed') {
      const rescheduleBtn = document.createElement('button');
      rescheduleBtn.className = 'btn btn-secondary';
      rescheduleBtn.style.padding = '0.5rem 1rem';
      rescheduleBtn.style.fontSize = '0.875rem';
      rescheduleBtn.textContent = 'Reschedule';
      rescheduleBtn.addEventListener('click', () => {
        showRescheduleModal(booking, () => {
          fetchAndRenderBookings(container, 1);
        });
      });

      const cancelBtn = document.createElement('button');
      cancelBtn.className = 'btn btn-danger';
      cancelBtn.style.padding = '0.5rem 1rem';
      cancelBtn.style.fontSize = '0.875rem';
      cancelBtn.textContent = 'Cancel';
      cancelBtn.addEventListener('click', () => {
        showCancelModal(booking, () => {
          fetchAndRenderBookings(container, 1);
        });
      });

      tdActions.appendChild(rescheduleBtn);
      tdActions.appendChild(cancelBtn);
    } else {
      tdActions.textContent = '—';
    }

    tr.appendChild(tdActions);
    tbody.appendChild(tr);
  });

  table.appendChild(tbody);
  return table;
}

/**
 * Create pagination controls
 */
function createPagination(
  metadata: { page: number; totalPages: number; hasNextPage: boolean; hasPrevPage: boolean },
  onPageChange: (page: number) => void
): HTMLElement {
  const container = document.createElement('div');
  container.style.display = 'flex';
  container.style.justifyContent = 'space-between';
  container.style.alignItems = 'center';
  container.style.marginTop = '1.5rem';

  // Page info
  const info = document.createElement('div');
  info.textContent = `Page ${metadata.page} of ${metadata.totalPages}`;
  info.style.color = '#666';

  // Buttons
  const buttons = document.createElement('div');
  buttons.style.display = 'flex';
  buttons.style.gap = '0.5rem';

  const prevBtn = document.createElement('button');
  prevBtn.className = 'btn btn-secondary';
  prevBtn.textContent = 'Previous';
  prevBtn.disabled = !metadata.hasPrevPage;
  prevBtn.addEventListener('click', () => {
    onPageChange(metadata.page - 1);
  });

  const nextBtn = document.createElement('button');
  nextBtn.className = 'btn btn-secondary';
  nextBtn.textContent = 'Next';
  nextBtn.disabled = !metadata.hasNextPage;
  nextBtn.addEventListener('click', () => {
    onPageChange(metadata.page + 1);
  });

  buttons.appendChild(prevBtn);
  buttons.appendChild(nextBtn);

  container.appendChild(info);
  container.appendChild(buttons);

  return container;
}

/**
 * Show reschedule modal
 */
function showRescheduleModal(booking: Booking, onSuccess: () => void): void {
  const modal = createModal('Reschedule Booking');

  const form = document.createElement('form');

  const group = document.createElement('div');
  group.className = 'form-group';

  const label = document.createElement('label');
  label.textContent = 'New Date & Time';

  const input = document.createElement('input');
  input.type = 'datetime-local';
  input.required = true;

  group.appendChild(label);
  group.appendChild(input);
  form.appendChild(group);

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary btn-block';
  submitBtn.textContent = 'Reschedule';

  form.appendChild(submitBtn);

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const newDateTime = input.value;
    if (!newDateTime) return;

    // Convert to ISO string
    const newStartTime = new Date(newDateTime).toISOString();

    submitBtn.disabled = true;
    submitBtn.textContent = 'Rescheduling...';

    try {
      await OrganizerService.rescheduleBooking(booking.id, newStartTime);
      closeModal(modal);
      onSuccess();
    } catch (error) {
      if (error instanceof ApiError) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-error';
        errorDiv.textContent = error.message;
        form.insertBefore(errorDiv, form.firstChild);
      }

      submitBtn.disabled = false;
      submitBtn.textContent = 'Reschedule';
    }
  });

  modal.querySelector('.modal-body')?.appendChild(form);
  document.body.appendChild(modal);
}

/**
 * Show cancel modal
 */
function showCancelModal(booking: Booking, onSuccess: () => void): void {
  const modal = createModal('Cancel Booking');

  const message = document.createElement('p');
  message.textContent = `Are you sure you want to cancel the booking with ${booking.inviteeName}?`;
  message.style.marginBottom = '1.5rem';

  const buttons = document.createElement('div');
  buttons.style.display = 'flex';
  buttons.style.gap = '1rem';

  const cancelBtn = document.createElement('button');
  cancelBtn.className = 'btn btn-secondary';
  cancelBtn.textContent = 'No, Keep It';
  cancelBtn.style.flex = '1';
  cancelBtn.addEventListener('click', () => {
    closeModal(modal);
  });

  const confirmBtn = document.createElement('button');
  confirmBtn.className = 'btn btn-danger';
  confirmBtn.textContent = 'Yes, Cancel Booking';
  confirmBtn.style.flex = '1';
  confirmBtn.addEventListener('click', async () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Cancelling...';

    try {
      await OrganizerService.cancelBooking(booking.id);
      closeModal(modal);
      onSuccess();
    } catch (error) {
      if (error instanceof ApiError) {
        const errorDiv = document.createElement('div');
        errorDiv.className = 'alert alert-error';
        errorDiv.textContent = error.message;
        modal.querySelector('.modal-body')?.insertBefore(errorDiv, message);
      }

      confirmBtn.disabled = false;
      confirmBtn.textContent = 'Yes, Cancel Booking';
    }
  });

  buttons.appendChild(cancelBtn);
  buttons.appendChild(confirmBtn);

  const body = modal.querySelector('.modal-body');
  body?.appendChild(message);
  body?.appendChild(buttons);

  document.body.appendChild(modal);
}

/**
 * Create modal
 */
function createModal(title: string): HTMLElement {
  const overlay = document.createElement('div');
  overlay.style.position = 'fixed';
  overlay.style.top = '0';
  overlay.style.left = '0';
  overlay.style.right = '0';
  overlay.style.bottom = '0';
  overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.5)';
  overlay.style.display = 'flex';
  overlay.style.alignItems = 'center';
  overlay.style.justifyContent = 'center';
  overlay.style.zIndex = '1000';

  const modal = document.createElement('div');
  modal.style.backgroundColor = 'white';
  modal.style.borderRadius = '8px';
  modal.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
  modal.style.maxWidth = '500px';
  modal.style.width = '90%';
  modal.style.maxHeight = '90vh';
  modal.style.overflow = 'auto';

  const header = document.createElement('div');
  header.style.padding = '1.5rem';
  header.style.borderBottom = '1px solid #e0e0e0';
  header.style.display = 'flex';
  header.style.justifyContent = 'space-between';
  header.style.alignItems = 'center';

  const titleElement = document.createElement('h3');
  titleElement.textContent = title;
  titleElement.style.margin = '0';

  const closeBtn = document.createElement('button');
  closeBtn.innerHTML = '&times;';
  closeBtn.style.background = 'none';
  closeBtn.style.border = 'none';
  closeBtn.style.fontSize = '1.5rem';
  closeBtn.style.cursor = 'pointer';
  closeBtn.addEventListener('click', () => {
    closeModal(overlay);
  });

  header.appendChild(titleElement);
  header.appendChild(closeBtn);

  const body = document.createElement('div');
  body.className = 'modal-body';
  body.style.padding = '1.5rem';

  modal.appendChild(header);
  modal.appendChild(body);
  overlay.appendChild(modal);

  return overlay;
}

/**
 * Close modal
 */
function closeModal(modal: HTMLElement): void {
  modal.remove();
}
