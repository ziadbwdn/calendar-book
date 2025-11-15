/**
 * Public Booking Page
 * Allows guests to view available slots and book meetings with organizers
 */

import { BookingService } from '../services/booking.service';
import type { TimeSlot, Booking } from '../types/booking';
import { ApiError } from '../services/api';
import { createErrorAlertFromApiError } from '../components/error-alert';
import { createLoadingSpinner } from '../components/loading';
import { TIMEZONES } from '../utils/constants';
import { validateBookingForm, hasErrors } from '../utils/validation';
import {
  getLocalTimezone,
  formatDate,
  formatTime,
  getNext14Days,
  isToday,
} from '../utils/date';

export interface PublicBookingPageOptions {
  organizerId: string;
}

/**
 * Create public booking page
 */
export function createPublicBookingPage(options: PublicBookingPageOptions): HTMLElement {
  const { organizerId } = options;

  const page = document.createElement('div');
  page.className = 'public-booking-page';
  page.style.minHeight = '100vh';
  page.style.backgroundColor = '#f5f5f5';
  page.style.padding = '2rem';

  const container = document.createElement('div');
  container.style.maxWidth = '1000px';
  container.style.margin = '0 auto';

  // Header
  const header = createHeader(organizerId);
  container.appendChild(header);

  // Main content
  const content = document.createElement('div');
  content.id = 'booking-content';
  content.style.marginTop = '2rem';

  // Initial state: loading slots
  const selectedTimezone = getLocalTimezone();
  renderSlotPicker(content, organizerId, selectedTimezone);

  container.appendChild(content);
  page.appendChild(container);

  return page;
}

/**
 * Create header with timezone selector
 */
function createHeader(organizerId: string): HTMLElement {
  const header = document.createElement('div');
  header.className = 'card';
  header.style.textAlign = 'center';

  const title = document.createElement('h1');
  title.style.fontSize = '2rem';
  title.style.marginBottom = '0.5rem';
  title.textContent = 'Book a Meeting';

  const subtitle = document.createElement('p');
  subtitle.style.color = '#666';
  subtitle.style.marginBottom = '1.5rem';
  subtitle.textContent = 'Select an available time slot below';

  // Timezone selector
  const timezoneGroup = document.createElement('div');
  timezoneGroup.style.display = 'flex';
  timezoneGroup.style.alignItems = 'center';
  timezoneGroup.style.justifyContent = 'center';
  timezoneGroup.style.gap = '1rem';

  const timezoneLabel = document.createElement('label');
  timezoneLabel.htmlFor = 'timezone-selector';
  timezoneLabel.textContent = 'Your Timezone:';
  timezoneLabel.style.fontWeight = '500';

  const timezoneSelect = document.createElement('select');
  timezoneSelect.id = 'timezone-selector';
  timezoneSelect.style.padding = '0.5rem';
  timezoneSelect.style.border = '1px solid #ddd';
  timezoneSelect.style.borderRadius = '4px';
  timezoneSelect.style.fontSize = '1rem';

  const detectedTimezone = getLocalTimezone();
  TIMEZONES.forEach((tz) => {
    const option = document.createElement('option');
    option.value = tz;
    option.textContent = tz;
    if (tz === detectedTimezone) {
      option.selected = true;
    }
    timezoneSelect.appendChild(option);
  });

  // Timezone change handler
  timezoneSelect.addEventListener('change', () => {
    const content = document.getElementById('booking-content');
    if (content) {
      renderSlotPicker(content, organizerId, timezoneSelect.value);
    }
  });

  timezoneGroup.appendChild(timezoneLabel);
  timezoneGroup.appendChild(timezoneSelect);

  header.appendChild(title);
  header.appendChild(subtitle);
  header.appendChild(timezoneGroup);

  return header;
}

/**
 * Render slot picker (calendar + available slots)
 */
function renderSlotPicker(
  container: HTMLElement,
  organizerId: string,
  timezone: string
): void {
  container.innerHTML = '';

  // Loading state
  const loading = createLoadingSpinner({ text: 'Loading available slots...', fullPage: true });
  container.appendChild(loading);

  // Fetch slots
  fetchAndRenderSlots(container, organizerId, timezone);
}

/**
 * Fetch and render available slots
 */
