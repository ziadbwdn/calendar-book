/**
 * DOM manipulation utilities
 */

export function setHtml(elementId: string, html: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = html;
  }
}

export function setText(elementId: string, text: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.textContent = text;
  }
}

export function addClass(elementId: string, className: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.add(className);
  }
}

export function removeClass(elementId: string, className: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.remove(className);
  }
}

export function toggleClass(elementId: string, className: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.classList.toggle(className);
  }
}

export function getValue(elementId: string): string {
  const element = document.getElementById(elementId) as HTMLInputElement;
  return element ? element.value : '';
}

export function setValue(elementId: string, value: string): void {
  const element = document.getElementById(elementId) as HTMLInputElement;
  if (element) {
    element.value = value;
  }
}

export function show(elementId: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = '';
  }
}

export function hide(elementId: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.style.display = 'none';
  }
}

export function isHidden(elementId: string): boolean {
  const element = document.getElementById(elementId);
  return element ? element.style.display === 'none' : false;
}

export function on(elementId: string, event: string, handler: (e: Event) => void): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.addEventListener(event, handler);
  }
}

export function off(elementId: string, event: string, handler: (e: Event) => void): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.removeEventListener(event, handler);
  }
}

export function clear(elementId: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.innerHTML = '';
  }
}

export function append(elementId: string, html: string): void {
  const element = document.getElementById(elementId);
  if (element) {
    element.insertAdjacentHTML('beforeend', html);
  }
}

export function getElement(elementId: string): HTMLElement | null {
  return document.getElementById(elementId);
}

export function querySelector(selector: string): HTMLElement | null {
  return document.querySelector(selector);
}

export function querySelectorAll(selector: string): NodeListOf<Element> {
  return document.querySelectorAll(selector);
}
