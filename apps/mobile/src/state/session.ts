export type SessionContext = {
  currentFamilyId: string | null;
};

export const sessionDefaults: SessionContext = {
  currentFamilyId: null
};
