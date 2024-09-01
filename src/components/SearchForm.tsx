'use client';

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import { Button, Input, Modal, Select } from 'antd';

import { WORLDS } from '~/lib/constants';
import { fetchCharacterBasicInfo, fetchCharacterGuildInfo, fetchCharacterId, fetchCharacterItemInfo, fetchCharacterPetInfo, fetchCharacterSkillInfo, fetchCharacterStatInfo, fetchCharacterVmatrixInfo } from '~/lib/queries';

import type { CharacterInfo, RefinedVmatrix } from '~/app/page';

const MODAL_INFO = {
  isOpen: false,
  content: null
}

type ModalInfo = {
  isOpen: boolean;
  content: React.ReactNode;
}

type Props = {
  onError: () => void;
  onSuccess: (characterInfo: CharacterInfo) => void;
}

const SearchForm = ({onError, onSuccess}: Props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState({
    characterName: '',
    worldName: WORLDS[0].name,
  });
  const [modalInfo, setModalInfo] = useState<ModalInfo>(MODAL_INFO)

  const handleSearchParams = ({characterName, worldName}: {characterName: string; worldName: string}) => {
    if (!characterName) {
      setModalInfo({
        isOpen: true,
        content: '캐릭터 닉네임을 입력해주세요!'
      })
      setTimeout(() => {
        setModalInfo(MODAL_INFO)
      }, 2000)

      return;
    }

    const url = new URLSearchParams({characterName, worldName}).toString();
    router.push(`/?${url}` );
  }

  const onSearch = async ({characterName, worldName}: {characterName: string; worldName: string}) => {
    try {
      const res = await fetchCharacterId({characterName, worldName});

      if (!res) {
        return;
      }

      const {ocid} = res;

      const [
        basicInfo,
        { guild_name },
        { item_equipment },
        petInfo,
        skillInfo,
        { stat },
        vmatrixInfo,
      ] = await Promise.all([
        fetchCharacterBasicInfo(ocid),
        fetchCharacterGuildInfo(ocid),
        fetchCharacterItemInfo(ocid),
        fetchCharacterPetInfo(ocid),
        fetchCharacterSkillInfo(ocid),
        fetchCharacterStatInfo(ocid),
        fetchCharacterVmatrixInfo(ocid),
      ]);

      const refinedVmatrix = vmatrixInfo.character_v_core_equipment.reduce<RefinedVmatrix>((acc, cur) => {
        if (cur.v_core_type === 'Enhancement') {
          acc.enhancement.push(cur);
        } else if (cur.v_core_type === 'Skill') {
          acc.skill.push(cur);
        } else if (cur.v_core_type === 'Special') {
          acc.special.push(cur);
        }

        return acc;
      }, {
        enhancement: [],
        skill: [],
        special: [],
      })

      onSuccess({
        basicInfo,
        guildName: guild_name || '',
        itemEquipment: item_equipment,
        petInfo,
        skillInfo,
        stat,
        vmatrixInfo: refinedVmatrix,       
      })

    } catch (error) {
      setModalInfo({
        isOpen: true,
        content: <>
          <span className='text-blue-500'>{form.characterName}</span>은/는 없는 캐릭터에요!
        </>
      })
      setTimeout(() => {
        onError();
        setForm({
          ...form,
          characterName: '',
        })
        setModalInfo(MODAL_INFO);
        router.replace('/')
      }, 2000)
    }
  };

  useEffect(() => {
    const characterName = searchParams.get('characterName');    
    const worldName = searchParams.get('worldName');

    if (characterName && worldName) {
      setForm({
        characterName,
        worldName,
      });

      onSearch({characterName, worldName});
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams])

  return (
    <>
      <div className="flex flex-col gap-y-1">
        <label className="font-semibold text-lg">월드</label>
        <Select
          className="w-full"
          defaultValue={WORLDS[0].name}
          fieldNames={{ label: 'name', value: 'name' }}
          options={WORLDS}
          size="large"
          value={form.worldName}
          labelRender={(option) => (
            <div className="flex gap-x-2 items-center">
              <Image
                src={`/logo/${option.value}.png`}
                width={20}
                height={20}
                style={{height: '20px'}}
                alt="월드 로고"
              />
              {option.label}
            </div>
          )}
          optionRender={(option) => (
            <div className="flex gap-x-2">
              <Image
                src={`/logo/${option.value}.png`}
                width={20}
                height={20}
                alt="월드 로도 이미지"
              />
              {option.label}
            </div>
          )}
          onSelect={(value) => setForm({ ...form, worldName: value })}
        />
      </div>
      <div className="flex flex-col gap-y-1">
        <label className="font-semibold text-lg">닉네임</label>
        <Input
          size="large"
          maxLength={20}
          placeholder="캐릭터 닉네임을 입력해주세요!"
          value={form.characterName}
          onChange={({ target }) =>
            setForm({ ...form, characterName: target.value })
          }
          onKeyDown={(e) => e.key === 'Enter' && handleSearchParams(form)}
        />
      </div>

      <div className='w-full fixed bottom-0 right-0 left-0 bg-white flex justify-center z-50'>
        <div className='w-full min-w-64 max-w-3xl p-5'>
          <Button
            className="h-14 text-2xl font-bold w-full"
            size="large"
            type="primary"
            onClick={() => handleSearchParams(form)}
          >
            보여조 !
          </Button>
        </div>
      </div>

      <Modal
        centered
        closeIcon={null}
        footer={null}
        open={modalInfo.isOpen}
      >
        <div className='flex flex-col items-center'>
          <Image src='/gif/핑크빈1.gif' width={80} height={80} alt='핑크빈이 노래듣고 있음' />
          <p className='text-lg font-medium'>
            {modalInfo.content}
          </p>
        </div>
      </Modal>
    </>
  )
}

export default SearchForm