/**
 * Algorithme de répartition déterministe des films pour les jurys.
 *
 * Principe : round-robin cyclique avec décalage.
 *
 * On fait R "couches" (rounds). Dans chaque round, on assigne chaque film
 * à un jury en avançant d'un cran dans la liste des jurys. À chaque nouveau
 * round, on décale l'index de départ de `shift = floor(J / R)` positions
 * (minimum 1) pour garantir qu'un même film ne retombe pas chez le même jury.
 *
 * Les notes existantes sont prises en compte : si un jury a déjà noté un
 * film, on saute ce jury et on prend le suivant dans l'ordre cyclique.
 *
 * Le résultat est 100 % déterministe : même entrée → même sortie.
 */

/**
 * @param {Array<{id: number}>}             films           - Tous les films à répartir
 * @param {Array<{id: number}>}             juries          - Tous les jurys (rôle 1)
 * @param {number}                          R               - Nombre minimum de votes par film
 * @param {number}                          Lmax            - Taille maximale d'une liste par jury
 * @param {Map<number, Set<number>>}        existingRatings - filmId → Set<juryId> (notes existantes)
 * @returns {{ assignments: Array<{filmId: number, juryId: number}>, stats: object }}
 */
export function distributeFilms(films, juries, R, Lmax, existingRatings) {
  if (!films.length) {
    return { assignments: [], stats: buildStats([], juries, new Map()) };
  }
  if (!juries.length) {
    throw new DistributionError("Aucun jury disponible pour la répartition");
  }
  if (R < 1) {
    throw new DistributionError("R doit être au minimum 1");
  }
  if (Lmax < 1) {
    throw new DistributionError("Lmax doit être au minimum 1");
  }
  if (R > juries.length) {
    throw new DistributionError(
      `R (${R}) ne peut pas dépasser le nombre de jurys (${juries.length}). ` +
        `Chaque film doit être assigné à ${R} jurys différents.`
    );
  }

  // Tri déterministe des films et jurys par ID croissant
  const sortedFilms = [...films].sort((a, b) => a.id - b.id);
  const sortedJuries = [...juries].sort((a, b) => a.id - b.id);

  const J = sortedJuries.length;
  const F = sortedFilms.length;

  // Décalage entre chaque round : on espace les rounds au maximum
  const shift = Math.max(1, Math.floor(J / R));

  // Vérifier la faisabilité globale
  // Nombre d'assignations nécessaires en tenant compte des notes existantes
  let totalNeeded = 0;
  for (const film of sortedFilms) {
    const existing = existingRatings.get(film.id)?.size || 0;
    totalNeeded += Math.max(0, R - existing);
  }

  const maxCapacity = J * Lmax;
  if (totalNeeded > maxCapacity) {
    throw new DistributionError(
      `Capacité insuffisante : ${totalNeeded} assignations nécessaires, ` +
        `mais seulement ${maxCapacity} places disponibles ` +
        `(${J} jurys × ${Lmax} max). ` +
        `Augmentez Lmax ou ajoutez des jurys.`
    );
  }

  // Suivi de la charge et des assignations par jury
  const juryLoad = new Map();
  const juryFilmsMap = new Map();
  for (const jury of sortedJuries) {
    juryLoad.set(jury.id, 0);
    juryFilmsMap.set(jury.id, new Set());
  }

  const assignments = [];

  // Compteur d'assignations par film (O(1) au lieu de filter à chaque fois)
  const filmAssignCount = new Map();
  for (const film of sortedFilms) {
    filmAssignCount.set(film.id, 0);
  }

  // Round-robin cyclique avec décalage
  for (let round = 0; round < R; round++) {
    const roundOffset = round * shift;

    for (let filmIdx = 0; filmIdx < F; filmIdx++) {
      const film = sortedFilms[filmIdx];
      const alreadyRated = existingRatings.get(film.id) || new Set();

      // Si ce film a déjà R assignations + notes existantes, on skip
      const total = alreadyRated.size + filmAssignCount.get(film.id);
      if (total >= R) continue;

      // Position de base pour ce film dans ce round
      const basePos = (filmIdx + roundOffset) % J;

      // Parcourir les jurys cycliquement à partir de basePos
      let assigned = false;
      for (let attempt = 0; attempt < J; attempt++) {
        const juryIdx = (basePos + attempt) % J;
        const jury = sortedJuries[juryIdx];

        // Skip si le jury a déjà noté ce film
        if (alreadyRated.has(jury.id)) continue;

        // Skip si le jury est déjà assigné à ce film
        if (juryFilmsMap.get(jury.id).has(film.id)) continue;

        // Skip si le jury a atteint Lmax
        if (juryLoad.get(jury.id) >= Lmax) continue;

        // Assigner
        assignments.push({ filmId: film.id, juryId: jury.id });
        juryLoad.set(jury.id, juryLoad.get(jury.id) + 1);
        juryFilmsMap.get(jury.id).add(film.id);
        filmAssignCount.set(film.id, filmAssignCount.get(film.id) + 1);
        assigned = true;
        break;
      }

      if (!assigned) {
        throw new DistributionError(
          `Impossible d'assigner le film #${film.id} au round ${round + 1}. ` +
            `Vérifiez les paramètres R et Lmax.`
        );
      }
    }
  }

  return {
    assignments,
    stats: buildStats(assignments, sortedJuries, juryLoad),
  };
}

function buildStats(assignments, juries, juryLoad) {
  const loads = Array.from(juryLoad.values());
  const total = assignments.length;
  const min = loads.length ? Math.min(...loads) : 0;
  const max = loads.length ? Math.max(...loads) : 0;
  const avg = loads.length ? (total / loads.length).toFixed(1) : 0;

  return {
    totalAssignments: total,
    juryCount: juries.length,
    minPerJury: min,
    maxPerJury: max,
    avgPerJury: Number(avg),
    perJury: juries.map((j) => ({
      juryId: j.id,
      juryName: j.name || j.email,
      filmCount: juryLoad.get(j.id) || 0,
    })),
  };
}

export class DistributionError extends Error {
  constructor(message) {
    super(message);
    this.name = "DistributionError";
  }
}
