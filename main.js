document.addEventListener('DOMContentLoaded', () => {
  // =============================================
  // Mobile Navigation
  // =============================================
  const nav = document.querySelector('.site-nav');
  const navToggle = document.querySelector('.nav-toggle');
  const navClose = document.querySelector('.nav-close');

  if (nav && navToggle) {
    const closeNav = () => {
      nav.classList.remove('open');
      navToggle.setAttribute('aria-expanded', 'false');
      document.body.style.overflow = '';
    };

    navToggle.addEventListener('click', () => {
      const isOpen = nav.classList.toggle('open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      document.body.style.overflow = isOpen ? 'hidden' : '';
    });

    if (navClose) {
      navClose.addEventListener('click', closeNav);
    }

    nav.querySelectorAll('a').forEach((link) => {
      link.addEventListener('click', () => {
        if (window.innerWidth < 768) closeNav();
      });
    });
  }

  // =============================================
  // Sticky Header Shadow on Scroll
  // =============================================
  const header = document.getElementById('site-header');
  if (header) {
    let lastScrollY = 0;
    const onScroll = () => {
      const scrollY = window.scrollY;
      if (scrollY > 50) {
        header.classList.add('scrolled');
      } else {
        header.classList.remove('scrolled');
      }
      lastScrollY = scrollY;
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
  }

  // =============================================
  // Smooth Scroll for [data-scroll] Links
  // =============================================
  document.querySelectorAll('[data-scroll]').forEach((link) => {
    link.addEventListener('click', (event) => {
      const targetId = link.getAttribute('href');
      if (targetId && targetId.startsWith('#')) {
        const target = document.querySelector(targetId);
        if (target) {
          event.preventDefault();
          const headerHeight = header ? header.offsetHeight : 0;
          const top = target.getBoundingClientRect().top + window.scrollY - headerHeight - 20;
          window.scrollTo({ top, behavior: 'smooth' });
          target.setAttribute('tabindex', '-1');
          target.focus({ preventScroll: true });
          target.addEventListener('blur', () => target.removeAttribute('tabindex'), { once: true });
        }
      }
    });
  });

  // =============================================
  // Scroll Animations (Intersection Observer)
  // =============================================
  const fadeElements = document.querySelectorAll('.fade-up');
  if (fadeElements.length > 0 && 'IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
    );
    fadeElements.forEach((el) => observer.observe(el));
  } else {
    fadeElements.forEach((el) => el.classList.add('visible'));
  }

  // =============================================
  // FAQ Accordion
  // =============================================
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
            answer.style.maxHeight = answer.scrollHeight + 'px';
            answer.classList.add('open');
          }
        }
      });
    });
  }

  // =============================================
  // Contact Form Validation & Submission
  // =============================================
  const form = document.getElementById('quote-form');
  if (form) {
    const successMessage = form.querySelector('.success-message');

    const hideSuccessMessage = () => {
      if (successMessage) successMessage.classList.remove('show');
    };

    form.addEventListener('input', hideSuccessMessage);
    form.addEventListener('change', hideSuccessMessage);

    const validateField = (field) => {
      const container = field.closest('.field') || field.closest('fieldset');
      const errorContainer = container ? container.querySelector('.error') : null;
      let errorText = '';
      const value = field.value ? field.value.trim() : '';

      if (field.type === 'radio') {
        const group = form.querySelectorAll('input[name="' + field.name + '"]');
        const isChecked = Array.from(group).some((r) => r.checked);
        if (!isChecked) errorText = 'Please select an option.';
      } else if (field.dataset.required !== undefined && !value) {
        errorText = 'This field is required.';
      } else if (field.type === 'email' && value) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
          errorText = 'Please enter a valid email address.';
        }
      }

      if (errorContainer) errorContainer.textContent = errorText;

      if (errorText) {
        field.setAttribute('aria-invalid', 'true');
      } else {
        field.removeAttribute('aria-invalid');
      }

      return !errorText;
    };

    const requiredFields = Array.from(
      form.querySelectorAll('[data-required], input[type="email"], input[type="radio"][required]')
    );

    requiredFields.forEach((field) => {
      const eventName = field.type === 'radio' ? 'change' : 'blur';
      field.addEventListener(eventName, () => validateField(field));
    });

    form.addEventListener('submit', (event) => {
      event.preventDefault();
      let firstInvalid = null;

      const isValid = requiredFields.every((field) => {
        const valid = validateField(field);
        if (!valid && !firstInvalid) firstInvalid = field;
        return valid;
      });

      if (isValid) {
        // Submit via Formspree or mailto fallback
        const formData = new FormData(form);
        const action = form.getAttribute('action');

        if (action && action.includes('formspree.io')) {
          fetch(action, {
            method: 'POST',
            body: formData,
            headers: { Accept: 'application/json' },
          })
            .then((response) => {
              if (response.ok) {
                showSuccess();
              } else {
                fallbackMailto(formData);
              }
            })
            .catch(() => {
              fallbackMailto(formData);
            });
        } else {
          fallbackMailto(formData);
        }
      } else if (firstInvalid) {
        firstInvalid.focus();
      }
    });

    function showSuccess() {
      if (successMessage) {
        successMessage.classList.add('show');
        successMessage.focus({ preventScroll: true });
      }
      form.reset();
      requiredFields.forEach((f) => f.removeAttribute('aria-invalid'));
      form.querySelectorAll('.error').forEach((e) => (e.textContent = ''));
    }

    function fallbackMailto(formData) {
      const subject = encodeURIComponent('Quote Request from ' + (formData.get('name') || 'Website'));
      const body = encodeURIComponent(
        'Name: ' + (formData.get('name') || '') +
        '\nCompany: ' + (formData.get('company') || '') +
        '\nEmail: ' + (formData.get('email') || '') +
        '\nPhone: ' + (formData.get('phone') || '') +
        '\nCity: ' + (formData.get('city') || '') +
        '\nWaste Type: ' + (formData.get('waste_type') || '') +
        '\nUrgency: ' + (formData.get('urgency') || '') +
        '\nDetails: ' + (formData.get('details') || '')
      );
      window.location.href = 'mailto:andrew@haz3.com?subject=' + subject + '&body=' + body;
      showSuccess();
    }
  }
});
