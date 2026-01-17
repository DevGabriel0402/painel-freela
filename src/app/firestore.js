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
    getDocs,
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

    // Perfil do usuário (para permissões e administração)
    const profileRef = userRef;

    const qClients = query(clientsRef, orderBy("createdAt", "desc"));
    const qJobs = query(jobsRef, orderBy("createdAt", "desc"));

    let clients = [];
    let jobs = [];
    let settings = null;
    let profile = null;

    // Helper para emitir apenas quando tivermos dados iniciais (opcional, 
    // mas aqui vamos emitir sempre que chegar algo de qualquer um)
    const emit = () => onData({ clients, jobs, settings, profile });

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

    const unsubProfile = onSnapshot(profileRef, (snap) => {
        profile = snap.exists() ? snap.data() : null;
        emit();
    });

    return () => {
        unsubClients();
        unsubJobs();
        unsubSettings();
        unsubProfile();
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
            // permissões padrão (o admin pode alterar depois)
            permissions: {
                dashboard: true,
                jobs: true,
                clientes: true,
                settings: false, // <--- Bloqueado por padrão
            },
            disabled: false,
        });
        // Cria também as settings padrão para garantir que a estrutura exista
        const settingsRef = doc(db, "users", uid, "settings", "main");
        await setDoc(settingsRef, { appName: "Painel Freela" }, { merge: true });
    }
}

// ============ ADMIN ============

// Lista todos os usuários (admin apenas; depende das rules)
export function subscribeAllUsers(onUsers) {
    const usersRef = collection(db, "users");
    const qUsers = query(usersRef, orderBy("createdAt", "desc"));
    return onSnapshot(qUsers, (snap) => {
        const users = snap.docs.map((d) => ({ uid: d.id, ...d.data() }));
        onUsers(users);
    });
}

export async function updateUserAdmin(targetUid, patch) {
    if (!targetUid) return;
    const ref = doc(db, "users", targetUid);
    await updateDoc(ref, patch);
}

export async function setUserPermissionsAdmin(targetUid, permissions) {
    if (!targetUid) return;
    const ref = doc(db, "users", targetUid);
    await updateDoc(ref, { permissions });
}

export async function setUserDisabledAdmin(targetUid, disabled) {
    if (!targetUid) return;
    const ref = doc(db, "users", targetUid);
    await updateDoc(ref, { disabled: Boolean(disabled) });
}

// Limpa dados do usuário no Firestore (clients, jobs, settings/main).
// Obs: isso NÃO remove a conta de Auth (não é possível pelo front-end).
export async function clearUserDataAdmin(targetUid) {
    if (!targetUid) return;
    const userRef = doc(db, "users", targetUid);

    const clientsRef = collection(userRef, "clients");
    const jobsRef = collection(userRef, "jobs");
    const settingsRef = doc(userRef, "settings", "main");

    const [clientsSnap, jobsSnap] = await Promise.all([
        getDocs(clientsRef),
        getDocs(jobsRef),
    ]);

    const deletes = [];
    clientsSnap.forEach((d) => deletes.push(deleteDoc(d.ref)));
    jobsSnap.forEach((d) => deletes.push(deleteDoc(d.ref)));
    deletes.push(deleteDoc(settingsRef));

    await Promise.allSettled(deletes);
}

// Deleta completamente o usuário do Firestore (dados + documento de perfil)
export async function deleteUserFS(targetUid) {
    if (!targetUid) return;
    // Limpa subdados
    await clearUserDataAdmin(targetUid);
    // Remove doc principal
    const userRef = doc(db, "users", targetUid);
    await deleteDoc(userRef);
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
