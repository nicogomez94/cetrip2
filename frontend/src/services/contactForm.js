import axios from 'axios';

export const CONTACT_FORM_TO = 'cetripcentro@gmail.com';
export const CONTACT_FORM_SITE = 'https://cetrip.com.ar/';

const CONTACT_FORM_URL = 'https://contact-form-service-e8aa.onrender.com/api/contact';

export const CONTACT_FORM_EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const trimContactFormValues = (form) => ({
  name: String(form?.name || '').trim(),
  email: String(form?.email || '').trim(),
  phone: String(form?.phone || '').trim(),
  subject: String(form?.subject || '').trim(),
  message: String(form?.message || '').trim(),
});

export const resolveContactFormTo = (value) => String(value || '').trim() || CONTACT_FORM_TO;

export const submitContactForm = async (form, options = {}) => {
  const trimmedForm = trimContactFormValues(form);
  const to = resolveContactFormTo(options.to);
  const response = await axios.post(
    CONTACT_FORM_URL,
    {
      name: trimmedForm.name,
      email: trimmedForm.email,
      to,
      message: trimmedForm.message,
      site: CONTACT_FORM_SITE,
      company: '',
    },
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );

  return {
    ...response.data,
    trimmedForm,
  };
};
