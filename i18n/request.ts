import {getRequestConfig} from 'next-intl/server';
import type {AbstractIntlMessages} from 'next-intl';

export default getRequestConfig(async ({locale = 'fr'}) => {
  let messages: AbstractIntlMessages;

  switch (locale) {
    case 'ar':
      messages = (await import('../messages/ar.json')).default as AbstractIntlMessages;
      break;
    case 'fr':
    default:
      messages = (await import('../messages/fr.json')).default as AbstractIntlMessages;
      break;
  }

  return {
    locale,
    messages
  };
});
