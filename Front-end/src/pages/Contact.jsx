// src/pages/Contact.jsx
import { useMemo } from "react";
import { useLanguage } from "../context/LanguageContext";
import NewsletterSubscribe from "../components/NewsletterSubscribe";

// ✅ Interactive map (Leaflet / OpenStreetMap)
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ✅ Fix Leaflet marker icons in Vite/React builds
const markerIcon = new L.Icon({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url)
    .toString(),
  iconUrl: new URL("leaflet/dist/images/marker-icon.png", import.meta.url).toString(),
  shadowUrl: new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).toString(),
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

export default function Contact() {
  const { t } = useLanguage();

  // You can change these whenever you want
  const contact = useMemo(
    () => ({
      email: "contact@marsai-festival.com",
      phone: "+33 4 91 00 00 00",
      fax: "+33 4 91 00 00 01",
      addressLine: "12 Rue D’Uzes, 13002 Marseille (Entrée principale)",
      // Approx coords for 12 Rue d'Uzes, 13002 Marseille
      // (if you want pixel-perfect accuracy, replace with your exact lat/lng)
      lat: 43.3086,
      lng: 5.3679,
    }),
    []
  );

  // Small helper to avoid blank titles if your i18n keys aren’t ready yet
  const tt = (key, fallback) => {
    const v = t(key);
    return v && v !== key ? v : fallback;
  };

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-black">
          {tt("pages.contact", "Contact")}
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-black/70">
          {tt(
            "contact.subtitle",
            "Une question ? Un bug ? Une IA qui a décidé de prendre des vacances ? On est joignables."
          )}
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Left column: infos */}
        <section className="lg:col-span-1">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_-45px_rgba(0,0,0,0.9)] backdrop-blur">
            <h2 className="text-lg font-bold text-black">
              {tt("contact.infoTitle", "Informations")}
            </h2>

            <div className="mt-5 space-y-4">
              {/* Email */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-black">
                  {/* mail icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M4 7.5a3 3 0 0 1 3-3h10a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-9Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                    />
                    <path
                      d="M6.5 8.3 12 12.5l5.5-4.2"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">
                    {tt("contact.email", "Email")}
                  </p>
                  <a
                    href={`mailto:${contact.email}`}
                    className="text-sm text-black/75 underline decoration-white/20 underline-offset-4 hover:text-black"
                  >
                    {contact.email}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-black">
                  {/* phone icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 4.5h3l1 4-2 1.5c1.4 2.8 3.7 5.1 6.5 6.5L17 14.5l4 1v3c0 1.1-.9 2-2 2-8.8 0-16-7.2-16-16 0-1.1.9-2 2-2Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">
                    {tt("contact.phone", "Téléphone")}
                  </p>
                  <a
                    href={`tel:${contact.phone.replace(/\s/g, "")}`}
                    className="text-sm text-black/75 underline decoration-white/20 underline-offset-4 hover:text-black"
                  >
                    {contact.phone}
                  </a>
                </div>
              </div>

              {/* Fax */}
              <div className="flex items-start gap-3">
                <div className="mt-0.5 grid h-9 w-9 place-items-center rounded-xl bg-white/10 text-black">
                  {/* printer/fax icon */}
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M7 8V4h10v4"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M7 17h10v3H7v-3Z"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M6 16H5a2 2 0 0 1-2-2v-3a3 3 0 0 1 3-3h12a3 3 0 0 1 3 3v3a2 2 0 0 1-2 2h-1"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M18 12h.01"
                      stroke="currentColor"
                      strokeWidth="3"
                      strokeLinecap="round"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">
                    {tt("contact.fax", "Fax")}
                  </p>
                  <p className="text-sm text-black/75">{contact.fax}</p>
                </div>
              </div>
            </div>

            <hr className="my-6 border-white/10" />

            {/* Access block like your screenshot */}
            <div>
              <h2 className="text-lg font-bold text-black">
                {tt("contact.accessTitle", "Accès")}
              </h2>

              <div className="mt-5 space-y-5">
                <AccessRow
                  icon="tram"
                  title={tt("contact.publicTransportTitle", "Transports en commun")}
                  text={tt(
                    "contact.publicTransportText",
                    "Tram T2 / T3 — Arrêt Arenc Le Silo. Métro M2 — Station Désirée Clary."
                  )}
                />
                <AccessRow
                  icon="car"
                  title={tt("contact.carTitle", "Voiture")}
                  text={tt(
                    "contact.carText",
                    "Autoroute A55 — Sortie 2. Parking Indigo Quai du Lazaret à 200m."
                  )}
                />
                <AccessRow
                  icon="pin"
                  title={tt("contact.addressTitle", "Adresse")}
                  text={contact.addressLine}
                />
              </div>
            </div>
          </div>
        </section>

        {/* Right column: interactive map */}
        <section className="lg:col-span-2">
          <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 shadow-[0_18px_60px_-45px_rgba(0,0,0,0.9)] backdrop-blur">
            <div className="flex items-center justify-between gap-3 border-b border-white/10 px-5 py-4">
              <div>
                <p className="text-sm font-semibold text-black">
                  {tt("contact.mapTitle", "Carte")}
                </p>
                <p className="text-xs text-black/60">
                  {tt("contact.mapHint", "Zoomez, dézoomez, et perdez-vous (mais avec style).")}
                </p>
              </div>

              <a
                className="rounded-xl bg-white/10 px-3 py-2 text-xs font-semibold text-black hover:bg-white/15"
                href={`https://www.openstreetmap.org/?mlat=${contact.lat}&mlon=${contact.lng}#map=17/${contact.lat}/${contact.lng}`}
                target="_blank"
                rel="noreferrer"
              >
                {tt("contact.openInNewTab", "Ouvrir")}
              </a>
            </div>

            <div className="h-[420px] w-full">
              <MapContainer
                center={[contact.lat, contact.lng]}
                zoom={16}
                scrollWheelZoom
                style={{ height: "100%", width: "100%" }}
              >
                <TileLayer
                  attribution='&copy; OpenStreetMap contributors'
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />
                <Marker position={[contact.lat, contact.lng]} icon={markerIcon}>
                  <Popup>
                    <div className="text-sm">
                      <div className="font-semibold">MarsAI</div>
                      <div className="opacity-80">{contact.addressLine}</div>
                    </div>
                  </Popup>
                </Marker>
              </MapContainer>
            </div>
          </div>
        </section>
      </div>

      {/* ── Newsletter ── */}
      <section className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-6 shadow-[0_18px_60px_-45px_rgba(0,0,0,0.9)] backdrop-blur">
        <div className="flex flex-col md:flex-row md:items-center gap-6">
          <div className="flex-1">
            <h2 className="text-lg font-bold text-black">
              {tt("contactNewsletter.title", "Restez informé")}
            </h2>
            <p className="mt-1 text-sm text-black/70">
              {tt("contactNewsletter.text", "Inscrivez-vous à notre newsletter pour recevoir les actualités du festival, les annonces de sélection et les dates clés.")}
            </p>
          </div>
          <div className="flex-1">
            <NewsletterSubscribe />
          </div>
        </div>
      </section>
    </div>
  );
}

