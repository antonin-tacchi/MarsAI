import { useEffect, useMemo, useRef, useState } from "react";

function isVideoFile(url = "") {
  return /\.(mp4|webm|mov|m4v)(\?.*)?$/i.test(url);
}

function isYouTube(url = "") {
  return /youtube\.com|youtu\.be/i.test(url);
}

function toYouTubeEmbed(url = "") {
  try {
    if (url.includes("youtu.be/")) {
      const id = url.split("youtu.be/")[1].split(/[?&]/)[0];
      return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
    }

    if (url.includes("watch?v=")) {
      const u = new URL(url);
      const id = u.searchParams.get("v");
      if (id) return `https://www.youtube.com/embed/${id}?rel=0&modestbranding=1`;
    }

    if (url.includes("/embed/")) {
      return url.includes("?") ? url : `${url}?rel=0&modestbranding=1`;
    }

    return url;
  } catch {
    return url;
  }
}

function absolutize(url = "", base = "") {
  if (!url) return "";
  const u = String(url).trim();

  if (/^(https?:)?\/\//i.test(u) || /^(blob:|data:)/i.test(u)) return u;

  const cleanBase = String(base || "").replace(/\/$/, "");
  if (!cleanBase) return u;

  if (u.startsWith("/")) return `${cleanBase}${u}`;
  return `${cleanBase}/${u}`;
}

export default function FilmPlayer({
  title,
  aiUrl,
  thumbnailUrl,
  posterUrl,
  apiUrl,
}) {
  const API_URL =
    apiUrl || import.meta.env.VITE_API_URL || "http://localhost:5001";

  const [videoError, setVideoError] = useState(false);
  const [imgError, setImgError] = useState(false);

  const videoRef = useRef(null);

  const aiAbs = useMemo(() => absolutize(aiUrl, API_URL), [aiUrl, API_URL]);
  const thumbAbs = useMemo(() => absolutize(thumbnailUrl, API_URL), [thumbnailUrl, API_URL]);
  const posterAbs = useMemo(() => absolutize(posterUrl, API_URL), [posterUrl, API_URL]);

  const mode = useMemo(() => {
    if (!aiAbs) return "image";
    if (isVideoFile(aiAbs)) return "video";
    if (isYouTube(aiAbs)) return "youtube";
    return "iframe";
  }, [aiAbs]);

  const previewImage = thumbAbs || posterAbs || "/placeholder.jpg";

  // 🔑 clés de persistance (unique par URL)
  const storageKeyTime = useMemo(() => `filmplayer:time:${aiAbs}`, [aiAbs]);
  const storageKeyPlaying = useMemo(() => `filmplayer:playing:${aiAbs}`, [aiAbs]);

  useEffect(() => {
    if (mode !== "video") return;

    const video = videoRef.current;
    if (!video) return;

    const saveTime = () => {
      try {
        localStorage.setItem(storageKeyTime, String(video.currentTime || 0));
      } catch {}
    };

    const savePlaying = () => {
      try {
        localStorage.setItem(storageKeyPlaying, video.paused ? "0" : "1");
      } catch {}
    };

    const restore = async () => {
      // attendre metadata pour pouvoir set currentTime
      const tRaw = localStorage.getItem(storageKeyTime);
      const wasPlaying = localStorage.getItem(storageKeyPlaying) === "1";

      const t = tRaw ? Number(tRaw) : 0;
      if (Number.isFinite(t) && t > 0) {
        // si la durée est connue, clamp
        const safeTime =
          Number.isFinite(video.duration) && video.duration > 0
            ? Math.min(t, Math.max(0, video.duration - 0.25))
            : t;

        try {
          video.currentTime = safeTime;
        } catch {}
      }

      // si elle était en lecture avant reload, on relance
      // ⚠️ autoplay sera de toute façon soumis aux règles navigateur (muted => OK)
      if (wasPlaying) {
        try {
          await video.play();
        } catch {
          // ignore: navigateur peut bloquer si conditions pas remplies
        }
      }
    };

    const onLoadedMetadata = () => restore();

    video.addEventListener("timeupdate", saveTime);
    video.addEventListener("pause", savePlaying);
    video.addEventListener("play", savePlaying);
    video.addEventListener("loadedmetadata", onLoadedMetadata);

    // au cas où l’onglet se ferme (dernier save)
    window.addEventListener("beforeunload", saveTime);

    return () => {
      video.removeEventListener("timeupdate", saveTime);
      video.removeEventListener("pause", savePlaying);
      video.removeEventListener("play", savePlaying);
      video.removeEventListener("loadedmetadata", onLoadedMetadata);
      window.removeEventListener("beforeunload", saveTime);
    };
  }, [mode, storageKeyTime, storageKeyPlaying]);

  return (
    <div className="w-full h-full rounded-[18px] overflow-hidden bg-black/10 border border-[#262335]/10">
      {(mode === "image" || videoError) && (
        <img
          src={imgError ? "/placeholder.jpg" : previewImage}
          alt={title || "Film"}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      )}

      {!videoError && mode === "video" && (
        <video
          ref={videoRef}
          key={aiAbs}
          autoPlay
          muted
          controls
          playsInline
          preload="auto"
          poster={previewImage}
          className="w-full h-full object-cover bg-black"
          onError={() => setVideoError(true)}
        >
          <source src={aiAbs} type="video/mp4" />
          Votre navigateur ne supporte pas la lecture vidéo.
        </video>
      )}

      {mode === "youtube" && (
        <iframe
          key={aiAbs}
          title={title || "Film"}
          src={toYouTubeEmbed(aiAbs)}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}

      {mode === "iframe" && (
        <iframe
          key={aiAbs}
          title={title || "Film"}
          src={aiAbs}
          className="w-full h-full"
          allowFullScreen
          referrerPolicy="strict-origin-when-cross-origin"
        />
      )}
    </div>
  );
}
