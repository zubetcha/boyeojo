import { CharacterBasicInfo } from "~/types/queries";

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

export const getCharacterTag = (basicInfo: CharacterBasicInfo | null) => {
  if (!basicInfo || !basicInfo.world_name.includes('크로아')) {
    return;
  }

  const characterLabels: Record<string, string> = {
    홍차: '🧙🏻‍♀️ 대마법사',
    리땡: '🧙🏻‍♂️ 흑마법사',
    서진영: '약해빠짐',
    뚱이: '🧑🏼‍⚖️ 빛의 심판자',
    종아: '👼🏻 응애'
  }

  const label = characterLabels[basicInfo.character_name];

  if (!label) {
    return;
  }

  return {
    color: 'error',
    label,
  }
}