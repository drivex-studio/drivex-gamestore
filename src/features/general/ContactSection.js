// src/features/general/ContactSection.js

import { gsap } from '../../vendor.js';
import { initAnimatedHeadline, initSanityImage, SanityLink } from '../shared.js';
import { usePageEnter } from '../../hooks/usePageEnter.js';
import { usePageEnterContext } from '../../hooks/usePageEnterContext.js';
import { initAnimatedButton as AnimatedButton } from '../../components/ui/AnimatedButton.js';
import { initInput } from '../../components/ui/Input.js';
import { initFormHoneypot as FormHoneypot } from '../../components/ui/FormHoneypot.js';
import { useSpamPrevention } from '../../hooks/useSpamPrevention.js';
import { initSanityButton } from '../utilities/SanityButton.js';
import { initPageBuilderSection } from '../utilities/PageBuilderSection.js';
import { cx } from '../../utils/cx.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const CONTACT_ENDPOINT = '/api/submit-contact-form';

const FIELD_CLASS =
  'w-full border-0 border-b border-foreground/20 bg-transparent px-0 py-12 text-body text-foreground placeholder:text-foreground/40 focus:border-foreground focus:outline-none transition-colors';

function buildVisual(image, instances) {
  const wrap = document.createElement('div');
  wrap.className = 'grid-span-12 lg:grid-span-4 order-3 h-full lg:order-none';

  const inner = document.createElement('div');
  inner.className = 'size-full overflow-hidden bg-background-muted min-h-[320px] lg:min-h-0';

  const imageInstance = initSanityImage(null, { image, className: 'size-full object-cover' });
  if (imageInstance) {
    inner.appendChild(imageInstance.el);
    instances.push(imageInstance);
  }

  wrap.appendChild(inner);
  return wrap;
}

const LINE_LINK_CLASS =
  'group relative no-underline outline-none focus-visible:ring-2 focus-visible:ring-brand/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background';

function buildLineUnderline() {
  const wrap = document.createElement('span');
  wrap.className = 'pointer-events-none absolute inset-x-0 -bottom-1';
  wrap.setAttribute('aria-hidden', 'true');

  const top = document.createElement('span');
  top.className =
    'absolute inset-x-0 top-0 h-px origin-left scale-x-100 bg-current transition-transform delay-300 duration-700 [transition-timing-function:cubic-bezier(0.625,0.05,0,1)] group-hover:origin-right group-hover:scale-x-0 group-hover:delay-0 group-focus-visible:origin-right group-focus-visible:scale-x-0 group-focus-visible:delay-0';

  const bottom = document.createElement('span');
  bottom.className =
    'absolute inset-x-0 top-0 h-px origin-right scale-x-0 bg-current transition-transform delay-0 duration-700 [transition-timing-function:cubic-bezier(0.625,0.05,0,1)] group-hover:origin-left group-hover:scale-x-100 group-hover:delay-300 group-focus-visible:origin-left group-focus-visible:scale-x-100 group-focus-visible:delay-300';

  wrap.appendChild(top);
  wrap.appendChild(bottom);
  return wrap;
}

// entry looks like { label: "Email", link: { href, text, openInNewTab, type, ... } }
function buildContactLine({ label, link }) {
  const p = document.createElement('p');
  if (label) p.appendChild(document.createTextNode(`${label}: `));
  const a = SanityLink({ link, children: link.text, className: LINE_LINK_CLASS });
  a.appendChild(buildLineUnderline());
  p.appendChild(a);
  return p;
}

function buildSocialLine({ label, link }) {
  const p = document.createElement('p');
  const a = SanityLink({ link, children: label, className: LINE_LINK_CLASS });
  a.appendChild(buildLineUnderline());
  p.appendChild(a);
  return p;
}

