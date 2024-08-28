'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Button, Collapse, Input, Select } from 'antd';

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
    <main className="flex h-full flex-col p-5 gap-y-4 mx-auto mb-20 w-128 z-50 overflow-y-auto">
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
            <div className="flex gap-x-2">
              <img
                src={WORLDS.find((world) => world.name === option.value)!.logo}
                width={20}
                height={20}
                alt="월드 로고"
              />
              {option.label}
            </div>
          )}
          optionRender={(option) => (
            <div className="flex gap-x-2">
              <img
                src={option.data.logo}
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

      <Collapse
        collapsible="header"
        defaultActiveKey={['1']}
        size="large"
        items={[
          {
            key: '1',
            label: `${characterInfo.basicInfo?.character_name} 기본 정보`,
            children: (
              <div>
                <div>닉네임: {characterInfo.basicInfo?.character_name}</div>
                <div>월드: {characterInfo.basicInfo?.world_name}</div>
                <div>직업: {characterInfo.basicInfo?.character_job_name}</div>
                <div>레벨: {characterInfo.basicInfo?.character_level}</div>
                <div>길드: {characterInfo.guildName}</div>
                <div>
                  생년월일: {characterInfo.basicInfo?.character_date_create}
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
            label: '스탯 정보',
            children: (
              <div>
                <div>{characterInfo.stat.map((stat) => <div>
                  {stat.stat_name}: {stat.stat_value}
                  </div>)}</div>
              </div>
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
                {characterInfo.vmatrixInfo.skill.map(
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
                {characterInfo.vmatrixInfo.enhancement.map(
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
                {characterInfo.vmatrixInfo.special.map(
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
            label: '펫 정보',
            children: (
              <div>
                {characterInfo.petInfo?.pet_1_name} ({characterInfo.petInfo?.pet_1_date_expire} 사망 예정)
                <br/>
                {characterInfo.petInfo?.pet_2_name} ({characterInfo.petInfo?.pet_2_date_expire} 사망 예정)
                <br/>
                {characterInfo.petInfo?.pet_3_name} ({characterInfo.petInfo?.pet_3_date_expire} 사망 예정)
              </div>
            ),
          },
        ]}
      />

      <div className="fixed bottom-0 right-0 left-0 w-full bg-white flex justify-center">
        <Button
          className="h-14 text-2xl font-bold w-128 mb-4 mx-5"
          size="large"
          type="primary"
          onClick={onSearch}
        >
          보여조 !
        </Button>
      </div>
    </main>
  );
}
