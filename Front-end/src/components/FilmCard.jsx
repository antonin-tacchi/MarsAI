import { Link } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";

export default function FilmCard({ film, apiUrl, imageVariant = "auto" }) {
  const [imgStatus, setImgStatus] = useState("loading");

  const filePath = useMemo(() => {
    const thumb = film?.thumbnail_url || "";
    const poster = film?.poster_url || "";

    if (imageVariant === "thumbnail") return thumb;
    if (imageVariant === "poster") return poster;

    return thumb || poster;
  }, [film, imageVariant]);

  const src = useMemo(() => {
    if (!filePath) return "/placeholder.jpg";
    return filePath.startsWith("http") ? filePath : `${apiUrl}${filePath}`;
  }, [filePath, apiUrl]);

  useEffect(() => {
    setImgStatus("loading");
  }, [src]);

  const title = film?.title || "Titre inconnu";
  const directorFirst = film?.director_firstname || "Prénom";
  const directorLast = film?.director_lastname || "Nom";

  return (
    <Link to={`/details-film/${film?.id ?? ""}`} className="block w-[260px] cursor-pointer">
      <div className="group h-full flex flex-col">
        <div className="relative w-full aspect-video rounded-lg overflow-hidden bg-[#C7C2CE]">
          {imgStatus === "loading" && (
            <div className="absolute inset-0 animate-pulse bg-[#C7C2CE]" />
          )}

          <img
            src={src}
            alt={title}
            className={`w-full h-full object-cover transition-transform duration-200 group-hover:scale-[1.03]
              ${imgStatus === "loaded" ? "opacity-100" : "opacity-0"}`}
            onLoad={() => setImgStatus("loaded")}
            onError={(e) => {
              setImgStatus("error");
              e.currentTarget.src = "/placeholder.jpg";
            }}
            loading="lazy"
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
