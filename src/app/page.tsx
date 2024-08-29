'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button, Collapse, Divider, Input, Select, Tag } from 'antd';
import { differenceInDays } from 'date-fns'

import {
  fetchCharacterBasicInfo,
  fetchCharacterBeautyInfo,
  fetchCharacterGuildInfo,
  fetchCharacterId,
  fetchCharacterItemInfo,
  fetchCharacterPetInfo,
  fetchCharacterSkillInfo,
  fetchCharacterStatInfo,
  fetchCharacterVmatrixInfo,
} from '~/lib/queries';
import { formatDate, formatDatetime } from '~/lib/utils';
import { WORLDS } from '~/lib/constants';

import type {
  CharacterBasicInfo,
  CharacterBeautyInfo,
  CharacterPetInfo,
  CharacterSkillInfo,
  CharacterVmatrixInfo,
  ItemEquipment,
  Stat,
  VCoreEquipment,
} from '~/types/queries';

type CharacterInfo = {
  basicInfo: CharacterBasicInfo | null;
  // beautyInfo: CharacterBeautyInfo | null;
  guildName: string;
  itemEquipment: ItemEquipment[];
  petInfo: CharacterPetInfo | null;
  skillInfo: CharacterSkillInfo | null;
  stat: Stat[];
  vmatrixInfo: RefinedVmatrix;
};

type Tag = {
color: string;
label: string;
}

type RefinedVmatrix = {
  enhancement: VCoreEquipment[];
  skill: VCoreEquipment[];
  special: VCoreEquipment[];  
}