async function fetchAndRenderSlots(
  container: HTMLElement,
  organizerId: string,
  timezone: string
): Promise<void> {
  try {
    const response = await BookingService.getAvailableSlots(organizerId, timezone);

    container.innerHTML = '';

    if (response.slots.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'card';
      emptyMessage.style.textAlign = 'center';
      emptyMessage.style.padding = '3rem';

      const icon = document.createElement('div');
      icon.style.fontSize = '3rem';
      icon.style.marginBottom = '1rem';
      icon.textContent = '📅';

      const message = document.createElement('p');
      message.style.fontSize = '1.125rem';
      message.style.color = '#666';
      message.textContent = 'No available slots at the moment. Please check back later.';

      emptyMessage.appendChild(icon);
      emptyMessage.appendChild(message);
      container.appendChild(emptyMessage);
      return;
    }

    // Group slots by date
    const slotsByDate = groupSlotsByDate(response.slots, timezone);

    // Render calendar
    const calendar = createCalendar(slotsByDate, organizerId, timezone);
    container.appendChild(calendar);
  } catch (error) {
    container.innerHTML = '';

    const card = document.createElement('div');
    card.className = 'card';

    if (error instanceof ApiError) {
      card.appendChild(createErrorAlertFromApiError(error));
    } else {
      card.appendChild(
        createErrorAlertFromApiError(new ApiError(0, 'Failed to load available slots'))
      );
    }

    container.appendChild(card);
  }
}

/**
 * Group slots by date
 */
function groupSlotsByDate(
  slots: TimeSlot[],
  _timezone: string
): Map<string, TimeSlot[]> {
  const grouped = new Map<string, TimeSlot[]>();

  slots.forEach((slot) => {
    // Parse slot start time and convert to selected timezone
    const slotDate = new Date(slot.start);
    const dateKey = formatDate(slotDate);

    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }

    grouped.get(dateKey)!.push(slot);
  });

  return grouped;
}

/**
 * Create calendar view with slots
 */
function createCalendar(
  slotsByDate: Map<string, TimeSlot[]>,
  organizerId: string,
  timezone: string
): HTMLElement {
  const card = document.createElement('div');
  card.className = 'card';

  const title = document.createElement('h2');
  title.className = 'card-title';
  title.textContent = 'Available Time Slots';
  card.appendChild(title);

  // Get next 14 days
  const next14Days = getNext14Days();

  // Calendar grid
  const grid = document.createElement('div');
  grid.style.display = 'grid';
  grid.style.gridTemplateColumns = 'repeat(auto-fill, minmax(200px, 1fr))';
  grid.style.gap = '1rem';

  next14Days.forEach((date) => {
    const dateKey = formatDate(date);
    const slotsForDate = slotsByDate.get(dateKey) || [];

    const dayCard = createDayCard(date, slotsForDate, organizerId, timezone);
    grid.appendChild(dayCard);
  });

  card.appendChild(grid);

  return card;
}

/**
 * Create day card with slots
 */
function createDayCard(
  date: Date,
  slots: TimeSlot[],
  organizerId: string,
  timezone: string
): HTMLElement {
  const card = document.createElement('div');
  card.style.border = '1px solid #e0e0e0';
  card.style.borderRadius = '4px';
  card.style.padding = '1rem';
  card.style.backgroundColor = 'white';

  // Date header
  const dateHeader = document.createElement('div');
  dateHeader.style.fontWeight = '600';
  dateHeader.style.marginBottom = '0.75rem';
  dateHeader.style.paddingBottom = '0.5rem';
  dateHeader.style.borderBottom = '1px solid #e0e0e0';

  const dayName = date.toLocaleDateString('en-US', { weekday: 'short' });
  const dateStr = date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });

  dateHeader.textContent = `${dayName}, ${dateStr}`;

  if (isToday(date)) {
    dateHeader.style.color = '#2c3e50';
    const todayBadge = document.createElement('span');
    todayBadge.textContent = ' (Today)';
    todayBadge.style.fontSize = '0.875rem';
    todayBadge.style.color = '#27ae60';
    dateHeader.appendChild(todayBadge);
  }

  card.appendChild(dateHeader);

  // Slots
  const slotsContainer = document.createElement('div');
  slotsContainer.style.display = 'flex';
  slotsContainer.style.flexDirection = 'column';
  slotsContainer.style.gap = '0.5rem';

  if (slots.length === 0) {
    const noSlots = document.createElement('div');
    noSlots.style.color = '#999';
    noSlots.style.fontSize = '0.875rem';
    noSlots.style.textAlign = 'center';
    noSlots.style.padding = '1rem 0';
    noSlots.textContent = 'No slots';
    slotsContainer.appendChild(noSlots);
  } else {
    slots.forEach((slot) => {
      const slotButton = createSlotButton(slot, organizerId, timezone);
      slotsContainer.appendChild(slotButton);
    });
  }

  card.appendChild(slotsContainer);

  return card;
}

/**
 * Create slot button
 */
