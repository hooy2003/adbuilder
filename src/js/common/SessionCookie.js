import Cookies from 'js-cookie';
import uuidv4 from 'uuid/v4';

function getCookieId() {
  let cookieId = Cookies.get('VM5ADN_COOKIEID');

  if (!cookieId) {
    cookieId = uuidv4();
  }

  refreshCookieId(cookieId);
  return cookieId;
}

function refreshCookieId(cookieId) {
  Cookies.remove('VM5ADN_COOKIEID');
  Cookies.set('VM5ADN_COOKIEID', cookieId, { expires: 365 });
}

export { getCookieId, refreshCookieId };
