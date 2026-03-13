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
  const steps = [1, 2, 3];
  return (
    <div className="flex items-center justify-center mb-10 px-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div
            className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm border-2 transition-all duration-300
              ${currentStep === step
                ? "bg-gradient-to-br from-[#C9A84C] to-[#E8C97A] border-[#C9A84C] text-[#0A0A0F] scale-110 shadow-[0_0_16px_rgba(201,168,76,0.4)]"
                : currentStep > step
                ? "bg-[#C9A84C]/20 border-[#C9A84C]/50 text-[#C9A84C]"
                : "bg-[#12121A] border-[#C9A84C]/20 text-[#C8C0B0]"}`}
          >
            {currentStep > step ? (
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : step}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-16 md:w-24 h-px mx-2 transition-all duration-300 ${currentStep > step ? "bg-[#C9A84C]/50" : "bg-[#C9A84C]/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

/* ── File Upload Zone ── */
const FileUploadZone = ({ label, accept, file, setFile, error, ratioClass, type }) => {
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
      <label className="text-[11px] font-bold mb-2.5 text-[#C8C0B0] tracking-[0.2em] uppercase ml-1">
        {label}
      </label>
      <div
        onClick={() => inputRef.current.click()}
        className={`relative overflow-hidden w-full ${ratioClass} border-2 border-dashed rounded flex flex-col items-center justify-center transition-all duration-200 cursor-pointer
          ${error
            ? "border-[#8B1A2E]/60 bg-[#8B1A2E]/8"
            : file
            ? "border-[#C9A84C]/60 bg-[#C9A84C]/5"
            : "bg-[#12121A] border-[#C9A84C]/20 hover:border-[#C9A84C]/40 hover:bg-[#1E1E2E]"}`}
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
            <div className="absolute inset-0 bg-[#0A0A0F]/60 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-[#C9A84C] font-bold text-[10px] tracking-[0.25em] uppercase">
              {t("movieForm.changeFile")}
            </div>
          </>
        ) : (
          <div className="p-4 text-center">
            <div className="w-8 h-8 border border-[#C9A84C]/30 rounded flex items-center justify-center mx-auto mb-3">
              <svg className="w-4 h-4 text-[#C9A84C]/60" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
              </svg>
            </div>
            <p className="font-bold text-[#C8C0B0] text-[11px] uppercase tracking-[0.15em]">
              {t("movieForm.addFile", { label: label.toLowerCase() })}
            </p>
            <span className="text-[9px] text-[#C8C0B0]/40 mt-1.5 block font-semibold tracking-widest">
              {accept.replace(/\./g, "").toUpperCase()}
            </span>
          </div>
        )}
      </div>
      {error && <span className="text-[#B02240] text-[10px] mt-1.5 ml-1 font-semibold italic">{error}</span>}
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

        <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-[#C9A84C] mb-3">
          — Soumission reçue —
        </p>
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
      {/* API Error */}
      {apiError && (
        <div className="max-w-4xl mx-auto mt-4 px-4">
          <div className="p-4 bg-[#8B1A2E]/15 border border-[#8B1A2E]/40 rounded text-[#E8607A] text-[13px]">
            {apiError}
          </div>
        </div>
      )}

      {/* Gold top accent */}
      <div className="h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent" />

      {step === 1 ? (
        /* ── Step 1 : Film ── */
        <section className="w-full min-h-screen px-4 py-12 bg-[#0A0A0F]">
          <div className="max-w-6xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-[#C9A84C] mb-3">
                — Étape 1 / 2 —
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white">
                {t("movieForm.generalInfo")}
              </h2>
              <div className="mt-4 w-14 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto" />
            </div>

            <Stepper currentStep={1} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 md:gap-16">
              {/* Left column */}
              <div className="space-y-5">
                <Input label={t("movieForm.title")} value={fields.title} onChange={setField("title")} error={errors.title} />
                <Input label="Titre (Anglais)" value={fields.titleEnglish} onChange={setField("titleEnglish")} error={errors.titleEnglish} />
                <CountrySelect label={t("movieForm.country")} value={fields.country} onChange={setField("country")} error={errors.country} />
                <Input label="Synopsis" type="textarea" value={fields.synopsis} onChange={setField("synopsis")} error={errors.synopsis} />
                <Input label="Synopsis (Anglais)" type="textarea" value={fields.synopsisEnglish} onChange={setField("synopsisEnglish")} error={errors.synopsisEnglish} />
                <FileUploadZone label={t("movieForm.film")} accept=".mp4,.mov,.webm" file={filmFile} setFile={setFilmFile} error={errors.film} ratioClass="aspect-video" type="video" />
              </div>

              {/* Right column */}
              <div className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <FileUploadZone label={t("movieForm.poster")} accept="image/*" file={posterFile} setFile={setPosterFile} error={errors.poster} ratioClass="aspect-[2/3]" type="image" />
                  <FileUploadZone label={t("movieForm.thumbnail")} accept="image/*" file={thumbFile} setFile={setThumbFile} error={errors.thumb} ratioClass="aspect-video" type="image" />
                </div>

                <Input label={t("movieForm.aiTools")} type="textarea" value={fields.ai_tools} onChange={setField("ai_tools")} error={errors.ai_tools} />

                {/* Classification */}
                <div className="space-y-3 pt-2">
                  <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-[#C8C0B0] ml-1">
                    Classification de l'œuvre * — choix exclusif :
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { value: "100% IA",  label: "Génération intégrale (100% IA)" },
                      { value: "Hybride",  label: "Production hybride (Prises de vues réelles + Apports IA)" },
                    ].map(({ value, label }) => (
                      <button
                        key={value}
                        type="button"
                        onClick={() => selectClassification(value)}
                        className={`py-4 px-4 rounded border-2 font-bold text-[10px] tracking-[0.1em] uppercase transition-all duration-200 text-left
                          ${fields.classification === value
                            ? "bg-[#C9A84C]/15 border-[#C9A84C] text-[#C9A84C] shadow-[0_0_12px_rgba(201,168,76,0.2)]"
                            : "bg-[#12121A] border-[#C9A84C]/20 text-[#C8C0B0] hover:border-[#C9A84C]/40 hover:text-[#C9A84C]"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {errors.classification && <span className="text-[#B02240] text-[10px] font-semibold italic ml-1">{errors.classification}</span>}
                </div>

                {/* Certification */}
                <label className="flex items-start gap-3 cursor-pointer pt-1">
                  <input
                    type="checkbox"
                    checked={fields.certify}
                    onChange={setField("certify")}
                    className="mt-0.5 w-5 h-5 rounded border-2 border-[#C9A84C]/30 bg-[#12121A] accent-[#C9A84C] cursor-pointer"
                  />
                  <span className="text-[13px] text-[#C8C0B0] leading-relaxed">{t("movieForm.certification")}</span>
                </label>
                {errors.certify && <span className="text-[#B02240] text-[10px] font-semibold italic ml-1">{errors.certify}</span>}

                {/* Next button */}
                <button
                  type="button"
                  onClick={() => validate(1) && setStep(2)}
                  className="w-full bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-[#0A0A0F] py-4 rounded font-bold text-[12px] tracking-[0.2em] uppercase hover:shadow-[0_0_24px_rgba(201,168,76,0.4)] hover:scale-[1.01] transition-all duration-300 mt-2"
                >
                  {t("movieForm.next")} →
                </button>
              </div>
            </div>
          </div>
        </section>

      ) : (
        /* ── Step 2 : Director ── */
        <section className="w-full min-h-screen px-4 py-12 bg-[#0A0A0F]">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-10">
              <p className="text-[10px] font-semibold tracking-[0.4em] uppercase text-[#C9A84C] mb-3">
                — Étape 2 / 2 —
              </p>
              <h2 className="font-display text-3xl md:text-5xl font-bold text-white">
                {t("movieForm.director")}
              </h2>
              <div className="mt-4 w-14 h-px bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent mx-auto" />
            </div>

            <Stepper currentStep={2} />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-10">
              <Input label={t("movieForm.firstName")} value={fields.fname} onChange={setField("fname")} error={errors.fname} />
              <Input label={t("movieForm.lastName")} value={fields.lname} onChange={setField("lname")} error={errors.lname} />
              <Input label={t("movieForm.email")} type="email" value={fields.email} onChange={setField("email")} error={errors.email} />
              <Input label={t("movieForm.bio")} type="textarea" value={fields.bio} onChange={setField("bio")} error={errors.bio} />
            </div>

            <div className="flex items-center justify-center gap-6">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[#C8C0B0]/60 hover:text-[#C9A84C] text-[12px] font-bold tracking-[0.2em] uppercase transition-colors border-b border-transparent hover:border-[#C9A84C]/40"
              >
                ← {t("movieForm.back")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-14 py-4 bg-gradient-to-r from-[#C9A84C] to-[#E8C97A] text-[#0A0A0F] rounded font-bold text-[12px] tracking-[0.2em] uppercase hover:shadow-[0_0_24px_rgba(201,168,76,0.4)] hover:scale-[1.01] transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-3"
              >
                {loading && <span className="w-4 h-4 border-2 border-[#0A0A0F]/30 border-t-[#0A0A0F] rounded-full animate-spin" />}
                {loading ? "Envoi en cours..." : t("movieForm.submit")}
              </button>
            </div>
          </div>
        </section>
      )}
    </form>
  );
}
