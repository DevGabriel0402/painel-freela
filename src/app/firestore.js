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
    limit,
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
        await setDoc(settingsRef, { appName: "Flowyhub" }, { merge: true });
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

// --- SEED ---

export async function seedDataForUser(uid) {
    if (!uid) return;
    const userRef = doc(db, "users", uid);
    const clientsRef = collection(userRef, "clients");
    const jobsRef = collection(userRef, "jobs");

    // 1. Create Clients
    const dummyClients = [
        { name: "Ana Clara Silva", contact: "11999998888", notes: "Cliente VIP" },
        { name: "Bruno Souza", contact: "bruno@email.com", notes: "Prefere contato via email" },
        { name: "Carla Dias", contact: "21988887777", notes: "" },
        { name: "Daniel Oliveira", contact: "31977776666", notes: "Agência parceira" },
        { name: "Eduardo Santos", contact: "edu@empresa.com", notes: "" },
    ];

    const clientIds = [];
    const clientPromises = dummyClients.map(async (c) => {
        const ref = doc(clientsRef);
        clientIds.push({ id: ref.id, name: c.name });
        return setDoc(ref, {
            ...c,
            id: ref.id,
            createdAt: Date.now(),
        });
    });

    await Promise.all(clientPromises);

    // 2. Create Jobs
    const dummyJobs = [
        { title: "Website Institucional", value: 5000, status: "Em andamento", deadline: "2025-12-31" },
        { title: "Logo Design", value: 1500, status: "Concluído", deadline: "2025-10-15" },
        { title: "Gestão Redes Sociais", value: 2000, status: "Em andamento", deadline: "2025-11-30" },
        { title: "App Delivery", value: 15000, status: "Cancelado", deadline: "2025-09-01" },
        { title: "Manutenção Mensal", value: 800, status: "Em andamento", deadline: "2025-12-15" },
        { title: "Landing Page", value: 1200, status: "Concluído", deadline: "2025-10-01" },
        { title: "Identidade Visual", value: 3000, status: "Em andamento", deadline: "2026-01-20" },
        { title: "Consultoria SEO", value: 2500, status: "Concluído", deadline: "2025-08-15" },
    ];

    const jobPromises = dummyJobs.map((j, i) => {
        const ref = doc(jobsRef);
        // Assign random client
        const client = clientIds[i % clientIds.length];
        return setDoc(ref, {
            ...j,
            clientId: client.id,
            clientName: client.name,
            id: ref.id,
            createdAt: Date.now(),
        });
    });

    await Promise.all(jobPromises);
}

// --- FEEDBACKS ---

export function subscribeFeedbacks(onData) {
    const ref = collection(db, "feedbacks");
    // Limite de 50 para não pesar
    const q = query(ref, orderBy("createdAt", "desc"), limit(50));
    return onSnapshot(q, (snap) => {
        const items = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
        onData(items);
    });
}

export async function addFeedback(uid, data) {
    if (!uid) return;
    const ref = doc(collection(db, "feedbacks"));
    await setDoc(ref, {
        ...data,
        uid, // Quem criou
        id: ref.id,
        createdAt: Date.now(),
    });
}

export async function deleteFeedback(feedbackId) {
    if (!feedbackId) return;
    await deleteDoc(doc(db, "feedbacks", feedbackId));
}
