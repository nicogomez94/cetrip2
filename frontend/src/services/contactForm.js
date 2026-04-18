import api from './api';

export const CONTACT_FORM_TO = 'nicolasgomez94@gmail.com';
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

export const submitContactForm = async (form) => {
  const trimmedForm = trimContactFormValues(form);
  const response = await api.post(CONTACT_FORM_URL, {
    name: trimmedForm.name,
    email: trimmedForm.email,
    to: CONTACT_FORM_TO,
    message: trimmedForm.message,
    site: CONTACT_FORM_SITE,
    company: '',
  });

  return {
    ...response.data,
    trimmedForm,
  };
};
