export const FILM_STATUS = {
    PENDING:"pending",
    VALIDATED: "validated",
    SELECTED: "selected",
};

export const ALLOWED_TRANSITIONS = {
    [FILM_STATUS.PENDING]: [FILM_STATUS.VALIDATED],
    [FILM_STATUS.VALIDATED]: [FILM_STATUS.SELECTED],
    [FILM_STATUS.SELECTED]: [],
};
