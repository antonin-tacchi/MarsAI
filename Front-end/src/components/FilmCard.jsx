import { Link } from "react-router-dom";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "../context/LanguageContext";

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

const RANK_STYLES = {
  1: { bg: "from-[#B8962E] to-[#FFD700]",    text: "text-[#0A0A0F]", label: "OR" },
  2: { bg: "from-[#8A8A8A] to-[#D4D5D8]",    text: "text-[#0A0A0F]", label: "AR" },
  3: { bg: "from-[#7C4B2E] to-[#C47A3A]",    text: "text-[#F5F0E8]", label: "BR" },
};

export default function FilmCard({ film, apiUrl, imageVariant = "auto", rank, onClick }) {
  const { t, lang } = useLanguage();
  const imgRef    = useRef(null);
  const [imgStatus, setImgStatus] = useState("loading");
  const [fallback, setFallback]   = useState(0);

  const filePath = useMemo(() => {
    const thumb  = film?.thumbnail_stream_url || film?.thumbnail_url || "";
    const poster = film?.poster_stream_url    || film?.poster_url    || "";
    if (imageVariant === "thumbnail") return thumb;
    if (imageVariant === "poster")    return poster;
    return thumb || poster;
  }, [film, imageVariant]);

  const sources = useMemo(() => {
    const list = [];
    const yt   = youtubeThumb(film?.youtube_url);
    if (yt) list.push(yt);

    if (filePath) {
      if (/^https?:\/\//i.test(filePath)) {
        list.push(filePath);
      } else {
        try { list.push(new URL(filePath, apiUrl).href); }
        catch { list.push(`${apiUrl}${filePath}`); }
      }
    }

    list.push("/placeholder.jpg");
    return list;
  }, [filePath, apiUrl, film?.youtube_url]);

  const src = sources[Math.min(fallback, sources.length - 1)];

  useEffect(() => { setFallback(0); setImgStatus("loading"); }, [sources]);

  useEffect(() => {
    const el = imgRef.current;
    if (el && el.complete && el.naturalWidth > 0) setImgStatus("loaded");
  }, [src]);

  const title =
    lang === "en"
      ? (film?.title_english || film?.title || t("filmCard.unknownTitle"))
      : (film?.title || film?.title_english || t("filmCard.unknownTitle"));

  const directorFirst = film?.director_firstname || t("filmCard.defaultFirstName");
  const directorLast  = film?.director_lastname  || t("filmCard.defaultLastName");

  const rankStyle = rank != null ? (RANK_STYLES[rank] || { bg: "from-[#8A83DA] to-[#463699]", text: "text-[#F5F0E8]" }) : null;

  const inner = (
    <div className="group h-full flex flex-col cinema-card overflow-hidden">
      {/* Image container */}
      <div className="relative w-full aspect-video overflow-hidden bg-[#12121A]">
        {/* Loading skeleton */}
        {imgStatus !== "loaded" && (
          <div className="absolute inset-0 bg-gradient-to-br from-[#1E1E2E] to-[#12121A] animate-pulse" />
        )}

        {/* Film image */}
        <img
          key={src}
          ref={imgRef}
          src={src}
          alt={title}
          className={`w-full h-full object-cover transition-all duration-500 group-hover:scale-[1.06]
            ${imgStatus === "loaded" ? "opacity-100" : "opacity-0"}`}
          onLoad={() => setImgStatus("loaded")}
          onError={() => {
            if (fallback < sources.length - 1) setFallback((f) => f + 1);
            else setImgStatus("error");
          }}
          loading="eager"
          decoding="async"
        />

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0F]/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Gold top accent line on hover */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Rank badge */}
        {rankStyle && (
          <div
            className={`absolute top-2.5 left-2.5 bg-gradient-to-br ${rankStyle.bg} ${rankStyle.text}
              text-[11px] font-black w-8 h-8 rounded flex items-center justify-center z-10
              shadow-[0_2px_8px_rgba(0,0,0,0.5)]`}
          >
            {rank}
          </div>
        )}

        {/* User rating badge */}
        {film?.user_rating !== null && film?.user_rating !== undefined && (
          <div className="absolute top-2.5 right-2.5 bg-[#0A0A0F]/80 backdrop-blur-sm border border-[#C9A84C]/40 text-[#C9A84C] text-[11px] font-bold px-2.5 py-1 rounded flex items-center gap-1 shadow-[0_2px_8px_rgba(0,0,0,0.5)]">
            <svg className="w-2.5 h-2.5 fill-[#C9A84C]" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            {film.user_rating}/10
          </div>
        )}

        {/* Image error */}
        {imgStatus === "error" && (
          <div className="absolute bottom-2 right-2 rounded bg-[#0A0A0F]/70 px-2 py-1 text-[10px] text-[#C8C0B0]">
            {t("filmCard.imageUnavailable")}
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="px-3 py-3 bg-[#12121A] border-t border-[#C9A84C]/8 flex flex-col flex-1">
        <p className="text-[#F5F0E8] font-semibold text-[14px] leading-tight truncate mb-0.5">
          {title}
        </p>
        <p className="text-[12px] text-[#C8C0B0]/70 tracking-wide">
          {directorFirst} {directorLast}
        </p>

        {film?.average_rating != null && (
          <div className="flex items-center gap-2 mt-2">
            <div className="flex items-center gap-1 text-[#C9A84C]">
              <svg className="w-3 h-3 fill-current" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              <span className="text-[12px] font-bold">{film.average_rating}/10</span>
            </div>
            {film.rating_count != null && (
              <span className="text-[11px] text-[#C8C0B0]/50">
                ({film.rating_count} {film.rating_count !== 1 ? t("filmCard.votes") : t("filmCard.vote")})
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );

  if (onClick) {
    return (
      <div onClick={onClick} className="block w-[280px] cursor-pointer">
        {inner}
      </div>
    );
  }

  return (
    <Link to={`/details-film/${film?.id ?? ""}`} className="block w-[280px] cursor-pointer">
      {inner}
    </Link>
  );
}