function createSlotButton(
  slot: TimeSlot,
  organizerId: string,
  timezone: string
): HTMLElement {
  const button = document.createElement('button');
  button.className = 'btn btn-secondary';
  button.style.padding = '0.5rem';
  button.style.fontSize = '0.875rem';

  const slotDate = new Date(slot.start);
  const timeStr = formatTime(slotDate);

  button.textContent = timeStr;

  button.addEventListener('click', () => {
    // Show booking form
    const content = document.getElementById('booking-content');
    if (content) {
      renderBookingForm(content, organizerId, slot, timezone);
    }
  });

  return button;
}

/**
 * Render booking form
 */
function renderBookingForm(
  container: HTMLElement,
  organizerId: string,
  slot: TimeSlot,
  timezone: string
): void {
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card';

  const title = document.createElement('h2');
  title.className = 'card-title';
  title.textContent = 'Complete Your Booking';
  card.appendChild(title);

  // Selected slot display
  const slotInfo = document.createElement('div');
  slotInfo.style.backgroundColor = '#f5f5f5';
  slotInfo.style.padding = '1rem';
  slotInfo.style.borderRadius = '4px';
  slotInfo.style.marginBottom = '1.5rem';

  const slotDate = new Date(slot.start);
  const slotEnd = new Date(slot.end);

  const slotLabel = document.createElement('div');
  slotLabel.style.fontWeight = '600';
  slotLabel.style.marginBottom = '0.5rem';
  slotLabel.textContent = 'Selected Time:';

  const slotTime = document.createElement('div');
  slotTime.style.fontSize = '1.125rem';
  const dateStr = slotDate.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const timeStr = `${formatTime(slotDate)} - ${formatTime(slotEnd)}`;
  slotTime.textContent = `${dateStr} at ${timeStr}`;

  const timezoneInfo = document.createElement('div');
  timezoneInfo.style.fontSize = '0.875rem';
  timezoneInfo.style.color = '#666';
  timezoneInfo.style.marginTop = '0.25rem';
  timezoneInfo.textContent = `Timezone: ${timezone}`;

  slotInfo.appendChild(slotLabel);
  slotInfo.appendChild(slotTime);
  slotInfo.appendChild(timezoneInfo);
  card.appendChild(slotInfo);

  // Error container
  const errorContainer = document.createElement('div');
  errorContainer.id = 'booking-error-container';
  card.appendChild(errorContainer);

  // Form
  const form = document.createElement('form');
  form.id = 'booking-form';

  // Name field
  const nameGroup = document.createElement('div');
  nameGroup.className = 'form-group';

  const nameLabel = document.createElement('label');
  nameLabel.htmlFor = 'invitee-name';
  nameLabel.textContent = 'Your Full Name';

  const nameInput = document.createElement('input');
  nameInput.type = 'text';
  nameInput.id = 'invitee-name';
  nameInput.name = 'inviteeName';
  nameInput.required = true;

  const nameError = document.createElement('div');
  nameError.className = 'form-error';
  nameError.id = 'invitee-name-error';

  nameGroup.appendChild(nameLabel);
  nameGroup.appendChild(nameInput);
  nameGroup.appendChild(nameError);
  form.appendChild(nameGroup);

  // Email field
  const emailGroup = document.createElement('div');
  emailGroup.className = 'form-group';

  const emailLabel = document.createElement('label');
  emailLabel.htmlFor = 'invitee-email';
  emailLabel.textContent = 'Your Email';

  const emailInput = document.createElement('input');
  emailInput.type = 'email';
  emailInput.id = 'invitee-email';
  emailInput.name = 'inviteeEmail';
  emailInput.required = true;

  const emailError = document.createElement('div');
  emailError.className = 'form-error';
  emailError.id = 'invitee-email-error';

  emailGroup.appendChild(emailLabel);
  emailGroup.appendChild(emailInput);
  emailGroup.appendChild(emailError);
  form.appendChild(emailGroup);

  // Buttons
  const buttonsContainer = document.createElement('div');
  buttonsContainer.style.display = 'flex';
  buttonsContainer.style.gap = '1rem';
  buttonsContainer.style.marginTop = '1.5rem';

  const backBtn = document.createElement('button');
  backBtn.type = 'button';
  backBtn.className = 'btn btn-secondary';
  backBtn.textContent = 'Back';
  backBtn.style.flex = '1';
  backBtn.addEventListener('click', () => {
    renderSlotPicker(container, organizerId, timezone);
  });

  const submitBtn = document.createElement('button');
  submitBtn.type = 'submit';
  submitBtn.className = 'btn btn-primary';
  submitBtn.textContent = 'Confirm Booking';
  submitBtn.style.flex = '2';

  buttonsContainer.appendChild(backBtn);
  buttonsContainer.appendChild(submitBtn);
  form.appendChild(buttonsContainer);

  // Form submit handler
  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    // Clear errors
    errorContainer.innerHTML = '';
    nameError.textContent = '';
    emailError.textContent = '';

    // Get values
    const inviteeName = nameInput.value.trim();
    const inviteeEmail = emailInput.value.trim();

    // Validate
    const errors = validateBookingForm(inviteeName, inviteeEmail);
    if (hasErrors(errors)) {
      if (errors.name) {
        nameError.textContent = errors.name;
      }
      if (errors.email) {
        emailError.textContent = errors.email;
      }
      return;
    }

    // Disable submit
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating booking...';

    try {
      const booking = await BookingService.createBooking(organizerId, {
        startTime: slot.start,
        inviteeName,
        inviteeEmail,
        timezone,
      });

      // Show confirmation
      renderConfirmation(container, booking, timezone, organizerId);
    } catch (error) {
      if (error instanceof ApiError) {
        // Check if it's a 409 conflict (slot already booked)
        if (error.status === 409) {
          errorContainer.appendChild(
            createErrorAlertFromApiError(
              new ApiError(
                409,
                'This time slot is no longer available. Please select another slot.'
              )
            )
          );

          // Re-fetch slots after 2 seconds
          setTimeout(() => {
            renderSlotPicker(container, organizerId, timezone);
          }, 2000);
        } else {
          errorContainer.appendChild(createErrorAlertFromApiError(error));
        }
      } else {
        errorContainer.appendChild(
          createErrorAlertFromApiError(
            new ApiError(0, 'Failed to create booking. Please try again.')
          )
        );
      }

      submitBtn.disabled = false;
      submitBtn.textContent = 'Confirm Booking';
    }
  });

  card.appendChild(form);
  container.appendChild(card);
}

