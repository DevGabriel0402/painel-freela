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

export function useJobs(uid) {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!uid) return;

    const q = query(collection(db, "users", uid, "jobs"), orderBy("createdAt", "desc"));
    const unsub = onSnapshot(q, (snap) => {
      setJobs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setLoading(false);
    });

    return () => unsub();
  }, [uid]);

  async function addJob(payload) {
    await addDoc(collection(db, "users", uid, "jobs"), {
      ...payload,
      createdAt: Date.now(),
    });
  }

  async function updateJob(id, patch) {
    await updateDoc(doc(db, "users", uid, "jobs", id), patch);
  }

  async function removeJob(id) {
    await deleteDoc(doc(db, "users", uid, "jobs", id));
  }

  return { jobs, loading, addJob, updateJob, removeJob };
}
