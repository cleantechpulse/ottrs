export const getCurrentHourText = (h) => {
  if (h === 0) {
    return '12AM (Midnight)';
  } else if (h === 12) {
    return '12PM (Noon)';
  } else if (h < 12) {
    return h + 'AM';
  } else {
    return (h - 12) + 'PM';
  }
}

export const getAmPm = (h) => {
  if (h === 0 || h === 24) {
    return 'midnight';
  } else if (h === 12) {
    return 'noon';
  } else {
    return `${h % 12} ${h % 6 === 0 ? (h < 12 ? 'AM' : 'PM') : ''}`;
  }
}