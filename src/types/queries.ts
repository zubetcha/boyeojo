import type { Nullable } from "~/types/common";

export type CharacterIdInfo = {
  ocid: string;
};

export type CharacterBasicInfo = {
  character_name: string;
  world_name: string;
  character_date_create: string; // 2023-12-14T08:28:35Z
  character_date_last_login: string; // 2023-12-14T08:28:35Z
  character_date_last_logout: string; // 2023-12-14T08:28:35Z
  character_job_name: string;
  character_gender: string;
  character_exp: number;
  character_level: number;
};

export type ItemEquipment = {
  item_name: string;
  item_equipment_page_name: string;
  item_equipment_slot_name: string;
};

export type CharacterItemInfo = {
  item_equipment: ItemEquipment[];
};

export type Stat = {
  stat_name: string;
  stat_value: string;
};

export type CharacterStatInfo = {
  stat: Stat[];
};

export type CharacterGuildInfo = {
  guild_name: Nullable<string>;
};

export type CharacterBeautyInfo = {
  character_gender: string;
  character_class: string;
  character_hair: {
    hair_name: string;
    base_color: string;
    mix_color: string;
    mix_rate: string;
  };
  character_face: {
    face_name: string;
    base_color: string;
    mix_color: string;
    mix_rate: string;
  };
  character_skin_name: string;
  additional_character_hair: {
    hair_name: string;
    base_color: string;
    mix_color: string;
    mix_rate: string;
  };
  additional_character_face: {
    face_name: string;
    base_color: string;
    mix_color: string;
    mix_rate: string;
  };
  additional_character_skin_name: string;
};

export type CharacterPetInfo = {
  pet_1_name: Nullable<string>;
  pet_1_pet_type: Nullable<string>;
  pet_1_date_expire: Nullable<string>; // 2023-12-14T08:28:35Z
  pet_2_name: Nullable<string>;
  pet_2_pet_type: Nullable<string>;
  pet_2_date_expire: Nullable<string>; // 2023-12-14T08:28:35Z
  pet_3_name: Nullable<string>;
  pet_3_pet_type: Nullable<string>;
  pet_3_date_expire: Nullable<string>; // 2023-12-14T08:28:35Z
};

export type EquipmentSkill = {
  skill_mode: number;
  equipment_skill_set: string;
  slot_id: string;
  skill_name: string;
  skill_type: string;
  skill_grade: string;
  add_feature_flag: string;
};

export type SkillPreset = {
  preset_slot_no: number;
  skill_name_1: string;
  skill_name_2: string;
  skill_name_3: string;
  skill_name_4: string;
  preset_command_flag: string;
};

export type StealSkill = {
  skill_name: string;
  skill_slot: string;
};

export type StellaMemorize = {
  skill_name: string;
  equipment_skill_set: string;
};

export type CharacterSkillInfo = {
  character_class: Nullable<string>;
  skill: Nullable<{
    equipment_skill: EquipmentSkill[];
    preset: SkillPreset[];
    steal_skill: StealSkill[];
    stella_memorize: StellaMemorize[];
  }>;
};

export type VCoreEquipment = {
  slot_id: string;
  slot_level: number;
  v_core_name: string;
  v_core_type: string; // Enhancement(3개 묶음), Skill(V), Special (특코)
  v_core_level: number;
  v_core_skill_name_1: string;
  v_core_skill_name_2: string;
  v_core_skill_name_3: string;
};

export type CharacterVmatrixInfo = {
  character_class: string;
  character_v_core_equipment: VCoreEquipment[];
};
