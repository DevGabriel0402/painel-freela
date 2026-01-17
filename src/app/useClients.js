import { useEffect, useState } from "react";
import { db } from "./firebase";
import {
  collection,
  onSnapshot,
  orderBy,
  query,
  addDoc,
  doc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";

export function useClients(uid) {
  const [clients, setClients] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const q = query(
      collection(db, "users", uid, "clients"),
      orderBy("createdAt", "desc"),
    );
    const unsub = onSnapshot(q, (snap) => {
      setClients(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [uid]);

  async function addClient(payload) {
    await addDoc(collection(db, "users", uid, "clients"), {
      ...payload,
      createdAt: Date.now(),
    });
  }

  async function updateClient(id, patch) {
    await updateDoc(doc(db, "users", uid, "clients", id), patch);
  }

  async function removeClient(id) {
    await deleteDoc(doc(db, "users", uid, "clients", id));
  }

  return { clients, loading, addClient, updateClient, removeClient };
}
