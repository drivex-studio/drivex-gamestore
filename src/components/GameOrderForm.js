import { initInput } from './ui/Input.js';
import { initAnimatedButton as AnimatedButton } from './ui/AnimatedButton.js';
import { cx } from '../utils/cx.js';

import { initFormHoneypot as FormHoneypot } from './ui/FormHoneypot.js';
import { useSpamPrevention } from '../hooks/useSpamPrevention.js';

const GAME_ORDER_ENDPOINT = '/api/submit-game-order';

async function submitGameOrderAction(prevState, formData) {
  try {
    const response = await fetch(GAME_ORDER_ENDPOINT, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      let message = 'Something went wrong. Please try again.';
      try {
        const data = await response.json();
        if (data?.error) message = data.error;
      } catch (_) {
        
      }
      return { success: false, error: message };
    }

    return { success: true, error: '' };
  } catch (err) {
    return { success: false, error: 'Network error. Please try again.' };
  }
}

function createActionState(action, initialState) {
  let state = initialState;
  let isPending = false;
  const listeners = new Set();

  function notify() {
    listeners.forEach((fn) => fn());
  }

  async function dispatch(formData) {
    isPending = true;
    notify();

    const result = await action(state, formData);
    state = result;
    isPending = false;
    notify();
  }

  return {
    getState: () => state,
    isPending: () => isPending,
    dispatch,
    subscribe: (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
  };
}

export function initGameOrderForm(parentElement, props = {}) {
  const {
    heading,
    description,
    buttonText,
    successMessage,
    buttonTheme,
    className,
  } = props;

  const resolvedSuccessMessage = successMessage === undefined ? "Order received. We'll deliver your item soon." : successMessage;
  const resolvedButtonTheme = buttonTheme === undefined ? 'dark' : buttonTheme;

  const root = document.createElement('div');
  root.className = className || '';
  parentElement.appendChild(root);

  const formRef = { current: null };

  const { checkSpam, enhanceFormData, reset: resetSpamPrevention } = useSpamPrevention({ formRef });

  const actionState = createActionState(
    (prevState, formData) => submitGameOrderAction(prevState, formData),
    { success: false, error: '' }
  );

  let clientError = null;

  function setClientError(message) {
    clientError = message;
    render();
  }

  function handleSubmit(e) {
    e.preventDefault();
    setClientError(null);
    const formEl = formRef.current;
    if (!formEl) return;
    const spamResult = checkSpam(formEl);
    if (spamResult.isSpam) {
      setClientError(spamResult.message);
      return;
    }
    const enhancedFormData = enhanceFormData(new FormData(formEl));

    actionState.dispatch(enhancedFormData);
  }

  actionState.subscribe(() => {
    if (actionState.getState().success) {
      formRef.current?.reset();
      resetSpamPrevention();
    }
    render();
  });

  function renderSuccessView() {
    root.innerHTML = '';
    root.className = className || '';
    if (heading) {
      const headingEl = document.createElement('p');
      headingEl.className = 'mb-8 font-medium text-body text-foreground';
      headingEl.textContent = heading;
      root.appendChild(headingEl);
    }
    const messageEl = document.createElement('p');
    messageEl.className = 'text-body text-foreground-muted';
    messageEl.textContent = resolvedSuccessMessage;
    root.appendChild(messageEl);
  }

  function renderFormView() {
    root.innerHTML = '';
    root.className = className || '';

    if (heading) {
      const headingEl = document.createElement('p');
      headingEl.className = 'mb-8 font-medium text-body text-foreground';
      headingEl.textContent = heading;
      root.appendChild(headingEl);
    }

    if (description) {
      const descriptionEl = document.createElement('p');
      descriptionEl.className = 'mb-16 text-body-sm text-foreground-muted';
      descriptionEl.textContent = description;
      root.appendChild(descriptionEl);
    }

    const form = document.createElement('form');
    form.className = 'flex flex-col gap-6';
    formRef.current = form;
    form.addEventListener('submit', handleSubmit);

    const fieldsWrap = document.createElement('div');
    fieldsWrap.className = 'flex flex-col gap-6';

    const playerNameInput = initInput(null, {
      type: 'text',
      name: 'playerName',
      placeholder: 'Player Name',
      required: true,
      autoComplete: 'off',
      size: 'sm',
    });

    const inGameIdInput = initInput(null, {
      type: 'text',
      name: 'inGameId',
      placeholder: 'In-Game ID',
      required: true,
      autoComplete: 'off',
      size: 'sm',
    });

    fieldsWrap.appendChild(playerNameInput);
    fieldsWrap.appendChild(inGameIdInput);

    const isPending = actionState.isPending();
    const submitLabel = isPending ? '...' : (buttonText === undefined ? 'Submit Order' : buttonText);
    const submitButton = AnimatedButton(null, {
      type: 'submit',
      disabled: isPending,
      theme: resolvedButtonTheme,
      size: 'sm',
      className: 'w-full',
      children: submitLabel,
    });
    fieldsWrap.appendChild(submitButton.el);

    form.appendChild(fieldsWrap);

    form.appendChild(FormHoneypot());

    const helperNote = document.createElement('p');
    helperNote.className = 'text-body-sm text-foreground-muted opacity-60';
    helperNote.textContent = 'Please double-check your In-Game ID -- items are delivered directly to this account.';
    form.appendChild(helperNote);

    const state = actionState.getState();
    const errorMessage = clientError || (!state.success && state.error);
    if (errorMessage) {
      const errorEl = document.createElement('p');
      errorEl.className = cx('text-body-sm', resolvedButtonTheme === 'dark' ? 'text-brand' : 'text-red-500');
      errorEl.textContent = errorMessage;
      form.appendChild(errorEl);
    }

    root.appendChild(form);
  }

  function render() {
    if (actionState.getState().success) {
      renderSuccessView();
    } else {
      renderFormView();
    }
  }

  render();

  return root;
}
