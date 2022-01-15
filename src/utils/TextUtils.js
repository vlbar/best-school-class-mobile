export function clearHtmlTags(htmlString) {
    if (!htmlString || htmlString.trim().length === 0) return "";
    return htmlString.replace(/&nbsp;/g, ' ').replace(/<br ?\/?>/ig,"\n").replace(/<[^>]*>?/gm, '');
  }