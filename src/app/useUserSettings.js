import { useEffect, useState } from "react";
import { db } from "./firebase";
import { doc, onSnapshot, setDoc } from "firebase/firestore";

export function useUserSettings(uid, defaultSettings) {
  const [settings, setSettings] = useState(defaultSettings);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const ref = doc(db, "users", uid, "settings", "main");
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) setSettings({ ...defaultSettings, ...snap.data() });
      else setSettings(defaultSettings);
      setLoading(false);
    });

    return () => unsub();
  }, [uid, defaultSettings]);

  async function save(nextSettings) {
    const ref = doc(db, "users", uid, "settings", "main");
    await setDoc(ref, nextSettings, { merge: true });
  }

  return { settings, setSettings, save, loading };
}