export default function Home() {
  const router = useRouter();

  const [form, setForm] = useState({
    characterName: '홍차',
    worldName: '크로아',
  });
  const [characterInfo, setCharacterInfo] = useState<CharacterInfo>({
    basicInfo: null,
    // beautyInfo: null,
    guildName: '',
    itemEquipment: [],
    petInfo: null,
    skillInfo: null,
    stat: [],
    vmatrixInfo: {
      enhancement: [],
      skill: [],
      special: [],
    },
  });

  const {basicInfo, guildName, itemEquipment, petInfo, skillInfo, stat, vmatrixInfo} = characterInfo


  const tags: Tag[] = useMemo(() => {
    const equip = itemEquipment.reduce((acc, cur) => {
      if (cur.item_name.includes('혈맹의 반지')) {
        acc.hasHyulBan = true;
      }

      if (cur.item_name.includes('유니온의 가호')) {
        acc.hasGaho = true;
      }

      if (cur.item_name.includes('아케인셰이드')) {
        acc.arcane += 1;
      }

      if (cur.item_name.includes('앱솔랩스')) {
        acc.absolabs += 1;
      }

      return acc;
    }, {hasHyulBan: false, hasGaho: false, arcane: 0, absolabs: 0})

    const { hasHyulBan, hasGaho, arcane, absolabs } = equip;
    const tags = [
      {color : hasHyulBan ? 'green' : 'red', label: hasHyulBan ? '혈반 있음': '혈반 없음'},
      {color : hasGaho ? 'green' : 'red', label: hasGaho ? '가호 있음' : '가호 없음'},
      {color: 'cyan', label: `${arcane}앜 ${absolabs}앱`},
    ]


    return tags
  }, [itemEquipment])

  const onSearch = async () => {
    try {
      const { ocid } = await fetchCharacterId(form);
      const [
        basicInfo,
        // beautyInfo,
        { guild_name },
        { item_equipment },
        petInfo,
        skillInfo,
        { stat },
        vmatrixInfo,
      ] = await Promise.all([
        fetchCharacterBasicInfo(ocid),
        // fetchCharacterBeautyInfo(ocid),
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


      setCharacterInfo({
        basicInfo,
        // beautyInfo,
        guildName: guild_name,
        itemEquipment: item_equipment,
        petInfo,
        skillInfo,
        stat,
        vmatrixInfo: refinedVmatrix,
      });
    } catch (error) {}
  };

  console.log(characterInfo);

  return (
    <main className="flex h-full flex-col p-5 gap-y-4 mx-auto mb-24 w-128 z-50 overflow-y-auto">
      <div className="font-extrabold text-center text-4xl">🪄 보여조 🪄</div>
      <div className="flex flex-col gap-y-1">
        <label className="font-medium text-lg">월드</label>
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
        <label className="font-medium text-lg">닉네임</label>
        <Input
          size="large"
          maxLength={20}
          placeholder="캐릭터 닉네임을 입력해주세요!"
          value={form.characterName}
          onChange={({ target }) =>
            setForm({ ...form, characterName: target.value })
          }
        />
      </div>

      {basicInfo && (
        <>
         <Divider className='my-1' />

      <div className='flex flex-wrap gap-x-0.5 gap-y-2'>
        {tags.map((tag, index) => (
          <Tag key={index} color={tag.color} className='text-base'>{tag.label}</Tag>
        ))}
      </div>

      <Collapse
        collapsible="header"
        defaultActiveKey={['1']}
        size="large"
        items={[
          {
            key: '1',
            label: `${basicInfo?.character_name} 기본 정보`,
            children: (
              <ul className='list-disc pl-3'>
                <li>닉네임: {basicInfo?.character_name}</li>
                <li>월드: {basicInfo?.world_name}</li>
                <li>직업: {basicInfo?.character_job_name}</li>
                <li>레벨: {basicInfo?.character_level}</li>
                <li>길드: {guildName || 'X'}</li>
                <li>
                  생년월일: {formatDate(basicInfo?.character_date_create)}
                </li>
              </ul>
            ),
          },
        ]}
      />

      <Collapse 
        collapsible="header"
        defaultActiveKey={['1']}
        size="large"
        items={[
          {
            key: '1',
            label: '스탯 정보',
            children: (
                <ul className='list-disc pl-3'>
                  {stat.map((stat) => (
                    <li>{stat.stat_name}: {Number(stat.stat_value).toLocaleString('ko-KR')}</li>
                  ))}
                </ul>
            ),
                }
        ]}
      />

      <Collapse
        collapsible="header"
        defaultActiveKey={['1']}
        size="large"
        items={[
          {
            key: '1',
            label: '스킬 정보',
            children: (
              <div className="flex flex-col gap-y-4">
                <div>
                  <label>스킬 프리셋</label>
                  {characterInfo?.skillInfo?.skill.preset.map((preset) => (
                    <div>
                      <div>프리셋 {preset.preset_slot_no}번</div>
                      <span>{preset.skill_name_1 || 'X'} / </span>
                      <span>{preset.skill_name_2 || 'X'} / </span>
                      <span>{preset.skill_name_3 || 'X'} / </span>
                      <span>{preset.skill_name_4 || 'X'}</span>
                    </div>
                  ))}
                </div>
              </div>
            ),
          },
        ]}
      />

      <Collapse
        collapsible="header"
        defaultActiveKey={['1']}
        size="large"
        items={[
          {
            key: '1',
            label: 'V 매트릭스 정보',
            children: (
              <>
              <label>5차 스킬</label>
                {vmatrixInfo.skill.map(
                  (core) => (
                    <>
                      <div>
                        {core.v_core_name} ({core.v_core_level}+
                        {core.slot_level})
                      </div>
                      <br />
                    </>
                  )
                )}

                <label>강화 스킬</label>
                {vmatrixInfo.enhancement.map(
                  (core) => (
                    <>
                      <div>
                        {core.v_core_name} ({core.v_core_level}+
                        {core.slot_level})
                        {core.v_core_type === 'Enhancement' && (
                          <>
                            <br />
                            {core.v_core_skill_name_1} + {core.v_core_skill_name_2} + {core.v_core_skill_name_3}
                          </>
                        )}
                      </div>
                      <br />
                    </>
                  )
                )}

                <label>특수 스킬</label>
                {vmatrixInfo.special.map(
                  (core) => (
                    <>
                      <div>
                        {core.v_core_name} ({core.v_core_level}+
                        {core.slot_level})
                      
                      </div>
                      <br />
                    </>
                  )
                )}

              </>
            ),
          },
        ]}
      />

      <Collapse
        collapsible="header"
        defaultActiveKey={['1']}
        size="large"
        items={[
          {
            key: '1',
            label: <div>
              펫 정보 (<span className='text-sm'>펫 생명이 <span className='font-bold text-blue-500'>3일</span> 이하로 남은 경우 태그가 표시됩니다</span>)
            </div>,
            children: (
                <ul className='list-disc pl-3'>
                  {petInfo?.pet_1_name && petInfo?.pet_1_date_expire && 
                    <div className='flex gap-x-2'>
                      <li>{petInfo.pet_1_name}</li>
                      {differenceInDays(new Date(petInfo.pet_1_date_expire), new Date()) <= 3 && (
                        <Tag color='red'>생명의 물 필요</Tag>
                      )}
                    </div>
                  }
                  {petInfo?.pet_2_name && petInfo?.pet_2_date_expire && 
                    <div className='flex gap-x-2'>
                      <li>{petInfo.pet_2_name}</li>
                      {differenceInDays(new Date(petInfo.pet_2_date_expire), new Date()) <= 3 && (
                        <Tag color='red'>생명의 물 필요</Tag>
                      )}
                    </div>
                  }
                  {petInfo?.pet_3_name && petInfo?.pet_3_date_expire && 
                    <div className='flex gap-x-2'>
                      <li>{petInfo.pet_3_name}</li>
                      {differenceInDays(new Date(petInfo.pet_3_date_expire), new Date()) <= 3 && (
                        <Tag color='red'>생명의 물 필요</Tag>
                      )}
                    </div>
                  }
                </ul>
            ),
          },
        ]}
      />
        </>
      )}

      {/* <div className="fixed bottom-0 right-0 left-0 w-full bg-white flex justify-center"> */}
        <div className='w-128 p-5 fixed bottom-0 left-1/2 -translate-x-1/2 bg-white'>
          <Button
            className="h-14 text-2xl font-bold w-full"
            size="large"
            type="primary"
            onClick={onSearch}
          >
            보여조!
          </Button>
        </div>
      {/* </div> */}
    </main>
  );
}
