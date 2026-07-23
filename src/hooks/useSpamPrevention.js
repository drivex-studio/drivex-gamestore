
const INTERACTION_EVENTS = ['keydown', 'mousemove', 'touchstart', 'click'];

export function useSpamPrevention({
  honeypotField = 'website',
  honeypotDuration = 2000,
  formRef,
  debug = false,
} = {}) {
  let o_startTime = Date.now();
  let s_hasInteracted = false;

  if (debug) {
    console.log('[Spam Prevention] Initialized', {
      honeypotField,
      honeypotDuration,
      target: formRef?.current ? 'form' : 'document',
    });
  }

  {
    const handleInteraction = () => {
      if (debug) console.log('[Spam Prevention] User interaction detected');
      s_hasInteracted = true;
    };
    const target = formRef?.current ?? document;
    for (const eventName of INTERACTION_EVENTS) {
      target.addEventListener(eventName, handleInteraction, { once: true });
    }
  }

  function checkSpam(formEl) {
    const fillTime = Date.now() - o_startTime;
    const isTooFast = fillTime < honeypotDuration;
    const honeypotEl = formEl.querySelector(`[name="${honeypotField}"]`);
    const hasHoneypotValue = !!honeypotEl?.value?.trim();
    const noInteraction = !s_hasInteracted;

    if (debug) {
      console.log('[Spam Prevention] Spam check:', {
        fillTime: `${fillTime}ms`,
        isTooFast,
        hasHoneypotValue,
        honeypotValue: honeypotEl?.value || '(empty)',
        noInteraction,
      });
    }

    if (hasHoneypotValue) {
      return {
        isSpam: true,
        reason: 'honeypot_filled',
        message: 'Invalid submission detected. Please refresh the page and try again.',
      };
    }
    if (isTooFast) {
      return {
        isSpam: true,
        reason: 'too_fast',
        message:
          'Please take your time filling out the form. Form submissions are processed after a brief delay.',
      };
    }
    if (noInteraction) {
      return {
        isSpam: true,
        reason: 'no_interaction',
        message:
          'Please interact with the form fields before submitting. Click or type in the fields to continue.',
      };
    }
    return { isSpam: false };
  }

  function getMetadata() {
    return {
      hasInteraction: s_hasInteracted,
      fillTime: Date.now() - o_startTime,
      startTime: o_startTime,
    };
  }

  function enhanceFormData(formData) {
    const fillTime = Date.now() - o_startTime;
    formData.append('_submissionTime', String(fillTime));
    if (debug) {
      console.log(
        '[Spam Prevention] Enhanced form data with submission time:',
        `${fillTime}ms`
      );
    }
    return formData;
  }

  function reset() {
    o_startTime = Date.now();
    s_hasInteracted = false;

    const handleInteraction = () => {
      if (debug) console.log('[Spam Prevention] User interaction detected');
      s_hasInteracted = true;
    };
    const target = formRef?.current ?? document;
    for (const eventName of INTERACTION_EVENTS) {
      target.addEventListener(eventName, handleInteraction, { once: true });
    }

    if (debug) {
      console.log('[Spam Prevention] Reset - timing and interaction tracking restarted');
    }
  }

  return {
    checkSpam,
    getMetadata,
    enhanceFormData,
    reset,
  };
}
