import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

function youtubeThumb(url) {
  if (!url) return "";
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split(/[?&#]/)[0];
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
    }
    if (url.includes("watch?v=")) {
      const id = new URL(url).searchParams.get("v");
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
    }
    if (url.includes("/embed/")) {
      const id = url.split("/embed/")[1].split(/[?&#]/)[0];
      return id ? `https://img.youtube.com/vi/${id}/hqdefault.jpg` : "";
    }
  } catch { /* ignore */ }
  return "";
}

export default function FilmCard({ film, apiUrl, imageVariant = "auto", rank }) {
  const imgRef = useRef(null);
  const [imgStatus, setImgStatus] = useState("loading");
  const [fallback, setFallback] = useState(0);

  const filePath = useMemo(() => {
    const thumb = film?.thumbnail_url || "";
    const poster = film?.poster_url || "";

    if (imageVariant === "thumbnail") return thumb;
    if (imageVariant === "poster") return poster;

    return thumb || poster;
  }, [film, imageVariant]);

  // Chaine ordonnée : YouTube → DB image → placeholder
  const sources = useMemo(() => {
    const list = [];

    const yt = youtubeThumb(film?.youtube_url);
    if (yt) list.push(yt);

    if (filePath) {
      if (/^https?:\/\//i.test(filePath)) {
        list.push(filePath);
      } else {
        try {
          list.push(new URL(filePath, apiUrl).href);
        } catch {
          list.push(`${apiUrl}${filePath}`);
        }
      }
    }

    list.push("/placeholder.jpg");
    return list;
  }, [filePath, apiUrl, film?.youtube_url]);

  const src = sources[Math.min(fallback, sources.length - 1)];

  // Reset quand les sources changent (nouveau film)
  useEffect(() => {
    setFallback(0);
    setImgStatus("loading");
  }, [sources]);

  // Détecter les images déjà en cache
  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) {
      setImgStatus("loaded");
    }
  }, [src]);

  const title = film?.title || "Titre inconnu";
  const directorFirst = film?.director_firstname || "Prénom";
  const directorLast = film?.director_lastname || "Nom";

  return (
    <Link
      to={`/details-film/${film?.id ?? ""}`}
      className="block w-[260px] cursor-pointer"
    >
      <div className="group h-full flex flex-col">
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#C7C2CE]">
          {imgStatus !== "loaded" && (
            <div className="absolute inset-0 animate-pulse bg-[#C7C2CE]" />
          )}

          <img
            key={src}
            ref={imgRef}
            src={src}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]
              ${imgStatus === "loaded" ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgStatus("loaded")}
            onError={() => {
              if (fallback < sources.length - 1) {
                setFallback((f) => f + 1);
              } else {
                setImgStatus("error");
              }
            }}
            loading="eager"
            decoding="async"
          />

          {/* BADGE RANG */}
          {rank != null && (
            <div
              className={`absolute top-2 left-2 text-white text-sm font-bold w-8 h-8 rounded-full shadow-lg flex items-center justify-center z-10 bg-gradient-to-r ${
                rank === 1
                  ? "from-yellow-400 to-yellow-600"
                  : rank === 2
                    ? "from-gray-300 to-gray-500"
                    : rank === 3
                      ? "from-amber-600 to-amber-800"
                      : "from-[#9a92c9] to-[#2f2a73]"
              }`}
            >
              {rank}
            </div>
          )}

          {/* BADGE NOTE JURY */}
          {film?.user_rating !== null && film?.user_rating !== undefined && (
            <div className="absolute top-2 right-2 bg-gradient-to-r from-[#9a92c9] to-[#2f2a73] text-white text-sm font-bold px-3 py-1 rounded-full shadow-lg backdrop-blur-sm">
              ⭐ {film.user_rating}/10
            </div>
          )}


          {imgStatus === "error" && (
            <div className="absolute bottom-2 right-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white">
              Image indisponible
            </div>
          )}
        </div>

        <p className="text-[#262335] mt-2 font-semibold">{title}</p>
        <p className="text-sm text-[#262335]/80">
          {directorFirst} {directorLast}
        </p>

        {film?.average_rating != null && (
          <div className="flex items-center gap-2 mt-1">
            <span className="text-sm font-bold text-[#463699]">
              {film.average_rating}/10
            </span>
            {film.rating_count != null && (
              <span className="text-xs text-[#262335]/50">
                ({film.rating_count} vote{film.rating_count !== 1 ? "s" : ""})
              </span>
            )}
          </div>
        )}
      </div>
    </Link>
  );
}
