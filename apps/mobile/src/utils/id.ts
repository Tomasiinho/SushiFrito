import * as Crypto from "expo-crypto";

export type IdFactory = () => string;

export const createClientId: IdFactory = () => Crypto.randomUUID();
