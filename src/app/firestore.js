import { db } from "./firebase";
import {
    collection,
    doc,
    setDoc,
    deleteDoc,
    updateDoc,
    onSnapshot,
    query,
    orderBy,
    getDoc,
} from "firebase/firestore";

/**
 * Inscreve-se nas coleções de clientes, jobs e configurações do usuário logado.
 * @param {string} uid ID do usuário logado
 * @param {function} onData Callback que recebe { clients, jobs, settings }
 * @returns {function} Função de unsubscribe
 */
export function subscribeData(uid, onData) {
    if (!uid) return () => { };

    const userRef = doc(db, "users", uid);
    const clientsRef = collection(userRef, "clients");
    const jobsRef = collection(userRef, "jobs");
    const settingsRef = doc(userRef, "settings", "main");

    const qClients = query(clientsRef, orderBy("createdAt", "desc"));
    const qJobs = query(jobsRef, orderBy("createdAt", "desc"));

    let clients = [];
    let jobs = [];
    let settings = null;

    // Helper para emitir apenas quando tivermos dados iniciais (opcional, 
    // mas aqui vamos emitir sempre que chegar algo de qualquer um)
    const emit = () => onData({ clients, jobs, settings });

    const unsubClients = onSnapshot(qClients, (snap) => {
        clients = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        emit();
    });

    const unsubJobs = onSnapshot(qJobs, (snap) => {
        jobs = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        emit();
    });

    const unsubSettings = onSnapshot(settingsRef, (snap) => {
        if (snap.exists()) {
            settings = snap.data();
        } else {
            settings = null;
        }
        emit();
    });

    return () => {
        unsubClients();
        unsubJobs();
        unsubSettings();
    };
}

export async function saveSettingsFS(uid, newSettings) {
    if (!uid) return;
    const ref = doc(db, "users", uid, "settings", "main");
    // setDoc com merge true para criar se não existir ou atualizar
    await setDoc(ref, newSettings, { merge: true });
}

export async function createUserProfile(uid, data) {
    if (!uid) return;
    const ref = doc(db, "users", uid);
    // Verifica se já existe para não sobrescrever
    const snap = await getDoc(ref);
    if (!snap.exists()) {
        await setDoc(ref, {
            ...data,
            createdAt: Date.now(),
        });
        // Cria também as settings padrão para garantir que a estrutura exista
        const settingsRef = doc(db, "users", uid, "settings", "main");
        await setDoc(settingsRef, { appName: "Painel Freela" }, { merge: true });
    }
}

// --- CLIENTS ---

export async function addClientFS(uid, clientData) {
    if (!uid) return;
    const userRef = doc(db, "users", uid);
    const newClientRef = doc(collection(userRef, "clients")); // Auto ID
    await setDoc(newClientRef, {
        ...clientData,
        id: newClientRef.id,
        createdAt: Date.now(),
    });
}

export async function updateClientFS(uid, clientId, patch) {
    if (!uid) return;
    const ref = doc(db, "users", uid, "clients", clientId);
    await updateDoc(ref, patch);
}

export async function removeClientFS(uid, clientId) {
    if (!uid) return;
    const ref = doc(db, "users", uid, "clients", clientId);
    await deleteDoc(ref);
}

// --- JOBS ---

export async function addJobFS(uid, jobData) {
    if (!uid) return;
    const userRef = doc(db, "users", uid);
    const newJobRef = doc(collection(userRef, "jobs")); // Auto ID
    await setDoc(newJobRef, {
        ...jobData,
        id: newJobRef.id,
        createdAt: Date.now(),
    });
}

export async function updateJobFS(uid, jobId, patch) {
    if (!uid) return;
    const ref = doc(db, "users", uid, "jobs", jobId);
    await updateDoc(ref, patch);
}

export async function removeJobFS(uid, jobId) {
    if (!uid) return;
    const ref = doc(db, "users", uid, "jobs", jobId);
    await deleteDoc(ref);
}
