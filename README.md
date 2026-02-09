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

```ts
import {
  CharacterRecordV1Schema,
  type CharacterRecordV1,
  validateCharacterRecordV1,
} from "@whisperspace/sdk";
```

All clients (builder, API) should validate or align with this schema.

## Usage
```ts
import { RULES_API_BASE, CALC_API_BASE, CHARACTER_API_BASE } from "@whisperspace/sdk";
```

## Status
Active
