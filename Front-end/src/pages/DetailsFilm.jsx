import { useState } from "react";
import FilmPlayer from "../components/FilmPlayer";


/*  Suggestion item  */
function FilmSuggestionItem({ title, subtitle }) {
  return (
    <div className="
        flex gap-4
      "
    >
      <div
        className="
          w-[121px] h-[121px] shrink-0
          bg-black/10
          border border-[#262335]/10
        "
      />

      <div className="min-w-0">
        <p
          className="
            text-2xl
            font-semibold
            text-[#262335]
            leading-tight
          "
        >
          {title}
        </p>

        <p
          className="
            text-2xl
            text-[#262335]/70
            leading-tight
          "
        >
          {subtitle}
        </p>
      </div>
    </div>
  );
}

/*  Page  */
export default function DetailsFilm() {
  const [comment, setComment] = useState("");
  const [rating, setRating] = useState(0);

  const suggestions = [
    { title: "Lorem Ipsum", subtitle: "Lorem ipsum dolor sit amet" },
    { title: "Lorem Ipsum", subtitle: "Lorem ipsum dolor sit amet" },
    { title: "Lorem Ipsum", subtitle: "Lorem ipsum dolor sit amet" },
  ];

  return (
    <div className="bg-white">

      {/* Container principal */}
      <div
        className="
          mx-auto max-w-7xl
          pl-6 pr-10
          lg:pl-8 lg:pr-16
          py-10
        "
      >
        
        <div
          className="
            flex flex-col
            gap-10
            lg:flex-row
            lg:gap-16
          "
        >
          {/* left column */}
          <div className="min-w-0 lg:flex-[2]">
            <FilmPlayer
              title="Film Démo"
              aiUrl="https://www.youtube.com/embed/dQw4w9WgXcQ"
              posterUrl="https://picsum.photos/1200/675"
            />

            {/* video's details */}
            <div
              className="
                mt-6
                flex items-start justify-between gap-6
              "
            >
              <div className="min-w-0">
                <p
                  className="
                    text-lg
                    font-medium
                  "
                >
                  Titre de la vidéo
                </p>

                <div
                  className="
                    mt-4
                    flex items-center gap-4
                  "
                >
                  <div
                    className="
                      w-[60px] h-[60px] shrink-0
                      rounded-full
                      bg-black/10
                      border border-[#262335]/10
                    "
                  />

                  <p
                    className="
                      text-lg
                      font-medium
                      truncate
                    "
                  >
                    Nom de la chaîne
                  </p>
                </div>
              </div>

              <p
                className="
                  shrink-0
                  text-lg
                  font-medium
                "
              >
                Vues
              </p>
            </div>

            {/* Description */}
            <div className="mt-6">
              <p
                className="
                  text-base
                  font-medium
                  text-[#262335]
                "
              >
                Date de publication
              </p>

              <p
                className="
                  mt-3
                  max-w-[80ch]
                  text-base
                  text-[#262335]/80
                  leading-relaxed
                "
              >
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
                Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure
                dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non
                proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
              </p>
            </div>

            {/* Ratings */}
            <div
              className="
                mt-12
                flex flex-col
                gap-10
                md:flex-row
                items-end
                mb-[69px]
              "
            >
              <div className="md:flex-1">
                <h2
                  className="
                    mb-4
                    text-[28px] font-medium
                    text-[#262335]
                  "
                >
                  Donnez votre avis
                </h2>

                <div
                  className="
                    w-[600px] h-[80px]
                    flex items-center justify-between
                    px-[27px]
                    bg-black/10
                    border border-[#262335]/10
                    rounded-md
                  "
                >
                  {Array.from({ length: 10 }).map((_, i) => {
                    const value = i + 1;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setRating(value)}
                        className="
                          w-10 h-10
                          p-0
                          border-0
                          bg-transparent
                          flex items-center justify-center
                          focus:outline-none
                        "
                      >
                        <svg
                          className={`
                            w-10 h-10
                            ${value <= rating ? "text-yellow-400" : "text-white"}
                          `}
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.286 3.97a1 1 0 00.95.69h4.178c.969 0 1.371 1.24.588 1.81l-3.38 2.455a1 1 0 00-.364 1.118l1.287 3.97c.3.921-.755 1.688-1.54 1.118l-3.381-2.455a1 1 0 00-1.175 0l-3.38 2.455c-.785.57-1.84-.197-1.54-1.118l1.286-3.97a1 1 0 00-.364-1.118L2.049 9.397c-.783-.57-.38-1.81.588-1.81h4.178a1 1 0 00.95-.69l1.286-3.97z" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="md:flex-1">
                <h2 
                  className="
                    mb-4
                    text-[28px] font-medium
                    text-[#262335]
                  "
                >
                  Ajoutez un commentaire...
                </h2>

                <div
                  className="
                    w-[600px] h-[80px]
                    max-w-full
                    p-[3px]
                    bg-white
                    border border-black/10
                  "
                >
                  <textarea
                    name="comment"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Votre commentaire..."
                    className="
                      w-full h-full
                      bg-black/5
                      border border-black/10
                      outline-none
                      resize-none
                      px-4 py-4
                      text-base
                      text-[#262335]
                      placeholder:text-[#262335]/40
                    "
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right column */}
          <aside
            className="
              min-w-0
              space-y-12
              pt-2
              lg:w-[360px]
              lg:shrink-0
            "
          >
            {suggestions.map((s, idx) => (
              <FilmSuggestionItem
                key={idx}
                title={s.title}
                subtitle={s.subtitle}
              />
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}
