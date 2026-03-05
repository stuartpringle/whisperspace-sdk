# Whisperspace SDK

Client utilities and canonical schemas for Whisperspace services.

## Base URLs
- Rules API: `https://rules-api.whisperspace.com/latest`
- Calc API: `https://rules-api.whisperspace.com/calc`
- Character API: `https://rules-api.whisperspace.com/character-api`

## Canonical Schema
The **authoritative** character storage schema lives here.

- Type: `CharacterRecordV1`
- JSON Schema (TS): `CharacterRecordV1Schema`
- JSON Schema (file): `schema/character-record.v1.json`
- Validator: `validateCharacterRecordV1`

Attributes (v1):
- `phys`, `ref`, `soc`, `ment`

Skills (v1):
- Map of `skillId -> rank` (number)
  - Skill IDs are defined by `https://rules-api.whisperspace.com/latest/skills.json`

Identity (v1):
- `name`, `background`, `motivation`

Inventory item types:
- `item`, `cyberware`, `narcotics`, `hacker_gear`

```ts
import {
  CharacterRecordV1Schema,
  type CharacterRecordV1,
  validateCharacterRecordV1,
} from "@whisperspace/sdk";
```

All clients (builder, API) should validate or align with this schema.

## Recent Schema Additions
- Multi-armour support:
  - `armours: Armor[]`
  - `equippedArmourId: string`
- Nanomancy support:
  - `nanomancy.primaryField`: `"burner" | "physic" | "kinetic"`
  - `nanomancy.knownEffects`: `string[]`
  - `nanomancy.preferredND`: `number`
- Character organization tags:
  - `tags: string[]` (optional)
  - Intended for cross-device list/group organization (for example campaign or NPC labels).

These fields are now part of both:
- `src/schema.ts` (`CharacterRecordV1Schema`)
- `schema/character-record.v1.json`

## Usage
```ts
import { RULES_API_BASE, CALC_API_BASE, CHARACTER_API_BASE } from "@whisperspace/sdk";
```

## Platform Client (ECO-005 scaffold)
A minimal shared platform client now ships from this package to standardize cross-repo API calls.

```ts
import { createPlatformClient } from "@whisperspace/sdk/platform-client";

const client = createPlatformClient();
const meta = await client.getRulesMeta();
const session = await client.getAuthSession();
```

Current wrapper coverage:
- rules: `getRulesMeta`, `getRulesJson`
- calc: `getCalcSchemasIndex`, `calcPost`
- character: `getCharacterSchema`, `listCharacters`, `getCharacter`, `createCharacter`, `updateCharacter`, `deleteCharacter`
- auth: `getAuthSession`, `getAuthCsrf`

Integration expectations:
- Defaults target `rules-api.whisperspace.com` endpoints and use `credentials: "include"` for cookie auth flows.
- State-changing character methods accept CSRF header input where required (`X-CSRF-Token`).
- Path/boundary handling normalizes legacy base URL forms (`/latest`, `/calc`) to canonical routes (`/rules-api/latest`, `/rules-api/calc`).

## Status
Active

## Integration Checklist
- Public entrypoints (URLs) and environment variables.
- API endpoints or interfaces exposed to other repos.
- Schema/contract references and versions.
- Auth expectations (keys, cookies, tokens, headers).
- Build/publish commands and deployment steps.
- Local dev setup and dependencies.
- Known integration pitfalls or gotchas.
