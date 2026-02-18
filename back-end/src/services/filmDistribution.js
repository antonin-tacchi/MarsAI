/**
 * Algorithme de répartition déterministe des films pour les jurys.
 *
 * Principe : round-robin glouton avec équilibrage de charge.
 * - Chaque film doit être vu au minimum R fois.
 * - Les notes existantes comptent (on ne réassigne pas un film déjà noté).
 * - Les listes ne dépassent jamais Lmax par jury.
 * - Tri déterministe : même entrée → même sortie.
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

  // 1. Calculer les assignations nécessaires par film
  const needed = new Map();
  for (const film of films) {
    const existing = existingRatings.get(film.id)?.size || 0;
    const need = Math.max(0, R - existing);
    if (need > 0) needed.set(film.id, need);
  }

  const totalNeeded = Array.from(needed.values()).reduce((s, n) => s + n, 0);

  // 2. Vérifier la faisabilité
  const maxCapacity = juries.length * Lmax;
  if (totalNeeded > maxCapacity) {
    throw new DistributionError(
      `Capacité insuffisante : ${totalNeeded} assignations nécessaires, ` +
        `mais seulement ${maxCapacity} places disponibles ` +
        `(${juries.length} jurys × ${Lmax} max). ` +
        `Augmentez Lmax ou ajoutez des jurys.`
    );
  }

  // 3. Initialiser le suivi de charge par jury
  const juryLoad = new Map();
  const juryFilms = new Map();
  for (const jury of juries) {
    juryLoad.set(jury.id, 0);
    juryFilms.set(jury.id, new Set());
  }

  // 4. Tri déterministe : films par besoin décroissant, puis par ID
  const filmsByNeed = Array.from(needed.entries()).sort((a, b) => {
    if (b[1] !== a[1]) return b[1] - a[1];
    return a[0] - b[0];
  });

  // 5. Assignation round-robin gloutonne
  const assignments = [];

  for (const [filmId, need] of filmsByNeed) {
    const alreadyRated = existingRatings.get(filmId) || new Set();

    for (let i = 0; i < need; i++) {
      // Trouver le jury le moins chargé qui :
      //   a) n'a pas déjà noté ce film
      //   b) n'est pas déjà assigné à ce film
      //   c) a de la capacité (< Lmax)
      const candidates = juries
        .filter(
          (j) =>
            !alreadyRated.has(j.id) &&
            !juryFilms.get(j.id).has(filmId) &&
            juryLoad.get(j.id) < Lmax
        )
        .sort((a, b) => {
          const loadDiff = juryLoad.get(a.id) - juryLoad.get(b.id);
          if (loadDiff !== 0) return loadDiff;
          return a.id - b.id; // Tri secondaire par ID pour le déterminisme
        });

      if (candidates.length === 0) {
        throw new DistributionError(
          `Impossible d'assigner le film #${filmId} : aucun jury disponible. ` +
            `Vérifiez les paramètres R et Lmax.`
        );
      }

      const chosen = candidates[0];
      assignments.push({ filmId, juryId: chosen.id });
      juryLoad.set(chosen.id, juryLoad.get(chosen.id) + 1);
      juryFilms.get(chosen.id).add(filmId);
    }
  }

  return {
    assignments,
    stats: buildStats(assignments, juries, juryLoad),
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
