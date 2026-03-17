import { useMemo } from "react";
import { useLanguage } from "../context/LanguageContext";
import NewsletterSubscribe from "../components/NewsletterSubscribe";

import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

const markerIcon = new L.Icon({
  iconRetinaUrl: new URL("leaflet/dist/images/marker-icon-2x.png", import.meta.url).toString(),
  iconUrl:       new URL("leaflet/dist/images/marker-icon.png", import.meta.url).toString(),
  shadowUrl:     new URL("leaflet/dist/images/marker-shadow.png", import.meta.url).toString(),
  iconSize:  [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

export default function Contact() {
  const { t } = useLanguage();

  const contact = useMemo(() => ({
    email:       "contact@marsai-festival.com",
    phone:       "+33 4 91 00 00 00",
    fax:         "+33 4 91 00 00 01",
    addressLine: "12 Rue D'Uzes, 13002 Marseille (Entrée principale)",
    lat: 43.3086,
    lng: 5.3679,
  }), []);

  const tt = (key, fallback) => { const v = t(key); return v && v !== key ? v : fallback; };

  return (
    <div className="bg-[#0A0A0F] min-h-screen">
      {/* Gold top accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

      <div className="mx-auto w-full max-w-6xl px-4 py-14">
        {/* Header */}
        <div className="mb-12">
          <p className="text-[10px] font-semibold tracking-[0.45em] uppercase text-[#C9A84C] mb-3">
            — Nous contacter —
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-black text-white mb-3">
            {tt("pages.contact", "Contact")}
          </h1>
          <div className="w-12 h-px bg-gradient-to-r from-[#C9A84C] to-transparent mb-4" />
          <p className="text-[#C8C0B0] text-[14px] max-w-xl leading-relaxed">
            {tt("contact.subtitle", "Une question ? Un bug ? Une IA qui a décidé de prendre des vacances ? On est joignables.")}
          </p>
        </div>

        <div className="grid gap-5 lg:grid-cols-3">
          {/* ── Left: infos + accès ── */}
          <section className="lg:col-span-1 space-y-5">
            {/* Contact info */}
            <div className="rounded border border-[#C9A84C]/15 bg-[#12121A] p-6">
              <h2 className="text-[10px] font-bold tracking-[0.35em] uppercase text-[#C9A84C] mb-5">
                {tt("contact.infoTitle", "Informations")}
              </h2>

              <div className="space-y-5">
                {[
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M4 7.5a3 3 0 013-3h10a3 3 0 013 3v9a3 3 0 01-3 3H7a3 3 0 01-3-3v-9Z" stroke="currentColor" strokeWidth="1.8"/>
                        <path d="M6.5 8.3 12 12.5l5.5-4.2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    ),
                    label: tt("contact.email", "Email"),
                    content: <a href={`mailto:${contact.email}`} className="text-[13px] text-[#C9A84C] hover:text-[#E8C97A] transition-colors">{contact.email}</a>,
                  },
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M7 4.5h3l1 4-2 1.5c1.4 2.8 3.7 5.1 6.5 6.5L17 14.5l4 1v3c0 1.1-.9 2-2 2-8.8 0-16-7.2-16-16 0-1.1.9-2 2-2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                      </svg>
                    ),
                    label: tt("contact.phone", "Téléphone"),
                    content: <a href={`tel:${contact.phone.replace(/\s/g, "")}`} className="text-[13px] text-[#C8C0B0] hover:text-[#C9A84C] transition-colors">{contact.phone}</a>,
                  },
                  {
                    icon: (
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                        <path d="M7 8V4h10v4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                        <path d="M7 17h10v3H7v-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                        <path d="M6 16H5a2 2 0 01-2-2v-3a3 3 0 013-3h12a3 3 0 013 3v3a2 2 0 01-2 2h-1" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
                        <path d="M18 12h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                      </svg>
                    ),
                    label: tt("contact.fax", "Fax"),
                    content: <span className="text-[13px] text-[#C8C0B0]">{contact.fax}</span>,
                  },
                ].map(({ icon, label, content }) => (
                  <div key={label} className="flex items-start gap-3">
                    <div className="mt-0.5 w-8 h-8 rounded flex-shrink-0 bg-[#C9A84C]/10 border border-[#C9A84C]/20 grid place-items-center text-[#C9A84C]">
                      {icon}
                    </div>
                    <div>
                      <p className="text-[11px] font-bold tracking-[0.15em] uppercase text-[#C8C0B0]/60 mb-0.5">{label}</p>
                      {content}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Access info */}
            <div className="rounded border border-[#C9A84C]/15 bg-[#12121A] p-6">
              <h2 className="text-[10px] font-bold tracking-[0.35em] uppercase text-[#C9A84C] mb-5">
                {tt("contact.accessTitle", "Accès")}
              </h2>

              <div className="space-y-5">
                <AccessRow
                  icon="tram"
                  title={tt("contact.publicTransportTitle", "Transports en commun")}
                  text={tt("contact.publicTransportText", "Tram T2 / T3 — Arrêt Arenc Le Silo. Métro M2 — Station Désirée Clary.")}
                />
                <AccessRow
                  icon="car"
                  title={tt("contact.carTitle", "Voiture")}
                  text={tt("contact.carText", "Autoroute A55 — Sortie 2. Parking Indigo Quai du Lazaret à 200m.")}
                />
                <AccessRow
                  icon="pin"
                  title={tt("contact.addressTitle", "Adresse")}
                  text={contact.addressLine}
                />
              </div>
            </div>
          </section>

          {/* ── Right: map ── */}
          <section className="lg:col-span-2">
            <div className="rounded border border-[#C9A84C]/15 bg-[#12121A] overflow-hidden h-full flex flex-col">
              <div className="flex items-center justify-between gap-3 border-b border-[#C9A84C]/12 px-5 py-4">
                <div>
                  <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C9A84C]">
                    {tt("contact.mapTitle", "Carte")}
                  </p>
                  <p className="text-[12px] text-[#C8C0B0]/50 mt-0.5">
                    {tt("contact.mapHint", "Zoomez, dézoomez, et perdez-vous (mais avec style).")}
                  </p>
                </div>
                <a
                  className="px-3 py-1.5 border border-[#C9A84C]/30 text-[#C9A84C] text-[11px] font-bold tracking-[0.15em] uppercase rounded hover:border-[#C9A84C] hover:bg-[#C9A84C]/8 transition-all"
                  href={`https://www.openstreetmap.org/?mlat=${contact.lat}&mlon=${contact.lng}#map=17/${contact.lat}/${contact.lng}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  {tt("contact.openInNewTab", "Ouvrir")}
                </a>
              </div>

              <div className="flex-1 min-h-[380px]">
                <MapContainer
                  center={[contact.lat, contact.lng]}
                  zoom={16}
                  scrollWheelZoom
                  style={{ height: "100%", width: "100%", minHeight: 380 }}
                >
                  <TileLayer
                    attribution='&copy; OpenStreetMap contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  />
                  <Marker position={[contact.lat, contact.lng]} icon={markerIcon}>
                    <Popup>
                      <div className="text-sm">
                        <div className="font-semibold">MarsAI Festival</div>
                        <div className="opacity-70">{contact.addressLine}</div>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>
            </div>
          </section>
        </div>

        {/* ── Newsletter ── */}
        <section className="mt-5 rounded border border-[#C9A84C]/15 bg-[#12121A] p-6 md:p-8">
          <div className="flex flex-col md:flex-row md:items-center gap-8">
            <div className="flex-1">
              <p className="text-[10px] font-bold tracking-[0.35em] uppercase text-[#C9A84C] mb-2">
                — Newsletter —
              </p>
              <h2 className="font-display text-xl font-bold text-white mb-1">
                {tt("contactNewsletter.title", "Restez informé")}
              </h2>
              <p className="text-[13px] text-[#C8C0B0]/70 leading-relaxed max-w-sm">
                {tt("contactNewsletter.text", "Inscrivez-vous pour recevoir les actualités du festival, les annonces de sélection et les dates clés.")}
              </p>
            </div>
            <div className="flex-1">
              <NewsletterSubscribe />
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}

function AccessRow({ icon, title, text }) {
  const iconMap = {
    tram: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M7 4h10a3 3 0 013 3v8a4 4 0 01-4 4H8a4 4 0 01-4-4V7a3 3 0 013-3Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M8 19l-2 2M16 19l2 2" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M7 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M8.5 14h.01M15.5 14h.01" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
      </svg>
    ),
    car: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M3 16v-4l2.2-5.2A3 3 0 018 5h8a3 3 0 012.8 1.8L21 12v4" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M5 16h14" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"/>
        <path d="M7 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3ZM17 19a1.5 1.5 0 100-3 1.5 1.5 0 000 3Z" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
    pin: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
        <path d="M12 21s7-5.2 7-11a7 7 0 10-14 0c0 5.8 7 11 7 11Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round"/>
        <path d="M12 11.5a2 2 0 100-4 2 2 0 000 4Z" stroke="currentColor" strokeWidth="1.8"/>
      </svg>
    ),
  };

  return (
    <div className="flex items-start gap-3">
      <div className="mt-0.5 w-8 h-8 rounded flex-shrink-0 bg-[#C9A84C]/10 border border-[#C9A84C]/20 grid place-items-center text-[#C9A84C]">
        {iconMap[icon]}
      </div>
      <div>
        <p className="text-[12px] font-bold text-white mb-0.5">{title}</p>
        <p className="text-[12px] text-[#C8C0B0]/60 leading-relaxed">{text}</p>
      </div>
    </div>
  );
}
