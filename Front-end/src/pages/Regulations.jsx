export default function Regulations() {
  return (
    <div className="bg-[#FBF5F0] min-h-screen py-16 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Header */}
        <div className="mb-12 border-b-2 border-[#262335] pb-8">
          <p className="text-sm font-bold tracking-widest text-[#463699] uppercase mb-3">
            Mars AI Film Festival
          </p>
          <h1 className="text-3xl md:text-5xl font-black text-[#262335] uppercase italic leading-tight">
            Règles et Conditions
          </h1>
        </div>

        <div className="space-y-12 text-[#262335]">

          {/* Section 1 */}
          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#262335] mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#262335] text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                1
              </span>
              Admissibilité générale
            </h2>
            <ul className="space-y-4 pl-11">
              {[
                "Les candidatures sont ouvertes aux cinéastes et photographes de tous les pays.",
                "Tous les projets doivent avoir été achevés après le 1er janvier 2024.",
                "Les candidats doivent être âgés de 18 ans ou plus.",
                "Tous les films non anglophones doivent être sous-titrés en anglais.",
              ].map((item, i) => (
                <li key={i} className="flex gap-3 text-base leading-relaxed">
                  <span className="font-bold text-[#463699] flex-shrink-0">1.{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </section>

          {/* Section 2 */}
          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#262335] mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#262335] text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                2
              </span>
              Éligibilité au projet et à l'IA
            </h2>
            <div className="pl-11 space-y-6">
              <div>
                <p className="font-bold mb-3">
                  <span className="text-[#463699]">2.1.</span> Mars AI accepte des projets dans deux axes principaux :
                </p>
                <ul className="space-y-3 pl-4">
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>
                      <strong>Courts métrages :</strong> tous genres (fiction, expérimental, documentaire, animation, clip musical). Durée maximale : 20 minutes (générique compris).
                    </span>
                  </li>
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>
                      <strong>Photographie :</strong> Images uniques ou série cohérente (jusqu'à 10 images).
                    </span>
                  </li>
                </ul>
              </div>

              <p className="leading-relaxed">
                <span className="font-bold text-[#463699]">2.2. </span>
                <span className="font-bold">EXIGENCE OBLIGATOIRE EN MATIÈRE D'IA : </span>
                Tous les projets soumis doivent utiliser l'intelligence artificielle générative comme une partie importante de leur processus de création ou de production.
              </p>

              <div>
                <p className="font-bold mb-3">
                  <span className="text-[#463699]">2.3. </span>
                  <span className="font-bold">MÉTHODES ACCEPTÉES : </span>
                  Mars AI accueille toutes les formes de collaboration humain-IA, y compris, mais sans s'y limiter :
                </p>
                <ul className="space-y-4 pl-4">
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>
                      <strong>Entièrement génératif :</strong> Œuvres créées principalement à partir de commandes texte-vidéo ou texte-image (par exemple, à l'aide d'outils comme Sora 2, Veo3, Runway, Pika, Midjourney, Stable Diffusion, etc.).
                    </span>
                  </li>
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>
                      <strong>Amélioration par l'IA (hybride) :</strong> Œuvres créées par l'homme (prises de vue réelles, photographies traditionnelles, rendus 3D) considérablement modifiées, améliorées ou finalisées à l'aide d'outils d'IA (par exemple, remplissage génératif, effets visuels pilotés par l'IA, transfert de style, montage assisté par l'IA, étalonnage des couleurs ou mise à l'échelle par l'IA).
                    </span>
                  </li>
                </ul>
              </div>

              <div>
                <p className="font-bold mb-3">
                  <span className="text-[#463699]">2.4. </span>
                  <span className="font-bold">DÉCLARATION OBLIGATOIRE SUR L'IA : </span>
                  Tous les candidats doivent inclure une brève déclaration sur l'IA (100 à 300 mots) dans leur candidature. Cette déclaration doit figurer dans la section « Lettre de motivation » ou dans un champ personnalisé.
                </p>
                <ul className="space-y-3 pl-4">
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>Elle doit décrire clairement et de manière transparente les outils, modèles et processus d'IA utilisés.</span>
                  </li>
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span>
                      Exemples : « Images réelles améliorées avec Generative Fill et rotoscopie par IA », « Créé entièrement avec Midjourney v6 et animé avec Runway Gen-2 », « Scénario par GPT-4, visuels par Stable Diffusion, son par un générateur texte-son par IA. »
                    </span>
                  </li>
                  <li className="flex gap-2 leading-relaxed">
                    <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                    <span className="font-bold text-red-700">L'absence d'une déclaration claire relative à l'IA entraînera la disqualification.</span>
                  </li>
                </ul>
              </div>
            </div>
          </section>

          {/* Section 3 */}
          <section>
            <h2 className="text-xl font-black uppercase tracking-wider text-[#262335] mb-6 flex items-center gap-3">
              <span className="w-8 h-8 rounded-full bg-[#262335] text-white flex items-center justify-center text-sm font-black flex-shrink-0">
                3
              </span>
              Propriété intellectuelle et concession de droits
            </h2>
            <div className="pl-11 space-y-6">
              <p className="leading-relaxed">
                <span className="font-bold text-[#463699]">3.1. </span>
                À titre d'incitation matérielle et de condition non négociable d'entrée, et en contrepartie de l'examen et de l'éventuelle exposition du Projet, le Candidat accorde par la présente à Mars AI, à ses entités mères, filiales, sociétés affiliées, successeurs, ayants droit et titulaires de licence désignés (collectivement, les « Parties ») une licence perpétuelle, irrévocable, non exclusive, exempte de redevances, mondiale, sous-licenciable et transférable.
              </p>

              <p className="leading-relaxed">
                <span className="font-bold text-[#463699]">3.2. </span>
                La présente licence inclut expressément le droit d'utiliser, de numériser, de reproduire, de copier, d'encoder, de stocker, d'analyser, d'extraire des données, de modifier, d'adapter, de créer des œuvres dérivées et d'exploiter de toute autre manière tous les éléments constitutifs du Projet soumis. Ceci inclut, sans toutefois s'y limiter, toutes les données visuelles (images individuelles, données de pixels), les données audio, les informations spatio-temporelles et les métadonnées associées.
              </p>

              <div>
                <p className="font-bold mb-3">
                  <span className="text-[#463699]">3.3. </span>
                  Les droits accordés en vertu du présent article 3 sont destinés aux fins suivantes :
                </p>
                <ul className="space-y-3 pl-4">
                  {[
                    {
                      label: "a) Augmentation des ensembles de données :",
                      text: "intégration du Projet et de ses éléments dans des bases de données et référentiels de données nouveaux ou existants.",
                    },
                    {
                      label: "b) Développement de modèles :",
                      text: "utilisation du Projet pour le développement, l'entraînement, la validation et le perfectionnement d'algorithmes d'apprentissage automatique, de réseaux de neurones, de grands modèles de langage, de modèles de diffusion, de modèles génératifs et de tout autre système d'intelligence artificielle.",
                    },
                    {
                      label: "c) Acquisition et analyse de données :",
                      text: "toutes les formes de recherche informatique, d'analyse heuristique, de reconnaissance de formes et d'extraction de données entreprises par les Parties ou leurs représentants.",
                    },
                  ].map((item, i) => (
                    <li key={i} className="flex gap-2 leading-relaxed">
                      <span className="text-[#463699] font-bold flex-shrink-0">—</span>
                      <span>
                        <strong>{item.label}</strong> {item.text}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>

              <p className="leading-relaxed">
                <span className="font-bold text-[#463699]">3.4. </span>
                Le Candidat reconnaît et accepte que cet octroi de droits facilite la mission technologique et de recherche du Festival Mars AI.
              </p>

              <p className="leading-relaxed">
                <span className="font-bold text-[#463699]">3.5. </span>
                Le Candidat déclare et garantit qu'il possède l'autorité pleine et entière pour accorder de tels droits et que l'utilisation du Projet par les Parties aux fins décrites aux présentes ne portera pas atteinte aux droits d'un tiers, y compris les droits d'auteur, les marques de commerce, les droits moraux ou les droits à la vie privée et à la publicité.
              </p>

              <p className="leading-relaxed">
                <span className="font-bold text-[#463699]">3.6. </span>
                La présente licence restera valable à perpétuité, que le Projet soit accepté, disqualifié, retiré ou sélectionné pour une exposition publique au Festival.
              </p>
            </div>
          </section>

        </div>

        {/* Footer note */}
        <div className="mt-16 pt-8 border-t border-[#262335]/20">
          <p className="text-xs text-[#262335]/50 text-center">
            En soumettant votre projet au Mars AI Film Festival, vous reconnaissez avoir lu, compris et accepté l'intégralité des présentes Règles et Conditions.
          </p>
        </div>

      </div>
    </div>
  );
}
