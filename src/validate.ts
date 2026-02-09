import type { CharacterRecordV1 } from "./types";

export type ValidationResult = {
  ok: boolean;
  errors: string[];
};

const REQUIRED_ATTRIBUTE_KEYS = ["phys", "dex", "int", "will", "cha", "emp"] as const;
const ALLOWED_GEAR_TYPES = ["weapon", "armour", "item", "cyberware", "narcotic", "hacker_gear"] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateCharacterRecordV1(record: CharacterRecordV1): ValidationResult {
  const errors: string[] = [];

  if (!record || typeof record !== "object") {
    return { ok: false, errors: ["record must be an object"] };
  }

  if (typeof record.id !== "string" || record.id.trim() === "") errors.push("id must be a string");
  if (typeof record.name !== "string") errors.push("name must be a string");
  if (typeof record.concept !== "string") errors.push("concept must be a string");
  if (typeof record.background !== "string") errors.push("background must be a string");
  if (typeof record.level !== "number") errors.push("level must be a number");
  if (typeof record.notes !== "string") errors.push("notes must be a string");
  if (typeof record.createdAt !== "string") errors.push("createdAt must be a string");
  if (typeof record.updatedAt !== "string") errors.push("updatedAt must be a string");
  if (record.version !== 1) errors.push("version must be 1");

  if (!isRecord(record.attributes)) {
    errors.push("attributes must be an object");
  } else {
    for (const key of REQUIRED_ATTRIBUTE_KEYS) {
      if (typeof record.attributes[key] !== "number") {
        errors.push(`attributes.${key} must be a number`);
      }
    }
  }

  if (!Array.isArray(record.skills)) {
    errors.push("skills must be an array");
  } else {
    record.skills.forEach((skill, index) => {
      if (!isRecord(skill)) {
        errors.push(`skills[${index}] must be an object`);
        return;
      }
      if (typeof skill.key !== "string") errors.push(`skills[${index}].key must be a string`);
      if (typeof skill.label !== "string") errors.push(`skills[${index}].label must be a string`);
      if (typeof skill.rank !== "number") errors.push(`skills[${index}].rank must be a number`);
      if (skill.focus != null && typeof skill.focus !== "string") {
        errors.push(`skills[${index}].focus must be a string`);
      }
    });
  }

  if (!Array.isArray(record.gear)) {
    errors.push("gear must be an array");
  } else {
    record.gear.forEach((gear, index) => {
      if (!isRecord(gear)) {
        errors.push(`gear[${index}] must be an object`);
        return;
      }
      if (typeof gear.id !== "string") errors.push(`gear[${index}].id must be a string`);
      if (typeof gear.name !== "string") errors.push(`gear[${index}].name must be a string`);
      if (typeof gear.type !== "string" || !ALLOWED_GEAR_TYPES.includes(gear.type as any)) {
        errors.push(`gear[${index}].type must be a valid type`);
      }
      if (gear.tags != null && !Array.isArray(gear.tags)) {
        errors.push(`gear[${index}].tags must be an array`);
      }
      if (gear.notes != null && typeof gear.notes !== "string") {
        errors.push(`gear[${index}].notes must be a string`);
      }
    });
  }

  return { ok: errors.length === 0, errors };
}
