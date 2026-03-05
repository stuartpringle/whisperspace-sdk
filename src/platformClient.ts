import type { CharacterRecordV1 } from "./types";
import {
  CALC_API_BASE,
  CHARACTER_API_BASE,
  RULES_API_BASE,
} from "./config";

export type PlatformClientAuth = {
  apiKey?: string;
  bearerToken?: string;
};

export type PlatformClientOptions = {
  rulesApiBase?: string;
  calcApiBase?: string;
  characterApiBase?: string;
  auth?: PlatformClientAuth;
  fetchImpl?: typeof fetch;
  credentials?: RequestCredentials;
  defaultHeaders?: Record<string, string>;
};

export type CharacterSession = {
  user: { id: string; email: string } | null;
  csrfToken?: string;
};

export type CharacterCsrf = {
  csrfToken: string;
  authenticated: boolean;
};

export type CharacterSummary = {
  id: string;
  name?: string;
  updatedAt?: string;
  visibility?: "public" | "private";
  tags?: string[];
};

export type CharacterUpsertOptions = {
  visibility?: "public" | "private";
  csrfToken?: string;
  ifUnmodifiedSince?: string;
};

export type PlatformClient = {
  getRulesMeta: () => Promise<any>;
  getRulesJson: () => Promise<any>;
  getCalcSchemasIndex: () => Promise<any>;
  calcPost: <T>(path: string, payload: unknown) => Promise<T>;
  getCharacterSchema: () => Promise<any>;
  getAuthSession: () => Promise<CharacterSession>;
  getAuthCsrf: () => Promise<CharacterCsrf>;
  listCharacters: () => Promise<CharacterSummary[]>;
  getCharacter: (id: string) => Promise<CharacterRecordV1>;
  createCharacter: (
    record: CharacterRecordV1,
    options?: CharacterUpsertOptions
  ) => Promise<CharacterRecordV1>;
  updateCharacter: (
    id: string,
    record: CharacterRecordV1,
    options?: CharacterUpsertOptions
  ) => Promise<CharacterRecordV1>;
  deleteCharacter: (id: string, csrfToken?: string) => Promise<{ ok: boolean }>;
};

function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

function toRulesApiBase(base: string): string {
  if (base.includes("/rules-api/latest")) return trimTrailingSlash(base);
  if (base.endsWith("/latest")) return `${trimTrailingSlash(base.slice(0, -"/latest".length))}/rules-api/latest`;
  return `${trimTrailingSlash(base)}/rules-api/latest`;
}

function toCalcApiBase(base: string): string {
  if (base.includes("/rules-api/calc")) return trimTrailingSlash(base);
  if (base.endsWith("/calc")) return `${trimTrailingSlash(base.slice(0, -"/calc".length))}/rules-api/calc`;
  return `${trimTrailingSlash(base)}/rules-api/calc`;
}

function toCharacterApiBase(base: string): string {
  if (base.includes("/character-api")) return trimTrailingSlash(base);
  return `${trimTrailingSlash(base)}/character-api`;
}

function buildUrl(base: string, path: string): string {
  if (!path) return base;
  return `${trimTrailingSlash(base)}/${path.replace(/^\/+/, "")}`;
}

async function readErrorText(res: Response): Promise<string> {
  try {
    return await res.text();
  } catch {
    return "";
  }
}

export function createPlatformClient(options: PlatformClientOptions = {}): PlatformClient {
  const fetchImpl = options.fetchImpl ?? fetch;
  if (!fetchImpl) {
    throw new Error("No fetch implementation available for platform client");
  }

  const rulesApiBase = toRulesApiBase(options.rulesApiBase ?? RULES_API_BASE);
  const calcApiBase = toCalcApiBase(options.calcApiBase ?? CALC_API_BASE);
  const characterApiBase = toCharacterApiBase(
    options.characterApiBase ?? CHARACTER_API_BASE
  );

  const baseHeaders: Record<string, string> = {
    ...(options.defaultHeaders ?? {}),
  };

  if (options.auth?.bearerToken) {
    baseHeaders.Authorization = `Bearer ${options.auth.bearerToken}`;
  }
  if (options.auth?.apiKey) {
    baseHeaders["X-API-Key"] = options.auth.apiKey;
  }

  const credentials = options.credentials ?? "include";

  async function requestJson<T>(
    method: string,
    url: string,
    body?: unknown,
    extraHeaders?: Record<string, string>
  ): Promise<T> {
    const headers: Record<string, string> = {
      ...baseHeaders,
      ...(extraHeaders ?? {}),
    };

    if (body !== undefined) {
      headers["Content-Type"] = "application/json";
    }

    const res = await fetchImpl(url, {
      method,
      headers,
      credentials,
      body: body === undefined ? undefined : JSON.stringify(body),
    });

    if (!res.ok) {
      const text = await readErrorText(res);
      throw new Error(
        `Platform client request failed (${method} ${url}) ${res.status}: ${text || res.statusText}`
      );
    }

    if (res.status === 204) {
      return {} as T;
    }

    return (await res.json()) as T;
  }

  function withVisibility(path: string, visibility?: "public" | "private"): string {
    if (!visibility) return path;
    const sep = path.includes("?") ? "&" : "?";
    return `${path}${sep}visibility=${visibility}`;
  }

  return {
    getRulesMeta: () => requestJson("GET", buildUrl(rulesApiBase, "meta.json")),
    getRulesJson: () => requestJson("GET", buildUrl(rulesApiBase, "rules.json")),
    getCalcSchemasIndex: () =>
      requestJson("GET", buildUrl(calcApiBase, "schemas/index.json")),
    calcPost: <T>(path: string, payload: unknown) =>
      requestJson<T>("POST", buildUrl(calcApiBase, path), payload ?? {}),
    getCharacterSchema: () =>
      requestJson("GET", buildUrl(characterApiBase, "schema.json")),
    getAuthSession: () => requestJson("GET", buildUrl(characterApiBase, "auth/session")),
    getAuthCsrf: () => requestJson("GET", buildUrl(characterApiBase, "auth/csrf")),
    listCharacters: () => requestJson("GET", buildUrl(characterApiBase, "characters")),
    getCharacter: (id: string) =>
      requestJson("GET", buildUrl(characterApiBase, `characters/${encodeURIComponent(id)}`)),
    createCharacter: (
      record: CharacterRecordV1,
      options?: CharacterUpsertOptions
    ) => {
      const path = withVisibility("characters", options?.visibility);
      const headers = options?.csrfToken
        ? { "X-CSRF-Token": options.csrfToken }
        : undefined;
      return requestJson("POST", buildUrl(characterApiBase, path), record, headers);
    },
    updateCharacter: (
      id: string,
      record: CharacterRecordV1,
      options?: CharacterUpsertOptions
    ) => {
      const path = withVisibility(
        `characters/${encodeURIComponent(id)}`,
        options?.visibility
      );
      const headers: Record<string, string> = {};
      if (options?.csrfToken) headers["X-CSRF-Token"] = options.csrfToken;
      if (options?.ifUnmodifiedSince) {
        headers["If-Unmodified-Since"] = options.ifUnmodifiedSince;
      }
      return requestJson(
        "PUT",
        buildUrl(characterApiBase, path),
        record,
        Object.keys(headers).length ? headers : undefined
      );
    },
    deleteCharacter: (id: string, csrfToken?: string) =>
      requestJson(
        "DELETE",
        buildUrl(characterApiBase, `characters/${encodeURIComponent(id)}`),
        undefined,
        csrfToken ? { "X-CSRF-Token": csrfToken } : undefined
      ),
  };
}