function buildInfoColumn(data, instances) {
  const col = document.createElement('div');
  col.className = 'grid-span-12 lg:grid-span-2 lg:grid-start-6 flex h-full flex-col justify-between';

  const { prefersReducedMotion } = usePageEnterContext();

  const headingWrap = document.createElement('div');
  const headline = initAnimatedHeadline({
    children: data.title,
    as: 'h2',
    skip: prefersReducedMotion,
  });
  headingWrap.appendChild(headline.element);
  instances.push(headline);
  col.appendChild(headingWrap);

  const proseHost = document.createElement('div');
  proseHost.className = 'prose prose-sm mt-auto text-body-sm text-foreground/60';

  const contentWrap = document.createElement('div');
  contentWrap.className = 'flex flex-col gap-16';

  const lineEls = [];
  // data.contact = { email: {label, link}, Julian: {label, link}, Adrian: {label, link}, note }
  const { note, ...contactEntries } = data.contact;
  Object.values(contactEntries).forEach((line) => {
    const el = buildContactLine(line);
    lineEls.push(el);
    contentWrap.appendChild(el);
  });

  contentWrap.appendChild(document.createElement('br'));

  data.socialLinks.forEach((social) => {
    const el = buildSocialLine(social);
    lineEls.push(el);
    contentWrap.appendChild(el);
  });

  const availability = document.createElement('p');
  availability.textContent = note;
  lineEls.push(availability);
  contentWrap.appendChild(availability);

  proseHost.appendChild(contentWrap);
  col.appendChild(proseHost);

  // Reveal is gated behind usePageEnter, exactly like HeroSectionContent's
  // revealSequence -- NOT fired straight from local mount(). Contact is a
  // single, always-in-view section like Hero (no scroll-into-view moment to
  // hook a ScrollTrigger onto), so it should share Hero's page-enter timing
  // rather than a scroll trigger. Keeps real <a> links intact instead of
  // flattening them the way AnimatedProse's text-splitter would.
  if (lineEls.length > 0 && !prefersReducedMotion) {
    gsap.set(lineEls, { opacity: 0, y: 12 });
  }

  let hasRevealed = false;
  function revealSequence() {
    if (hasRevealed) return;
    hasRevealed = true;
    headline.reveal();
    if (lineEls.length === 0) return;
    gsap.to(lineEls, { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out', stagger: 0.08, delay: 0.15 });
  }

  usePageEnter(revealSequence, { priority: 1, skip: prefersReducedMotion });

  function mount() {
    headline.mount();
  }
  function destroy() {}
  instances.push({ mount, destroy });

  return col;
}

function buildInquirySelect(data) {
  const wrap = document.createElement('div');
  wrap.className = 'relative';

  const select = document.createElement('select');
  select.id = 'inquiryType';
  select.name = 'inquiryType';
  select.className = cx(FIELD_CLASS, 'cursor-pointer appearance-none text-foreground/40');

  data.inquiryOptions.forEach((opt) => {
    const option = document.createElement('option');
    option.value = opt.value;
    option.textContent = opt.label;
    select.appendChild(option);
  });

  const arrowNS = 'http://www.w3.org/2000/svg';
  const arrow = document.createElementNS(arrowNS, 'svg');
  arrow.setAttribute('class', 'pointer-events-none absolute top-1/2 right-0 size-16 -translate-y-1/2 text-foreground/40');
  arrow.setAttribute('fill', 'none');
  arrow.setAttribute('stroke', 'currentColor');
  arrow.setAttribute('viewBox', '0 0 24 24');
  arrow.setAttribute('aria-hidden', 'true');
  const path = document.createElementNS(arrowNS, 'path');
  path.setAttribute('stroke-linecap', 'round');
  path.setAttribute('stroke-linejoin', 'round');
  path.setAttribute('stroke-width', '2');
  path.setAttribute('d', 'M19 9l-7 7-7-7');
  arrow.appendChild(path);

  const errorEl = document.createElement('p');
  errorEl.className = 'absolute top-full mt-4 hidden text-body-sm text-brand';

  wrap.appendChild(select);
  wrap.appendChild(arrow);
  wrap.appendChild(errorEl);

  return { wrap, select, errorEl };
}

function buildFieldRow(input, errorEl) {
  const wrap = document.createElement('div');
  wrap.className = 'relative';
  wrap.appendChild(input);
  wrap.appendChild(errorEl);
  return wrap;
}

function makeFieldError() {
  const p = document.createElement('p');
  p.className = 'absolute top-full mt-4 hidden text-body-sm text-brand';
  return p;
}

function setFieldError(fieldEl, errorEl, message) {
  if (message) {
    fieldEl.classList.add('border-red-500');
    errorEl.textContent = message;
    errorEl.classList.remove('hidden');
  } else {
    fieldEl.classList.remove('border-red-500');
    errorEl.textContent = '';
    errorEl.classList.add('hidden');
  }
}

function validateField(name, value) {
  switch (name) {
    case 'firstName':
      return value.trim() === '' ? 'First name is required' : undefined;
    case 'lastName':
      return value.trim() === '' ? 'Last name is required' : undefined;
    case 'email':
      if (value.trim() === '') return 'Email is required';
      if (!EMAIL_RE.test(value)) return 'Please enter a valid email';
      return undefined;
    case 'inquiryType':
      return value === '' ? 'Please select an option' : undefined;
    case 'message':
      return value.trim() === '' ? 'Please tell us about your order' : undefined;
    default:
      return undefined;
  }
}

function buildForm(data, instances) {
  const col = document.createElement('div');
  col.className = 'grid-span-12 lg:grid-span-5 lg:grid-start-9 flex h-full flex-col justify-between';

  // CTA block
  const ctaBlock = document.createElement('div');
  ctaBlock.className = 'mb-48';

  const ctaHeading = document.createElement('h3');
  ctaHeading.className = 'mb-24 text-h4';
  ctaHeading.textContent = data.booking.heading;
  ctaBlock.appendChild(ctaHeading);


  const ctaButtonEl = initSanityButton({
    button: { link: data.booking.cta, theme: 'brand', size: 'cta' },
  });
  if (ctaButtonEl) ctaBlock.appendChild(ctaButtonEl);

  col.appendChild(ctaBlock);

  // Form block
  const formBlock = document.createElement('div');

  const formHeading = document.createElement('h3');
  formHeading.className = 'mb-24 text-h4';
  formHeading.textContent = data.messageForm.heading;
  formBlock.appendChild(formHeading);

  const form = document.createElement('form');
  form.className = 'space-y-24';
  form.noValidate = true;

  const formRef = { current: form };
  const { checkSpam, enhanceFormData, reset: resetSpamPrevention } = useSpamPrevention({ formRef });

  form.appendChild(FormHoneypot());

  const spamNoticeEl = document.createElement('div');
  spamNoticeEl.className = 'hidden text-body-sm text-brand';
  form.appendChild(spamNoticeEl);

  // Name row
  const nameRow = document.createElement('div');
  nameRow.className = 'grid grid-cols-1 gap-24 md:grid-cols-2';

  const firstNameInput = initInput(null, { type: 'text', id: 'firstName', name: 'firstName', placeholder: 'First Name*' });
  firstNameInput.className = FIELD_CLASS;
  const firstNameError = makeFieldError();
  nameRow.appendChild(buildFieldRow(firstNameInput, firstNameError));

  const lastNameInput = initInput(null, { type: 'text', id: 'lastName', name: 'lastName', placeholder: 'Last Name*' });
  lastNameInput.className = FIELD_CLASS;
  const lastNameError = makeFieldError();
  nameRow.appendChild(buildFieldRow(lastNameInput, lastNameError));

  form.appendChild(nameRow);

  // Email + company row
  const contactRow = document.createElement('div');
  contactRow.className = 'grid grid-cols-1 gap-24 md:grid-cols-2';

  const emailInput = initInput(null, { type: 'email', id: 'email', name: 'email', placeholder: 'Email*' });
  emailInput.className = FIELD_CLASS;
  const emailError = makeFieldError();
  contactRow.appendChild(buildFieldRow(emailInput, emailError));

  const companyInput = initInput(null, { type: 'text', id: 'inGameId', name: 'inGameId', placeholder: 'In-Game ID (optional)' });
  companyInput.className = FIELD_CLASS;
  contactRow.appendChild(companyInput);

  form.appendChild(contactRow);

  // Inquiry select
  const { wrap: selectWrap, select: inquirySelect, errorEl: inquiryError } = buildInquirySelect(data);
  form.appendChild(selectWrap);

  // Message
  const messageWrap = document.createElement('div');
  messageWrap.className = 'relative';
  const messageInput = document.createElement('textarea');
  messageInput.id = 'message';
  messageInput.name = 'message';
  messageInput.rows = 5;
  messageInput.placeholder = 'Tell us more about what you need*';
  messageInput.className = cx(FIELD_CLASS, 'resize-none');
  const messageError = makeFieldError();
  messageWrap.appendChild(messageInput);
  messageWrap.appendChild(messageError);
  form.appendChild(messageWrap);

  // Submit
  let isSubmitting = false;
  const submitButton = AnimatedButton(null, {
    type: 'submit',
    theme: 'brand',
    size: 'cta',
    className: 'mt-16 w-full',
    children: 'Send Message',
  });
  submitButton.el.disabled = true;
  form.appendChild(submitButton.el);
  instances.push(submitButton);

  const statusEl = document.createElement('p');
  statusEl.className = 'hidden text-body-sm';
  form.appendChild(statusEl);

  const fieldMap = {
    firstName: { input: firstNameInput, errorEl: firstNameError },
    lastName: { input: lastNameInput, errorEl: lastNameError },
    email: { input: emailInput, errorEl: emailError },
    inquiryType: { input: inquirySelect, errorEl: inquiryError },
    message: { input: messageInput, errorEl: messageError },
  };

  const touched = {};

  function updateSubmitState() {
    const allValid = Object.keys(fieldMap).every((name) => {
      const { input } = fieldMap[name];
      return validateField(name, input.value) === undefined;
    });
    submitButton.el.disabled = !allValid || isSubmitting;
  }

  Object.entries(fieldMap).forEach(([name, { input, errorEl }]) => {
    input.addEventListener('blur', () => {
      touched[name] = true;
      setFieldError(input, errorEl, validateField(name, input.value));
    });
    input.addEventListener('input', () => {
      if (touched[name]) setFieldError(input, errorEl, validateField(name, input.value));
      updateSubmitState();
    });
    input.addEventListener('change', () => {
      if (touched[name]) setFieldError(input, errorEl, validateField(name, input.value));
      updateSubmitState();
    });
  });

  function showSuccessView() {
    formBlock.innerHTML = '';
    const label = document.createElement('p');
    label.className = 'text-accent-sm text-brand';
    label.textContent = 'Message sent';
    const title = document.createElement('h3');
    title.className = 'text-h4';
    title.textContent = 'Thank you for reaching out';
    const note = document.createElement('p');
    note.className = 'text-body text-foreground/60';
    note.textContent = "We'll get back to you within 24 hours.";
    formBlock.appendChild(label);
    formBlock.appendChild(title);
    formBlock.appendChild(note);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    spamNoticeEl.classList.add('hidden');

    const allErrors = {};
    Object.keys(fieldMap).forEach((name) => {
      touched[name] = true;
      const { input, errorEl } = fieldMap[name];
      const message = validateField(name, input.value);
      allErrors[name] = message;
      setFieldError(input, errorEl, message);
    });
    if (Object.values(allErrors).some((m) => m !== undefined)) return;

    const spamResult = checkSpam(form);
    if (spamResult.isSpam) {
      spamNoticeEl.textContent = spamResult.message;
      spamNoticeEl.classList.remove('hidden');
      return;
    }

    isSubmitting = true;
    submitButton.el.disabled = true;
    submitButton.el.textContent = 'Sending...';
    statusEl.classList.add('hidden');

    try {
      const formData = enhanceFormData(new FormData(form));
      const response = await fetch(CONTACT_ENDPOINT, { method: 'POST', body: formData });
      if (response.ok) {
        showSuccessView();
        form.reset();
        resetSpamPrevention();
      } else {
        statusEl.textContent = 'Failed to send message. Please try again.';
        statusEl.className = 'text-body-sm text-brand';
        statusEl.classList.remove('hidden');
      }
    } catch (err) {
      statusEl.textContent = 'Failed to send message. Please try again.';
      statusEl.className = 'text-body-sm text-brand';
      statusEl.classList.remove('hidden');
    } finally {
      isSubmitting = false;
      submitButton.el.textContent = 'Send Message';
      updateSubmitState();
    }
  }

  form.addEventListener('submit', handleSubmit);

  formBlock.appendChild(form);
  col.appendChild(formBlock);

  instances.push({
    destroy() {
      form.removeEventListener('submit', handleSubmit);
    },
  });

  return col;
}

// Note: ctaSection.js already exports a different `initContactSection`
// (a small CTA block reused across other pages). This one is the full
// contact-page hero section, named distinctly to avoid confusion.
export function initContactPageSection(mountTarget, props = {}) {
  const data = { ...contactSectionDataDefaults(), ...props };

  // No `name` passed on purpose: initPageBuilderSection falls back to
  // data-page-builder-section="true" when name is omitted, which matches
  // this section (it's the only one on the contact page, unlike ctaSection.js
  // which passes name: 'ctaSection' since it's reused across pages).
  const section = initPageBuilderSection({
    theme: data.theme || 'light',
    padding: 'pt-0 pb-0',
    gridClassName: '!gap-y-64 items-center lg:min-h-750',
    mainContainer: mountTarget,
  });

  section.gridContainerEl.className = cx(
    section.gridContainerEl.className,
    'flex items-center py-header lg:min-h-svh'
  );

  const instances = [];

  section.gridLayoutEl.appendChild(buildVisual(data.image, instances));
  section.gridLayoutEl.appendChild(buildInfoColumn(data, instances));
  section.gridLayoutEl.appendChild(buildForm(data, instances));

  function mount() {
    instances.forEach((instance) => instance?.mount?.());
  }

  function destroy() {
    instances.forEach((instance) => instance?.destroy?.());
    section.destroy();
  }

  return { element: section.element, mount, destroy };
}

function contactSectionDataDefaults() {
  return {};
}