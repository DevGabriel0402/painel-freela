export function isLocked(perms, key) {
    // se não tiver perms carregado ainda, não trava (ou trava? user disse "não trava")
    if (!perms) return false;
    // A lógica é: se no objeto de permissões estiver explicitamente false, então está locked.
    // perms[key] === false -> locked
    return perms[key] === false;
}
