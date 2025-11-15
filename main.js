document.addEventListener('DOMContentLoaded', () => {
  const nav = document.querySelector('.site-nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navClose = document.querySelector('.nav-close');

  if (nav && navToggle) {
    const closeNav = () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
    };

    navToggle.addEventListener('click', () => {
      nav.classList.toggle('open');
      const expanded = nav.classList.contains('open');
      navToggle.setAttribute('aria-expanded', expanded ? 'true' : 'false');
    });

    if (navClose) {
      navClose.addEventListener('click', closeNav);
    }

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 768) {
          closeNav();
        }
      });
    });
  }

  document
    .querySelectorAll('[data-scroll]')
    .forEach((link) => {
      link.addEventListener('click', (event) => {
        const targetId = link.getAttribute('href');
        if (targetId && targetId.startsWith('#')) {
          const targetElement = document.querySelector(targetId);
          if (targetElement) {
            event.preventDefault();
            targetElement.scrollIntoView({ behavior: 'smooth' });
            targetElement.setAttribute('tabindex', '-1');
            targetElement.focus({ preventScroll: true });
            targetElement.addEventListener(
              'blur',
              () => targetElement.removeAttribute('tabindex'),
              { once: true }
            );
          }
        }
      });
    });

  const faqContainer = document.querySelector('.faq');
  if (faqContainer) {
    const questions = faqContainer.querySelectorAll('.faq-question');
    questions.forEach((button) => {
      button.addEventListener('click', () => {
        const expanded = button.getAttribute('aria-expanded') === 'true';
        questions.forEach((other) => {
          if (other !== button) {
            other.setAttribute('aria-expanded', 'false');
            const otherAnswer = document.getElementById(other.dataset.target);
            if (otherAnswer) {
              otherAnswer.style.maxHeight = null;
              otherAnswer.classList.remove('open');
            }
          }
        });

        const answer = document.getElementById(button.dataset.target);
        if (answer) {
          if (expanded) {
            button.setAttribute('aria-expanded', 'false');
            answer.style.maxHeight = null;
            answer.classList.remove('open');
          } else {
            button.setAttribute('aria-expanded', 'true');
            answer.style.maxHeight = `${answer.scrollHeight}px`;
            answer.classList.add('open');
          }
        }
      });
    });
  }

  const form = document.getElementById('quote-form');
  if (form) {
    const successMessage = form.querySelector('.success-message');

    const hideSuccessMessage = () => {
      if (successMessage) {
        successMessage.classList.remove('show');
      }
    };

    form.addEventListener('input', hideSuccessMessage);
    form.addEventListener('change', hideSuccessMessage);

    const validateField = (field) => {
      const container = field.closest('.field');
      const errorContainer = container ? container.querySelector('.error') : null;
      let errorText = '';
      const value = field.value.trim();

      if (field.type === 'radio') {
        const group = form.querySelectorAll(`input[name="${field.name}"]`);
        const isChecked = Array.from(group).some((radio) => radio.checked);
        if (!isChecked) {
          errorText = 'Select an option.';
        }
      } else if (field.dataset.required !== undefined && !value) {
        errorText = 'This field is required.';
      } else if (field.type === 'email' && value) {
        const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailPattern.test(value)) {
          errorText = 'Enter a valid email address.';
        }
      }

      if (errorContainer) {
        errorContainer.textContent = errorText;
      }

      if (errorText) {
        field.setAttribute('aria-invalid', 'true');
      } else {
        field.removeAttribute('aria-invalid');
      }

      return !errorText;
    };

    const requiredFields = Array.from(form.querySelectorAll('[data-required], input[type="email"]'));

    requiredFields.forEach((field) => {
      const eventName = field.type === 'radio' ? 'change' : 'blur';
      field.addEventListener(eventName, () => validateField(field));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      let firstInvalid = null;
      const isValid = requiredFields.every((field) => {
        const valid = validateField(field);
        if (!valid && !firstInvalid) {
          firstInvalid = field;
        }
        return valid;
      });

      if (isValid) {
        if (successMessage) {
          successMessage.classList.add('show');
          successMessage.focus({ preventScroll: true });
        }
        form.reset();
        requiredFields.forEach((field) => field.removeAttribute('aria-invalid'));
        form.querySelectorAll('.error').forEach((error) => {
          error.textContent = '';
        });
        // TODO: Integrate with a backend or service (e.g., Formspree, EmailJS) to handle submissions.
      } else if (firstInvalid) {
        firstInvalid.focus();
      }
    });
  }
});
