import { stripRichText } from './serviceContent';

export const ADMIN_PLAIN_TEXT_LIMIT = 300;

export const exceedsAdminPlainTextLimit = (fieldName = '', value = '') => {
  void fieldName;
  return String(value).length > ADMIN_PLAIN_TEXT_LIMIT;
};

export const getAdminRichTextLength = (value = '') => stripRichText(value).length;

export const exceedsAdminRichTextLimit = (value = '') =>
  getAdminRichTextLength(value) > ADMIN_PLAIN_TEXT_LIMIT;