function AccessRow({ icon, title, text }) {
  return (
    <div className="flex items-start gap-4">
      <div className="mt-0.5 grid h-10 w-10 shrink-0 place-items-center rounded-2xl border border-white/10 bg-white/10 text-black">
        {icon === "tram" && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M7 4h10a3 3 0 0 1 3 3v8a4 4 0 0 1-4 4H8a4 4 0 0 1-4-4V7a3 3 0 0 1 3-3Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M8 19l-2 2M16 19l2 2"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M7 8h10"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M8.5 14h.01M15.5 14h.01"
              stroke="currentColor"
              strokeWidth="3"
              strokeLinecap="round"
            />
          </svg>
        )}

        {icon === "car" && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M3 16v-4l2.2-5.2A3 3 0 0 1 8 5h8a3 3 0 0 1 2.8 1.8L21 12v4"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M5 16h14"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinecap="round"
            />
            <path
              d="M7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3ZM17 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        )}

        {icon === "pin" && (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 21s7-5.2 7-11a7 7 0 1 0-14 0c0 5.8 7 11 7 11Z"
              stroke="currentColor"
              strokeWidth="1.8"
              strokeLinejoin="round"
            />
            <path
              d="M12 11.5a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z"
              stroke="currentColor"
              strokeWidth="1.8"
            />
          </svg>
        )}
      </div>

      <div>
        <p className="text-sm font-bold text-black">{title}</p>
        <p className="mt-1 text-sm text-black/70">{text}</p>
      </div>
    </div>
  );
}