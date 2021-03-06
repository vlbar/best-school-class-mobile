import Color from '../constants';

export default function getContrastColor(code, darkColor = Color.darkGray, lightColor = Color.veryLightGray) {
  code = code.substr(1);
  const red = parseInt(code.substr(0, 2), 16);
  const green = parseInt(code.substr(2, 2), 16);
  const blue = parseInt(code.substr(4, 2), 16);

  var sum = Math.round((red * 299 + green * 587 + blue * 114) / 1000);
  return isNaN(sum) || sum > 128 ? darkColor : lightColor;
}
