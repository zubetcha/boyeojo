'use client';

import { useEffect, useMemo, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import { Button, Collapse, Divider, Input, message, Modal, Select, Tag } from 'antd';
import { differenceInDays } from 'date-fns'

import {
  fetchCharacterBasicInfo,
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
  CharacterPetInfo,
  CharacterSkillInfo,
  ItemEquipment,
  Stat,
  VCoreEquipment,
} from '~/types/queries';

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

type CharacterInfo = {
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

type RefinedVmatrix = {
  enhancement: VCoreEquipment[];
  skill: VCoreEquipment[];
  special: VCoreEquipment[];  
}


export default function Home() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [characterInfo, setCharacterInfo] = useState<CharacterInfo>(INITIAL_CHARACTER_INFO);
  const [form, setForm] = useState({
    characterName: '홍차',
    worldName: '크로아',
  });
  const [isModalOpen, setIsModalOpen] = useState(false);

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

  const handleSearchParams = ({characterName, worldName}: {characterName: string; worldName: string}) => {
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
        // beautyInfo,
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


      setCharacterInfo({
        basicInfo,
        guildName: guild_name || '',
        itemEquipment: item_equipment,
        petInfo,
        skillInfo,
        stat,
        vmatrixInfo: refinedVmatrix,
      });
    } catch (error) {
      setIsModalOpen(true)

      setTimeout(() => {
        setCharacterInfo(INITIAL_CHARACTER_INFO)
        setForm({
          ...form,
          characterName: '',
        })
        setIsModalOpen(false)
        router.replace('/')
      }, 1500)
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
  }, [searchParams])

  console.log(characterInfo);

  return (
    <>
      <main className="flex h-full flex-col p-5 gap-y-4 mx-auto mb-24 min-w-64 max-w-3xl w-full z-50 overflow-y-auto">
      <div className="flex justify-center items-center gap-x-3">
        {/* <span className="font-extrabold text-center text-3xl text-blue-500">보여조</span> */}
        <Image src='/gif/슬라임.gif' width={48} height={48} alt='슬라임 움짤' />
      </div>
      
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
                        <li>
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
                          <li>
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
              펫 정보 (<span className='text-sm font-normal'>펫 생명이 <span className='font-bold text-blue-500'>3일</span> 이하로 남은 경우 태그가 표시됩니다</span>)
            </div>,
            children: (
                <ul className='list-disc pl-4'>
                  {petInfo?.pet_1_name && petInfo?.pet_1_date_expire && 
                    <div className='flex gap-x-2'>
                      <li>{petInfo.pet_1_name}</li>
                      {differenceInDays(new Date(petInfo.pet_1_date_expire), new Date()) <= 3 && (
                        <Tag bordered={false} color='red'>생명의 물 필요</Tag>
                      )}
                    </div>
                  }
                  {petInfo?.pet_2_name && petInfo?.pet_2_date_expire && 
                    <div className='flex gap-x-2'>
                      <li>{petInfo.pet_2_name}</li>
                      {differenceInDays(new Date(petInfo.pet_2_date_expire), new Date()) <= 3 && (
                        <Tag bordered={false} color='red'>생명의 물 필요</Tag>
                      )}
                    </div>
                  }
                  {petInfo?.pet_3_name && petInfo?.pet_3_date_expire && 
                    <div className='flex gap-x-2'>
                      <li>{petInfo.pet_3_name}</li>
                      {differenceInDays(new Date(petInfo.pet_3_date_expire), new Date()) <= 3 && (
                        <Tag bordered={false} color='red'>생명의 물 필요</Tag>
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

      <div className='w-full fixed bottom-0 right-0 left-0 bg-white flex justify-center'>
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
    </main>

    <Modal
      centered
      closeIcon={null}
      footer={null}
      open={isModalOpen}
    >
      <div className='flex flex-col items-center'>
        <Image src='/gif/핑크빈1.gif' width={100} height={100} alt='핑크빈이 노래듣고 있음' />
        <p className='text-lg font-medium'>
          <span className='text-blue-500'>{form.characterName}</span>은/는 없는 캐릭터에요!
        </p>
      </div>
    </Modal>
    </>
    
  );
}
