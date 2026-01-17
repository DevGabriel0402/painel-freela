import { createContext, useContext } from "react";

export const PrivacyContext = createContext({
  privacyOn: false,
  togglePrivacy: () => {},
});

export function usePrivacy() {
  return useContext(PrivacyContext);
}
