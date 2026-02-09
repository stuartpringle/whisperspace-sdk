import type { CharacterRecordV1 } from "./types";

export type ValidationResult = {
  ok: boolean;
  errors: string[];
};

const REQUIRED_ATTRIBUTE_KEYS = ["phys", "ref", "soc", "ment"] as const;
const ALLOWED_LEARNING_FOCUS = ["combat", "education", "vehicles"] as const;
const ALLOWED_INVENTORY_TYPES = ["item", "cyberware", "narcotics"] as const;
const ALLOWED_TOP_LEVEL = [
  "id",
  "name",
  "background",
  "motivation",
  "attributes",
  "skills",
  "learningFocus",
  "skillPoints",
  "stress",
  "wounds",
  "weapons",
  "armour",
  "inventory",
  "credits",
  "feats",
  "indomitable",
  "notes",
  "createdAt",
  "updatedAt",
  "version",
] as const;

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function validateCharacterRecordV1(record: CharacterRecordV1): ValidationResult {
  const errors: string[] = [];

  if (!record || typeof record !== "object") {
    return { ok: false, errors: ["record must be an object"] };
  }

  for (const key of Object.keys(record)) {
    if (!ALLOWED_TOP_LEVEL.includes(key as any)) {
      errors.push(`unknown property: ${key}`);
    }
  }

  if (typeof record.id !== "string" || record.id.trim() === "") errors.push("id must be a string");
  if (typeof record.name !== "string") errors.push("name must be a string");
  if (record.background != null && typeof record.background !== "string") errors.push("background must be a string");
  if (record.motivation != null && typeof record.motivation !== "string") errors.push("motivation must be a string");
  if (record.notes != null && typeof record.notes !== "string") errors.push("notes must be a string");
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

  if (!isRecord(record.skills)) {
    errors.push("skills must be an object");
  } else {
    for (const [key, value] of Object.entries(record.skills)) {
      if (typeof key !== "string" || key.trim() === "") {
        errors.push("skills keys must be non-empty strings");
      }
      if (typeof value !== "number") {
        errors.push(`skills.${key} must be a number`);
      }
    }
  }

  if (record.learningFocus != null && !ALLOWED_LEARNING_FOCUS.includes(record.learningFocus as any)) {
    errors.push("learningFocus must be one of combat, education, vehicles");
  }
  if (record.skillPoints != null && typeof record.skillPoints !== "number") {
    errors.push("skillPoints must be a number");
  }

  if (record.stress != null) {
    if (!isRecord(record.stress)) {
      errors.push("stress must be an object");
    } else {
      if (record.stress.current != null && typeof record.stress.current !== "number") errors.push("stress.current must be a number");
      if (record.stress.cuf != null && typeof record.stress.cuf !== "number") errors.push("stress.cuf must be a number");
      if (record.stress.cufLoss != null && typeof record.stress.cufLoss !== "number") errors.push("stress.cufLoss must be a number");
    }
  }

  if (record.wounds != null) {
    if (!isRecord(record.wounds)) {
      errors.push("wounds must be an object");
    } else {
      if (record.wounds.light != null && typeof record.wounds.light !== "number") errors.push("wounds.light must be a number");
      if (record.wounds.moderate != null && typeof record.wounds.moderate !== "number") errors.push("wounds.moderate must be a number");
      if (record.wounds.heavy != null && typeof record.wounds.heavy !== "number") errors.push("wounds.heavy must be a number");
    }
  }

  if (record.weapons != null) {
    if (!Array.isArray(record.weapons)) {
      errors.push("weapons must be an array");
    } else {
      record.weapons.forEach((weapon, index) => {
        if (!isRecord(weapon)) {
          errors.push(`weapons[${index}] must be an object`);
          return;
        }
        if (weapon.id != null && typeof weapon.id !== "string") errors.push(`weapons[${index}].id must be a string`);
        if (weapon.name != null && typeof weapon.name !== "string") errors.push(`weapons[${index}].name must be a string`);
        if (weapon.skillId != null && typeof weapon.skillId !== "string") errors.push(`weapons[${index}].skillId must be a string`);
        if (weapon.useDC != null && typeof weapon.useDC !== "number") errors.push(`weapons[${index}].useDC must be a number`);
        if (weapon.damage != null && typeof weapon.damage !== "number") errors.push(`weapons[${index}].damage must be a number`);
      });
    }
  }

  if (record.armour != null) {
    if (!isRecord(record.armour)) {
      errors.push("armour must be an object");
    } else {
      if (record.armour.name != null && typeof record.armour.name !== "string") errors.push("armour.name must be a string");
      if (record.armour.protection != null && typeof record.armour.protection !== "number") errors.push("armour.protection must be a number");
    }
  }

  if (record.inventory != null) {
    if (!Array.isArray(record.inventory)) {
      errors.push("inventory must be an array");
    } else {
      record.inventory.forEach((item, index) => {
        if (!isRecord(item)) {
          errors.push(`inventory[${index}] must be an object`);
          return;
        }
        if (typeof item.type !== "string" || !ALLOWED_INVENTORY_TYPES.includes(item.type as any)) {
          errors.push(`inventory[${index}].type must be valid`);
        }
        if (item.name != null && typeof item.name !== "string") errors.push(`inventory[${index}].name must be a string`);
      });
    }
  }

  if (record.credits != null && typeof record.credits !== "number") {
    errors.push("credits must be a number");
  }
  if (record.indomitable != null && typeof record.indomitable !== "boolean") {
    errors.push("indomitable must be a boolean");
  }
  if (record.feats != null) {
    if (!Array.isArray(record.feats)) {
      errors.push("feats must be an array");
    } else {
      record.feats.forEach((feat, index) => {
        if (!isRecord(feat)) {
          errors.push(`feats[${index}] must be an object`);
          return;
        }
        if (feat.name != null && typeof feat.name !== "string") errors.push(`feats[${index}].name must be a string`);
      });
    }
  }

  return { ok: errors.length === 0, errors };
}
