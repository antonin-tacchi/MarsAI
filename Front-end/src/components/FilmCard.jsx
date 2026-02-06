import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";

// Extract YouTube video ID from various URL formats
const getYouTubeId = (url) => {
  if (!url) return null;
  const patterns = [
    /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&?/]+)/,
    /youtube\.com\/shorts\/([^&?/]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
};

export default function FilmCard({ film, apiUrl, imageVariant = "auto" }) {
  const imgRef = useRef(null);
  const [imgStatus, setImgStatus] = useState("loading");

  // Get YouTube thumbnail as fallback
  const youtubeId = useMemo(() => getYouTubeId(film?.youtube_url), [film?.youtube_url]);

  const filePath = useMemo(() => {
    const thumb = film?.thumbnail_url || "";
    const poster = film?.poster_url || "";

    if (imageVariant === "thumbnail") return thumb;
    if (imageVariant === "poster") return poster;

    return thumb || poster;
  }, [film, imageVariant]);

  const src = useMemo(() => {
    // Priority 1: If YouTube URL exists, use YouTube thumbnail
    if (youtubeId) {
      return `https://img.youtube.com/vi/${youtubeId}/mqdefault.jpg`;
    }

    // Priority 2: Use local thumbnail/poster from DB
    if (!filePath) return "/placeholder.jpg";

    if (/^https?:\/\//i.test(filePath)) return filePath;

    try {
      return new URL(filePath, apiUrl).href;
    } catch {
      return `${apiUrl}${filePath}`;
    }
  }, [filePath, apiUrl, youtubeId]);

  useEffect(() => {
    setImgStatus("loading");

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
            onError={(e) => {
              // If YouTube thumbnail fails, try local file as fallback
              if (e.currentTarget.src.includes("youtube.com") && filePath) {
                const localUrl = /^https?:\/\//i.test(filePath)
                  ? filePath
                  : `${apiUrl}${filePath}`;
                e.currentTarget.src = localUrl;
                return;
              }
              setImgStatus("error");
              e.currentTarget.src = "/placeholder.jpg";
            }}
            loading="eager"
            decoding="async"
          />

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
      </div>
    </Link>
  );
}
