import { z } from "zod";

const MIN_SECRET_LENGTH = 32;

const authEnvSchema = z.object({
  JWT_ACCESS_SECRET: z.string().min(MIN_SECRET_LENGTH).optional(),
  JWT_SECRET: z.string().min(MIN_SECRET_LENGTH).optional(),
  JWT_REFRESH_SECRET: z.string().min(MIN_SECRET_LENGTH),
  AUTH_ISSUER: z.string().min(1).default("rightsy"),
  AUTH_AUDIENCE: z.string().min(1).default("rightsy-web"),
  NODE_ENV: z.string().optional(),
});

export type AuthEnv = {
  accessTokenSecret: string;
  refreshTokenSecret: string;
  issuer: string;
  audience: string;
  isProduction: boolean;
};

function readAuthEnv(): z.infer<typeof authEnvSchema> {
  const parsed = authEnvSchema.safeParse(process.env);

  if (!parsed.success) {
    throw new Error("Authentication environment is not configured correctly");
  }

  return parsed.data;
}

export function getAuthEnv(): AuthEnv {
  const env = readAuthEnv();
  const accessTokenSecret = env.JWT_ACCESS_SECRET ?? env.JWT_SECRET;

  if (!accessTokenSecret || accessTokenSecret.length < MIN_SECRET_LENGTH) {
    throw new Error("JWT_ACCESS_SECRET must be at least 32 characters long");
  }

  return {
    accessTokenSecret,
    refreshTokenSecret: env.JWT_REFRESH_SECRET,
    issuer: env.AUTH_ISSUER,
    audience: env.AUTH_AUDIENCE,
    isProduction: env.NODE_ENV === "production",
  };
}

export function getOptionalAuthEnv(): AuthEnv | null {
  try {
    return getAuthEnv();
  } catch {
    return null;
  }
}
