import { ALLOWED_TRANSITIONS } from "../constants/filmStatus";

export function canChangeFilmStatus(currentStatus, nextStatus) {
    if (!ALLOWED_TRANSITIONS[currentStatus]) {
        return false;
    }
    return ALLOWED_TRANSITIONS[currentStatus].includes(nextStatus);
}