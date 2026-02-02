export default function FilmPlayer({ aiUrl, posterUrl, title = "Film" }) {
  return (
    <div className="w-full overflow-hidden rounded-2xl border border-[#262335]/10 bg-black/5">
      <div className="relative w-full aspect-video">
        {aiUrl ? (
          <iframe
            className="absolute inset-0 h-full w-full"
            src={aiUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        ) : posterUrl ? (
          <img
            className="absolute inset-0 h-full w-full object-cover"
            src={posterUrl}
            alt={title}
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center text-[#262335]/60">
            Aucun média
          </div>
        )}
      </div>
    </div>
  );
}
