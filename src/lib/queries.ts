import type {
  CharacterBasicInfo,
  CharacterBeautyInfo,
  CharacterGuildInfo,
  CharacterIdInfo,
  CharacterItemInfo,
  CharacterPetInfo,
  CharacterSkillInfo,
  CharacterStatInfo,
  CharacterVmatrixInfo,
} from '~/types/queries';

const isProduction = process.env.NODE_ENV === 'production';
const LIVE_KEY = process.env.NEXT_PUBLIC_NEXON_OPEN_API_LIVE_KEY;
const TEST_KEY = process.env.NEXT_PUBLIC_NEXON_OPEN_API_TEST_KEY;
const BASE_URL = process.env.NEXT_PUBLIC_NEXON_OPEN_API_URL;
const API_KEY = isProduction ? LIVE_KEY : TEST_KEY;
const MAPLE_M_PREFIX = `${BASE_URL}/maplestorym/v1`;

const headers = {
  ['x-nxopen-api-key']: API_KEY || '',
};

export const fetchCharacterId = async ({
  characterName,
  worldName,
}: {
  characterName: string;
  worldName: string;
}): Promise<CharacterIdInfo | undefined> => {
  const response = await fetch(
    `${MAPLE_M_PREFIX}/id?character_name=${characterName}&world_name=${worldName}`,
    {
      method: 'GET',
      headers,
    }
  );

  if (!response.ok) {
    throw new Error('Character not found');
  }

  return response.json();


};

export const fetchCharacterBasicInfo = async (
  ocid: string
): Promise<CharacterBasicInfo> => {
  const response = await fetch(
    `${MAPLE_M_PREFIX}/character/basic?ocid=${ocid}`,
    {
      method: 'GET',
      headers,
    }
  );

  return response.json();
};

export const fetchCharacterItemInfo = async (
  ocid: string
): Promise<CharacterItemInfo> => {
  const response = await fetch(
    `${MAPLE_M_PREFIX}/character/item-equipment?ocid=${ocid}`,
    {
      method: 'GET',
      headers,
    }
  );

  return response.json();
};

export const fetchCharacterStatInfo = async (
  ocid: string
): Promise<CharacterStatInfo> => {
  const response = await fetch(
    `${MAPLE_M_PREFIX}/character/stat?ocid=${ocid}`,
    {
      method: 'GET',
      headers,
    }
  );

  return response.json();
};

export const fetchCharacterGuildInfo = async (
  ocid: string
): Promise<CharacterGuildInfo> => {
  const response = await fetch(
    `${MAPLE_M_PREFIX}/character/guild?ocid=${ocid}`,
    {
      method: 'GET',
      headers,
    }
  );

  return response.json();
};

export const fetchCharacterBeautyInfo = async (
  ocid: string
): Promise<CharacterBeautyInfo> => {
  const response = await fetch(
    `${MAPLE_M_PREFIX}/character/beauty-equipment?ocid=${ocid}`,
    {
      method: 'GET',
      headers,
    }
  );

  return response.json();
};

export const fetchCharacterPetInfo = async (
  ocid: string
): Promise<CharacterPetInfo> => {
  const response = await fetch(
    `${MAPLE_M_PREFIX}/character/pet-equipment?ocid=${ocid}`,
    {
      method: 'GET',
      headers,
    }
  );

  return response.json();
};

export const fetchCharacterSkillInfo = async (
  ocid: string
): Promise<CharacterSkillInfo> => {
  const response = await fetch(
    `${MAPLE_M_PREFIX}/character/skill-equipment?ocid=${ocid}`,
    {
      method: 'GET',
      headers,
    }
  );

  return response.json();
};

export const fetchCharacterVmatrixInfo = async (
  ocid: string
): Promise<CharacterVmatrixInfo> => {
  const response = await fetch(
    `${MAPLE_M_PREFIX}/character/vmatrix?ocid=${ocid}`,
    {
      method: 'GET',
      headers,
    }
  );

  return response.json();
};
