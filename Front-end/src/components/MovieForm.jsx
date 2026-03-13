import { useState, useRef, useEffect } from "react";
import Input from "./Input";
import CountrySelect from "./CountrySelect";
import COUNTRIES from "../constants/countries";
import successBg from "../images/fondsoumissionfilm.jpg";
import { submitFilm } from "../services/filmService";
import { useLanguage } from "../context/LanguageContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[\p{L}\s\-'.]+$/u;

/* ── Stepper ── */
const Stepper = ({ currentStep }) => {
  const steps = [
    { n: 1, label: "Film" },
    { n: 2, label: "Réalisateur" },
  ];
  return (
    <div className="flex items-center justify-center mb-12">
      {steps.map((s, idx) => (
        <div key={s.n} className="flex items-center">
          <div className="flex flex-col items-center gap-2">
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300
                ${currentStep === s.n
                  ? "bg-gradient-to-br from-[#C9A84C] to-[#E8C97A] border-[#C9A84C] text-[#0A0A0F] shadow-[0_0_20px_rgba(201,168,76,0.45)]"
                  : currentStep > s.n
                  ? "bg-[#C9A84C]/20 border-[#C9A84C]/60 text-[#C9A84C]"
                  : "bg-[#12121A] border-[#C9A84C]/20 text-[#C8C0B0]/50"}`}
            >
              {currentStep > s.n ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              ) : s.n}
            </div>
            <span className={`text-[9px] font-bold tracking-[0.2em] uppercase transition-colors ${currentStep === s.n ? "text-[#C9A84C]" : "text-[#C8C0B0]/40"}`}>
              {s.label}
            </span>
          </div>
          {idx < steps.length - 1 && (
            <div className={`w-28 md:w-40 h-px mx-4 mb-5 transition-all duration-500 ${currentStep > s.n ? "bg-gradient-to-r from-[#C9A84C]/60 to-[#C9A84C]/20" : "bg-[#C9A84C]/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

/* ── Section card wrapper ── */
const FormCard = ({ title, icon, children }) => (
  <div className="rounded-lg border border-[#C9A84C]/15 bg-[#12121A] overflow-hidden">
    <div className="flex items-center gap-3 px-6 py-4 border-b border-[#C9A84C]/10">
      <div className="w-7 h-7 rounded bg-[#C9A84C]/10 border border-[#C9A84C]/20 flex items-center justify-center text-[#C9A84C] flex-shrink-0">
        {icon}
      </div>
      <h3 className="text-[10px] font-bold tracking-[0.3em] uppercase text-[#C9A84C]">{title}</h3>
    </div>
    <div className="p-6">{children}</div>
  </div>
);

/* ── File Upload Zone ── */
const FileUploadZone = ({ label, accept, file, setFile, error, aspectClass, type, hint }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const { t } = useLanguage();

  useEffect(() => {
    if (!file) { setPreview(null); return; }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="flex flex-col w-full">
      <label className="text-[11px] font-bold mb-2.5 text-[#C8C0B0] tracking-[0.2em] uppercase">
        {label}
      </label>
      <div
        onClick={() => inputRef.current.click()}
        className={`relative overflow-hidden w-full ${aspectClass} rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all duration-200 cursor-pointer group
          ${error
            ? "border-[#8B1A2E]/60 bg-[#8B1A2E]/8"
            : file
            ? "border-[#C9A84C]/50 bg-[#C9A84C]/5"
            : "bg-[#0A0A0F] border-[#C9A84C]/20 hover:border-[#C9A84C]/50 hover:bg-[#C9A84C]/3"}`}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept={accept}
          onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }}
        />
        {preview ? (
          <>
            {type === "video"
              ? <video src={preview} className="w-full h-full object-cover" />
              : <img src={preview} alt="Preview" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-[#0A0A0F]/70 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2">
              <svg className="w-6 h-6 text-[#C9A84C]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L6.832 19.82a4.5 4.5 0 01-1.897 1.13l-2.685.8.8-2.685a4.5 4.5 0 011.13-1.897L16.863 4.487zm0 0L19.5 7.125" />
              </svg>
              <span className="text-[#C9A84C] font-bold text-[10px] tracking-[0.25em] uppercase">{t("movieForm.changeFile")}</span>
            </div>
          </>
        ) : (
          <div className="p-6 text-center flex flex-col items-center">
            <div className="w-12 h-12 border border-[#C9A84C]/25 rounded-full flex items-center justify-center mb-3 group-hover:border-[#C9A84C]/50 transition-colors">
              {type === "video" ? (
                <svg className="w-5 h-5 text-[#C9A84C]/50 group-hover:text-[#C9A84C]/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              ) : (
                <svg className="w-5 h-5 text-[#C9A84C]/50 group-hover:text-[#C9A84C]/80 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="m2.25 15.75 5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 0 0 1.5-1.5V6a1.5 1.5 0 0 0-1.5-1.5H3.75A1.5 1.5 0 0 0 2.25 6v12a1.5 1.5 0 0 0 1.5 1.5Zm10.5-11.25h.008v.008h-.008V8.25Zm.375 0a.375.375 0 1 1-.75 0 .375.375 0 0 1 .75 0Z" />
                </svg>
              )}
            </div>
            <p className="font-bold text-[#C8C0B0] text-[11px] uppercase tracking-[0.15em] mb-1">
              {label}
            </p>
            {hint && <p className="text-[10px] text-[#C8C0B0]/40 mb-1">{hint}</p>}
            <span className="text-[9px] text-[#C9A84C]/40 font-semibold tracking-widest">
              {accept.replace(/\./g, "").replace(/,/g, " · ").toUpperCase()}
            </span>
          </div>
        )}
      </div>
      {error && <span className="text-[#B02240] text-[10px] mt-1.5 font-semibold italic">{error}</span>}
    </div>
  );
};

/* ── MovieForm ── */
export default function MovieForm({ onFinalSubmit }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filmFile, setFilmFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);

  const [fields, setFields] = useState({
    title: "", titleEnglish: "", country: "", synopsis: "",
    synopsisEnglish: "", ai_tools: "", classification: "",
    certify: false, fname: "", lname: "", email: "", bio: "",
  });
  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const setField = (name) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFields(prev => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const selectClassification = (type) => {
    setFields(prev => ({ ...prev, classification: type }));
    if (errors.classification) setErrors(prev => ({ ...prev, classification: "" }));
  };

  const validate = (s) => {
    const err = {};
    if (s === 1) {
      if (!fields.title.trim()) err.title = t("movieForm.required");
      if (!fields.titleEnglish.trim()) err.titleEnglish = t("movieForm.required");
      if (!fields.country) err.country = t("movieForm.required");
      if (!fields.synopsis.trim()) err.synopsis = t("movieForm.required");
      if (!fields.synopsisEnglish.trim()) err.synopsisEnglish = t("movieForm.required");
      if (!fields.ai_tools.trim()) err.ai_tools = t("movieForm.required");
      if (!fields.classification) err.classification = "Veuillez choisir une catégorie";
      if (!filmFile) err.film = t("movieForm.videoMissing");
      if (!posterFile) err.poster = t("movieForm.posterMissing");
      if (!thumbFile) err.thumb = t("movieForm.thumbnailMissing");
      if (!fields.certify) err.certify = t("movieForm.certRequired");
    } else {
      if (!fields.fname.trim()) err.fname = t("movieForm.required");
      if (!fields.lname.trim()) err.lname = t("movieForm.required");
      if (!fields.email.trim()) err.email = t("movieForm.required");
      else if (!EMAIL_REGEX.test(fields.email)) err.email = t("movieForm.invalidEmail");
      if (!fields.bio.trim()) err.bio = t("movieForm.required");
    }
    setErrors(err);
    return Object.keys(err).length === 0;
  };

  const handleFinalSubmit = async (e) => {
    e.preventDefault();
    if (!validate(2)) return;
    setLoading(true);
    setApiError("");
    try {
      const payload = {
        title: fields.title, title_english: fields.titleEnglish,
        country: fields.country, description: fields.synopsis,
        description_english: fields.synopsisEnglish,
        ai_tools_used: fields.ai_tools, classification: fields.classification,
        ai_certification: fields.certify ? 1 : 0,
        director_firstname: fields.fname, director_lastname: fields.lname,
        director_email: fields.email, director_bio: fields.bio,
        filmFile, posterFile, thumbnailFile: thumbFile,
      };
      await submitFilm(payload);
      if (typeof onFinalSubmit === "function") onFinalSubmit({ payloadSent: payload });
      setStep(3);
    } catch (err) {
      setApiError(err.message || "Erreur de connexion");
    } finally {
      setLoading(false);
    }
  };

  /* ── Step 3 : Success ── */
  if (step === 3) return (
    <section className="w-full min-h-screen relative flex items-center justify-center bg-[#0A0A0F] px-4">
      <img src={successBg} className="absolute inset-0 w-full h-full object-cover opacity-20" alt="" />
      <div className="absolute inset-0 bg-[#0A0A0F]/70" />
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />
      <div className="relative z-10 border border-[#C9A84C]/20 bg-[#12121A]/90 backdrop-blur-md p-10 md:p-16 rounded-lg text-center max-w-xl w-full shadow-[0_0_60px_rgba(0,0,0,0.7)]">
        <div className="w-16 h-16 bg-gradient-to-br from-[#C9A84C] to-[#E8C97A] rounded-full flex items-center justify-center mx-auto mb-7 shadow-[0_0_24px_rgba(201,168,76,0.4)]">
          <svg className="w-7 h-7 text-[#0A0A0F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-[#C9A84C] mb-3">— Soumission reçue —</p>
        <h2 className="font-display text-3xl md:text-5xl font-bold text-white mb-4 leading-tight">
          {t("movieForm.successTitle1")}<br />
          <span className="text-gold-gradient">{t("movieForm.successTitle2")}</span>
        </h2>
        <div className="w-10 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto my-6" />
        <button
          onClick={() => window.location.reload()}
          className="text-[#C8C0B0]/60 hover:text-[#C9A84C] text-[12px] tracking-[0.15em] uppercase font-semibold transition-colors"
        >
          {t("movieForm.sendAnother")}
        </button>
      </div>
    </section>
  );

  return (
    <form onSubmit={handleFinalSubmit} className="w-full min-h-screen bg-[#0A0A0F]">
      {/* Gold top accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

      <div className="max-w-3xl mx-auto px-4 py-14">
        {/* Header */}
        <div className="text-center mb-12">
          <p className="text-[10px] font-semibold tracking-[0.45em] uppercase text-[#C9A84C] mb-3">
            — {step === 1 ? "Étape 1 · 2" : "Étape 2 · 2"} —
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-3">
            {step === 1 ? t("movieForm.generalInfo") : t("movieForm.director")}
          </h1>
          <div className="w-12 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto" />
        </div>

        <Stepper currentStep={step} />

        {/* API Error */}
        {apiError && (
          <div className="mb-6 p-4 bg-[#8B1A2E]/15 border border-[#8B1A2E]/40 rounded-lg text-[#E8607A] text-[13px]">
            {apiError}
          </div>
        )}

        {step === 1 ? (
          /* ── Step 1 : Film ── */
          <div className="space-y-5">

            {/* Identity */}
            <FormCard
              title="Identité du film"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3.375 19.5h17.25m-17.25 0a1.125 1.125 0 0 1-1.125-1.125M3.375 19.5h7.5c.621 0 1.125-.504 1.125-1.125m-9.75 0V5.625m0 12.75v-1.5c0-.621.504-1.125 1.125-1.125m18.375 2.625V5.625m0 12.75c0 .621-.504 1.125-1.125 1.125m1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125m0 3.75h-7.5A1.125 1.125 0 0 1 12 18.375m9.75-12.75c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125m19.5 0v1.5c0 .621-.504 1.125-1.125 1.125M2.25 5.625v1.5c0 .621.504 1.125 1.125 1.125m0 0h17.25m-17.25 0c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125" />
                </svg>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Input label={t("movieForm.title")} value={fields.title} onChange={setField("title")} error={errors.title} />
                <Input label="Titre (Anglais)" value={fields.titleEnglish} onChange={setField("titleEnglish")} error={errors.titleEnglish} />
              </div>
              <CountrySelect label={t("movieForm.country")} value={fields.country} onChange={setField("country")} error={errors.country} />
            </FormCard>

            {/* Synopsis */}
            <FormCard
              title="Synopsis"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input label="Synopsis (Français)" type="textarea" value={fields.synopsis} onChange={setField("synopsis")} error={errors.synopsis} />
                <Input label="Synopsis (Anglais)" type="textarea" value={fields.synopsisEnglish} onChange={setField("synopsisEnglish")} error={errors.synopsisEnglish} />
              </div>
            </FormCard>

            {/* Media files */}
            <FormCard
              title="Fichiers médias"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                </svg>
              }
            >
              {/* Film video — full width, tall */}
              <div className="mb-5">
                <FileUploadZone
                  label={t("movieForm.film")}
                  accept=".mp4,.mov,.webm"
                  file={filmFile}
                  setFile={setFilmFile}
                  error={errors.film}
                  aspectClass="aspect-video"
                  type="video"
                  hint="MP4 · MOV · WEBM recommandé"
                />
              </div>
              {/* Poster + Thumbnail side by side */}
              <div className="grid grid-cols-2 gap-4">
                <FileUploadZone
                  label={t("movieForm.poster")}
                  accept="image/*"
                  file={posterFile}
                  setFile={setPosterFile}
                  error={errors.poster}
                  aspectClass="aspect-[2/3]"
                  type="image"
                  hint="Format portrait 2:3"
                />
                <FileUploadZone
                  label={t("movieForm.thumbnail")}
                  accept="image/*"
                  file={thumbFile}
                  setFile={setThumbFile}
                  error={errors.thumb}
                  aspectClass="aspect-video"
                  type="image"
                  hint="Format paysage 16:9"
                />
              </div>
            </FormCard>

            {/* AI Tools */}
            <FormCard
              title="Outils IA utilisés"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 1-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                </svg>
              }
            >
              <Input
                label={t("movieForm.aiTools")}
                type="textarea"
                value={fields.ai_tools}
                onChange={setField("ai_tools")}
                error={errors.ai_tools}
              />
            </FormCard>

            {/* Classification */}
            <FormCard
              title="Classification de l'œuvre"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.568 3H5.25A2.25 2.25 0 0 0 3 5.25v4.318c0 .597.237 1.17.659 1.591l9.581 9.581c.699.699 1.78.872 2.607.33a18.095 18.095 0 0 0 5.223-5.223c.542-.827.369-1.908-.33-2.607L11.16 3.66A2.25 2.25 0 0 0 9.568 3Z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 6h.008v.008H6V6Z" />
                </svg>
              }
            >
              <p className="text-[11px] text-[#C8C0B0]/50 mb-4 leading-relaxed">
                Sélectionnez la catégorie qui correspond le mieux à votre production :
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {[
                  {
                    value: "100% IA",
                    label: "100% Intelligence Artificielle",
                    desc: "Génération intégrale par IA — aucune prise de vue réelle",
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3" />
                      </svg>
                    ),
                  },
                  {
                    value: "Hybride",
                    label: "Production Hybride",
                    desc: "Prises de vues réelles enrichies par des apports IA",
                    icon: (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6">
                        <path strokeLinecap="round" strokeLinejoin="round" d="m15.75 10.5 4.72-4.72a.75.75 0 0 1 1.28.53v11.38a.75.75 0 0 1-1.28.53l-4.72-4.72M4.5 18.75h9a2.25 2.25 0 0 0 2.25-2.25v-9a2.25 2.25 0 0 0-2.25-2.25h-9A2.25 2.25 0 0 0 2.25 7.5v9a2.25 2.25 0 0 0 2.25 2.25Z" />
                      </svg>
                    ),
                  },
                ].map(({ value, label, desc, icon }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => selectClassification(value)}
                    className={`flex items-start gap-4 p-5 rounded-lg border-2 text-left transition-all duration-200
                      ${fields.classification === value
                        ? "bg-[#C9A84C]/10 border-[#C9A84C] shadow-[0_0_16px_rgba(201,168,76,0.15)]"
                        : "bg-[#0A0A0F] border-[#C9A84C]/15 hover:border-[#C9A84C]/35"}`}
                  >
                    <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center transition-colors ${fields.classification === value ? "bg-[#C9A84C]/20 text-[#C9A84C]" : "bg-[#C9A84C]/8 text-[#C9A84C]/50"}`}>
                      {icon}
                    </div>
                    <div>
                      <p className={`font-bold text-[11px] tracking-[0.1em] uppercase mb-1 transition-colors ${fields.classification === value ? "text-[#C9A84C]" : "text-[#C8C0B0]"}`}>
                        {label}
                      </p>
                      <p className="text-[11px] text-[#C8C0B0]/50 leading-relaxed">{desc}</p>
                    </div>
                    {fields.classification === value && (
                      <svg className="w-4 h-4 text-[#C9A84C] flex-shrink-0 ml-auto mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z" clipRule="evenodd" />
                      </svg>
                    )}
                  </button>
                ))}
              </div>
              {errors.classification && (
                <span className="text-[#B02240] text-[10px] mt-3 block font-semibold italic">{errors.classification}</span>
              )}
            </FormCard>

            {/* Certification + Next */}
            <div className="rounded-lg border border-[#C9A84C]/15 bg-[#12121A] p-6">
              <label className={`flex items-start gap-4 cursor-pointer p-4 rounded-lg border transition-all duration-200 ${fields.certify ? "border-[#C9A84C]/40 bg-[#C9A84C]/5" : "border-[#C9A84C]/10 hover:border-[#C9A84C]/25"}`}>
                <div className={`w-5 h-5 mt-0.5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-all ${fields.certify ? "bg-[#C9A84C] border-[#C9A84C]" : "bg-transparent border-[#C9A84C]/30"}`}>
                  {fields.certify && (
                    <svg className="w-3 h-3 text-[#0A0A0F]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
                <input
                  type="checkbox"
                  checked={fields.certify}
                  onChange={setField("certify")}
                  className="hidden"
                />
                <span className="text-[13px] text-[#C8C0B0] leading-relaxed">{t("movieForm.certification")}</span>
              </label>
              {errors.certify && <span className="text-[#B02240] text-[10px] mt-2 block font-semibold italic">{errors.certify}</span>}

              <button
                type="button"
                onClick={() => validate(1) && setStep(2)}
                className="w-full mt-6 bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-[#0A0A0F] py-4 rounded-lg font-bold text-[12px] tracking-[0.25em] uppercase hover:shadow-[0_0_28px_rgba(201,168,76,0.4)] hover:scale-[1.01] transition-all duration-300 flex items-center justify-center gap-2"
              >
                {t("movieForm.next")}
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>

        ) : (
          /* ── Step 2 : Director ── */
          <div className="space-y-5">

            {/* Identity */}
            <FormCard
              title="Identité du réalisateur"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                </svg>
              }
            >
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                <Input label={t("movieForm.firstName")} value={fields.fname} onChange={setField("fname")} error={errors.fname} />
                <Input label={t("movieForm.lastName")} value={fields.lname} onChange={setField("lname")} error={errors.lname} />
              </div>
              <Input label={t("movieForm.email")} type="email" value={fields.email} onChange={setField("email")} error={errors.email} />
            </FormCard>

            {/* Bio */}
            <FormCard
              title="Biographie"
              icon={
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 0 0-3.375-3.375h-1.5A1.125 1.125 0 0 1 13.5 7.125v-1.5a3.375 3.375 0 0 0-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 0 0-9-9Z" />
                </svg>
              }
            >
              <Input label={t("movieForm.bio")} type="textarea" value={fields.bio} onChange={setField("bio")} error={errors.bio} />
            </FormCard>

            {/* Navigation */}
            <div className="flex items-center gap-4 pt-2">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="flex items-center gap-2 px-6 py-4 border border-[#C9A84C]/20 rounded-lg text-[#C8C0B0] text-[12px] font-bold tracking-[0.2em] uppercase hover:border-[#C9A84C]/50 hover:text-[#C9A84C] transition-all duration-200"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
                </svg>
                {t("movieForm.back")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-[#0A0A0F] py-4 rounded-lg font-bold text-[12px] tracking-[0.25em] uppercase hover:shadow-[0_0_28px_rgba(201,168,76,0.4)] hover:scale-[1.01] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed disabled:scale-100 flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    {t("movieForm.submit")}
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 12 3.269 3.125A59.769 59.769 0 0 1 21.485 12 59.768 59.768 0 0 1 3.27 20.875L5.999 12Zm0 0h7.5" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </form>
  );
}