/**
 * Render confirmation screen
 */
function renderConfirmation(
  container: HTMLElement,
  booking: Booking,
  timezone: string,
  organizerId: string
): void {
  container.innerHTML = '';

  const card = document.createElement('div');
  card.className = 'card';
  card.style.textAlign = 'center';

  // Success icon
  const icon = document.createElement('div');
  icon.style.fontSize = '4rem';
  icon.style.marginBottom = '1rem';
  icon.textContent = '✅';
  card.appendChild(icon);

  // Title
  const title = document.createElement('h2');
  title.className = 'card-title';
  title.textContent = 'Booking Confirmed!';
  card.appendChild(title);

  // Success message
  const message = document.createElement('p');
  message.style.fontSize = '1.125rem';
  message.style.color = '#666';
  message.style.marginBottom = '2rem';
  message.textContent = 'Your meeting has been successfully booked.';
  card.appendChild(message);

  // Booking details
  const details = document.createElement('div');
  details.style.backgroundColor = '#f5f5f5';
  details.style.padding = '1.5rem';
  details.style.borderRadius = '4px';
  details.style.marginBottom = '2rem';
  details.style.textAlign = 'left';

  const bookingDate = new Date(booking.startTime);
  const bookingEnd = new Date(booking.endTime);

  const detailsHTML = `
    <div style="margin-bottom: 1rem;">
      <strong>Name:</strong> ${escapeHtml(booking.inviteeName)}
    </div>
    <div style="margin-bottom: 1rem;">
      <strong>Email:</strong> ${escapeHtml(booking.inviteeEmail)}
    </div>
    <div style="margin-bottom: 1rem;">
      <strong>Date:</strong> ${bookingDate.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })}
    </div>
    <div style="margin-bottom: 1rem;">
      <strong>Time:</strong> ${formatTime(bookingDate)} - ${formatTime(bookingEnd)}
    </div>
    <div>
      <strong>Timezone:</strong> ${escapeHtml(timezone)}
    </div>
  `;

  details.innerHTML = detailsHTML;
  card.appendChild(details);

  // Info message
  const infoMessage = document.createElement('p');
  infoMessage.style.fontSize = '0.875rem';
  infoMessage.style.color = '#666';
  infoMessage.style.marginBottom = '1.5rem';
  infoMessage.textContent = 'A confirmation email will be sent to your email address.';
  card.appendChild(infoMessage);

  // Book another button
  const bookAnotherBtn = document.createElement('button');
  bookAnotherBtn.className = 'btn btn-primary';
  bookAnotherBtn.textContent = 'Book Another Meeting';
  bookAnotherBtn.addEventListener('click', () => {
    renderSlotPicker(container, organizerId, timezone);
  });
  card.appendChild(bookAnotherBtn);

  container.appendChild(card);
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(text: string): string {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}
