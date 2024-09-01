'use client';

import { Suspense, useMemo, useState } from 'react';
import Image from 'next/image';
import { Collapse, Divider, Modal, Tag } from 'antd';
import { differenceInDays } from 'date-fns'

import { formatDate } from '~/lib/utils';

import type {
  CharacterBasicInfo,
  CharacterPetInfo,
  CharacterSkillInfo,
  ItemEquipment,
  Stat,
  VCoreEquipment,
} from '~/types/queries';
import SearchForm from '~/components/SearchForm';

const INITIAL_CHARACTER_INFO = {
    basicInfo: null,
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
  }

export type CharacterInfo = {
  basicInfo: CharacterBasicInfo | null;
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

export type RefinedVmatrix = {
  enhancement: VCoreEquipment[];
  skill: VCoreEquipment[];
  special: VCoreEquipment[];  
}


export default function Home() {
  const [characterInfo, setCharacterInfo] = useState<CharacterInfo>(INITIAL_CHARACTER_INFO);

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

  const equipments = useMemo(() => {
    const filtered = itemEquipment.filter((item) => {
      return !item.item_equipment_page_name.includes('Cash') && !['아케인심볼', '탈것', '이펙트', '안드로이드', '의자'].includes(item.item_equipment_page_name.split(' ')[1])
    })

    return filtered.sort((a, b) => {
      return a.item_equipment_page_name.localeCompare(b.item_equipment_page_name)
    })
  }, [itemEquipment]);

  const handleSuccess = (info: CharacterInfo) => {
    setCharacterInfo(info);
  }

  const handleError = () => {
    setCharacterInfo(INITIAL_CHARACTER_INFO);
  }

  return (
    <main className="flex h-full flex-col justify-between p-5 mx-auto pb-28 min-w-64 max-w-3xl w-full z-50 overflow-y-auto">
      <div className='flex flex-col gap-y-4'>
        <div className="flex justify-center items-center gap-x-3">
          <Image src='/gif/슬라임.gif' width={60} height={60} alt='슬라임 움짤' />
        </div>

        <Suspense>
          <SearchForm onError={handleError} onSuccess={handleSuccess} />
        </Suspense>

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
            label: <span className='font-semibold'>{basicInfo?.character_name}님 기본 정보</span>,
            children: (
              <ul className='list-disc pl-4'>
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
            label: <span className='font-semibold'>장비 정보</span>,
            children: <ul>
              {equipments.map((item) => (
                <li key={`item-${item.item_name}`}>{item.item_equipment_slot_name}: {item.item_name}</li>
              ))}
            </ul>
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
            label: <span className='font-semibold'>스탯 정보</span>,
            children: (
                <ul className='list-disc pl-4'>
                  {stat.map((stat) => (
                    <li key={`stat-${stat.stat_name}`}>{stat.stat_name}: {Number(stat.stat_value).toLocaleString('ko-KR')}</li>
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
            label: <span className='font-semibold'>스킬 정보</span>,
            children: (
              <div className="flex flex-col gap-y-4">
                <div>
                  <label className='text-blue-500 font-bold'>스킬 프리셋</label>
                  {characterInfo?.skillInfo?.skill?.preset.map((preset) => (
                    <div key={`preset-${preset.preset_slot_no}`}>
                      <div>{preset.preset_slot_no}번 프리셋</div>
                      <span>{preset.skill_name_1 || 'X'} / </span>
                      <span>{preset.skill_name_2 || 'X'} / </span>
                      <span>{preset.skill_name_3 || 'X'} / </span>
                      <span>{preset.skill_name_4 || 'X'}</span>
                    </div>
                  ))}

                  {(characterInfo.skillInfo?.skill?.steal_skill.length || 0) > 0 && (
                    <>
                      <br/>
                      <label className='text-blue-500 font-bold'>훔친 스킬</label>
                      <ul className='list-disc pl-4'>
                        {characterInfo?.skillInfo?.skill?.steal_skill.map((steal) => (
                          <li key={`steal-${steal.skill_name}`}>{steal.skill_name}</li>
                        ))}
                      </ul>
                    </>
                  )}

                  {(characterInfo.skillInfo?.skill?.stella_memorize.length || 0) > 0 && (
                    <>
                      <br/>
                      <label className='text-blue-500 font-bold'>스텔라 메모라이즈</label>
                      <ul className='list-disc pl-4'>
                        {characterInfo?.skillInfo?.skill?.stella_memorize.map((steal) => (
                          <li key={`steal-${steal.skill_name}`}>{steal.skill_name}</li>
                        ))}
                      </ul>
                    </>
                  )}
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
            label: <span className='font-semibold'>V 매트릭스 정보</span>,
            children: (
              <>
                {vmatrixInfo?.skill.length > 0 && 
                  <>
                    <label className='text-blue-500 font-bold'>5차 스킬</label>
                    <ul className='list-disc pl-4'>
                      {vmatrixInfo.skill.map(
                        (core) => (
                          <li key={`5차-${core.slot_id}`}>
                            {core.v_core_name} ({core.v_core_level}
                            {!!core.slot_level && `+${core.slot_level}`}) {!!core.slot_level && <Tag  bordered={false} color='blue'>슬롯강화</Tag>}
                          </li>
                        )
                      )}
                    </ul>
                    <br/>
                  </>
                }
                
                {vmatrixInfo?.enhancement.length > 0 &&
                  <>
                    <label className='text-blue-500 font-bold'>강화 스킬</label>
                    <ul className='list-disc pl-4'>
                      {vmatrixInfo.enhancement.map(
                        (core) => (
                          <>
                            <li>
                              {core.v_core_name} ({core.v_core_level}
                              {!!core.slot_level && `+${core.slot_level}`}) {!!core.slot_level && <Tag  bordered={false} color='blue'>슬롯강화</Tag>}
                              {core.v_core_type === 'Enhancement' && (
                                <>
                                  <br />
                                  ({core.v_core_skill_name_1}+{core.v_core_skill_name_2}+{core.v_core_skill_name_3})
                                </>
                              )}
                            </li>
                            <br />
                          </>
                        )
                      )}
                    </ul>
                  </>
                }

                {vmatrixInfo?.special.length > 0 &&
                  <>
                    <label className='text-blue-500 font-bold'>특수 스킬</label>
                    <ul className='list-disc pl-4'>
                      {vmatrixInfo.special.map(
                        (core) => (
                          <li key={`${core.v_core_name}`}>
                            {core.v_core_name} ({core.v_core_level})
                          </li>
                        )
                      )}
                    </ul>
                    <br/>
                  </>
                }
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
            label: <div className='font-semibold'>
              펫 정보 (<span className='text-sm font-normal'>펫 생명이 <span className='font-bold text-blue-500'>3일</span> 이하로 남은 경우 <Tag bordered={false} color='red'>생명의 물</Tag> 태그가 표시됩니다</span>)
            </div>,
            children: (
                <ul className='list-disc pl-4'>
                  {petInfo?.pet_1_name && petInfo?.pet_1_date_expire && 
                    <div className='flex gap-x-2'>
                      <li>{petInfo.pet_1_name}</li>
                      {differenceInDays(new Date(petInfo.pet_1_date_expire), new Date()) <= 3 && (
                        <Tag bordered={false} color='red'>생명의 물</Tag>
                      )}
                    </div>
                  }
                  {petInfo?.pet_2_name && petInfo?.pet_2_date_expire && 
                    <div className='flex gap-x-2'>
                      <li>{petInfo.pet_2_name}</li>
                      {differenceInDays(new Date(petInfo.pet_2_date_expire), new Date()) <= 3 && (
                        <Tag bordered={false} color='red'>생명의 물</Tag>
                      )}
                    </div>
                  }
                  {petInfo?.pet_3_name && petInfo?.pet_3_date_expire && 
                    <div className='flex gap-x-2'>
                      <li>{petInfo.pet_3_name}</li>
                      {differenceInDays(new Date(petInfo.pet_3_date_expire), new Date()) <= 3 && (
                        <Tag bordered={false} color='red'>생명의 물</Tag>
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
      </div>


      <div className='flex flex-col items-center justify-self-end'>
        <span className='text-sm text-gray-700'>© 2024. All rights reserved.</span>
        <span className='text-xs text-gray-400 font-light'>Data Provided By NEXON</span>
      </div>
    </main>
  );
}
