export function isEquivalent(a, b, blackList = []) {
  if (b == undefined) return false;
  let aProps = Object.getOwnPropertyNames(a);
  let bProps = Object.getOwnPropertyNames(b);

  if (!blackList.length && aProps.length != bProps.length) {
    return false;
  }

  for (var i = 0; i < aProps.length; i++) {
    let propName = aProps[i];
    if (blackList.length && blackList.includes(propName)) continue;

    if (a[propName] instanceof Array) {
      if (a[propName].length !== b[propName].length) return false;

      for (let j = 0; j < a[propName].length; j++) {
        if (a[propName][j] instanceof Object) {
          if (!isEquivalent(a[propName][j], b[propName][j])) return false;
        } else {
          if (a[propName][j] !== b[propName][j]) return false;
        }
      }
    } else {
      if (a[propName] !== b[propName]) return false;
    }
  }

  return true;
}
