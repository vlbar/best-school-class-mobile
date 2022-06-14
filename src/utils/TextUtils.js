export function clearHtmlTags(htmlString) {
  if (!htmlString || htmlString.trim().length === 0) return '';
  return htmlString
    .replace(/&nbsp;/g, ' ')
    .replace(/<br ?\/?>/gi, '\n')
    .replace(/<[^>]*>?/gm, '');
}

export function capitalizeFirstLetter(string) {
  return string[0].toUpperCase() + string.slice(1);
}