export const getDomain = (url: string, subdomain?: boolean) => {
  subdomain = subdomain || false;

  let newUrl = url.replace(/(https?:\/\/)?(www.)?/i, '');

  if (!subdomain) {
    let splitUrls = newUrl.split('.');

    newUrl = splitUrls.slice(newUrl.length - 2).join('.');
  }

  if (newUrl.indexOf('/') !== -1) {
    return newUrl.split('/')[0];
  }

  return newUrl;
};
