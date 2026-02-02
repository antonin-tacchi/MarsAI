import { Link } from "react-router-dom";

export default function FilmCard({ film, apiUrl, imageVariant = "auto" }) {
  const pickImagePath = () => {
    const thumb = film?.thumbnail_url || "";
    const poster = film?.poster_url || "";

    if (imageVariant === "thumbnail") return thumb;
    if (imageVariant === "poster") return poster;

    return thumb || poster;
  };

  const filePath = pickImagePath();
  const src = filePath?.startsWith("http")
    ? filePath
    : `${apiUrl}${filePath}`;

  return (
    <Link
      to={`/details-film/${film.id}`}
      className="block w-[260px] cursor-pointer"
    >
      <div className="group">
        <img
          src={filePath ? src : "/placeholder.jpg"}
          alt={film?.title || "Film"}
          className="w-full h-[160px] object-cover rounded-lg bg-[#C7C2CE]
                     transition-transform duration-200 group-hover:scale-[1.03]"
          onError={(e) => {
            e.currentTarget.src = "/placeholder.jpg";
          }}
        />

        <p className="text-[#262335] mt-2 font-semibold">
          {film?.title || "Titre inconnu"}
        </p>

        <p className="text-sm text-[#262335]/80">
          {film?.director_firstname || "Prénom"}{" "}
          {film?.director_lastname || "Nom"}
        </p>
      </div>
    </Link>
  );
}
