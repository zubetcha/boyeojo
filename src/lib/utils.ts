export const formatDate = (datetime: string | null | undefined) => {
  return datetime ? datetime.split('T')[0] : '';
}

export const formatDatetime = (datetime: string | null | undefined) => {
  if (!datetime) {
    return '';
  };

  const [date, time] = datetime.split('T');
  return `${date} ${time.slice(0, 5)}`;
}
