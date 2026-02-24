import { useState, useRef, useEffect } from "react";
import Input from "./Input";
import CountrySelect from "./CountrySelect";
import COUNTRIES from "../constants/countries";
import successBg from "../images/fondsoumissionfilm.jpg";
import { submitFilm } from "../services/filmService";
import { useLanguage } from "../context/LanguageContext";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const NAME_REGEX = /^[\p{L}\s\-'.]+$/u;

const Stepper = ({ currentStep }) => {
  const steps = [1, 2, 3];
  return (
    <div className="flex items-center justify-center mb-8 md:mb-16 px-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all border-2 text-base md:text-lg ${currentStep === step ? "bg-[#463699] border-[#463699] text-white shadow-lg scale-110" : currentStep > step ? "bg-[#463699] border-[#463699] text-white opacity-50" : "bg-[#FBD5BD] border-[#FBD5BD] text-[#262335]"}`}>
            {step}
          </div>
          {index < steps.length - 1 && <div className={`w-12 md:w-24 h-[2px] mx-1 md:mx-2 ${currentStep > step ? "bg-[#463699]" : "bg-[#262335]/10"}`} />}
        </div>
      ))}
    </div>
  );
};

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
      <label className="text-lg md:text-xl font-bold text-[#262335] mb-3 ml-1">{label}</label>
      <div onClick={() => inputRef.current.click()} className={`relative overflow-hidden w-full ${ratioClass} border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer ${error ? "border-red-500 bg-red-50" : file ? "border-[#463699] bg-white" : "bg-white/40 border-[#262335]/20 hover:bg-white/60"}`}>
        <input type="file" ref={inputRef} className="hidden" accept={accept} onChange={(e) => { if (e.target.files?.[0]) setFile(e.target.files[0]); }} />
        {preview ? (
          <>
            {type === "video" ? <video src={preview} className="w-full h-full object-cover" /> : <img src={preview} alt="Preview" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold uppercase text-xs tracking-widest">{t("movieForm.changeFile")}</div>
          </>
        ) : (
          <div className="p-4 text-center">
            <p className="font-black text-[#262335] uppercase text-sm md:text-base">{t("movieForm.addFile", { label: label.toLowerCase() })}</p>
            <span className="text-[10px] opacity-60 mt-2 font-bold tracking-widest text-[#262335]">{accept.replace(/\./g, "").toUpperCase()}</span>
          </div>
        )}
      </div>
      {error && <span className="text-red-500 text-[10px] mt-1 ml-2 font-bold italic">{error}</span>}
    </div>
  );
};

export default function MovieForm({ onFinalSubmit }) {
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filmFile, setFilmFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);

  const [fields, setFields] = useState({
    title: "",
    titleEnglish: "",
    country: "",
    synopsis: "",
    synopsisEnglish: "",
    ai_tools: "",
    certify: false,
    fname: "",
    lname: "",
    email: "",
    bio: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");

  const setField = (name) => (e) => {
    const val = e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFields(prev => ({ ...prev, [name]: val }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
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
      // ⚡️ IMPORTANT : On mappe ici les champs vers ce que votre service attend
      const payload = {
        title: fields.title,
        title_en: fields.titleEnglish, // Ajout pour le futur
        country: fields.country,
        description: fields.synopsis, // Le service attend 'description'
        synopsis_en: fields.synopsisEnglish,
        ai_tools_used: fields.ai_tools, // Le service attend 'ai_tools_used'
        ai_certification: fields.certify ? 1 : 0,
        director_firstname: fields.fname,
        director_lastname: fields.lname,
        director_email: fields.email,
        director_bio: fields.bio,
        filmFile,
        posterFile,
        thumbnailFile: thumbFile,
      };

      await submitFilm(payload);
      
      if (typeof onFinalSubmit === "function") {
        onFinalSubmit({ payloadSent: payload });
      }
      
      setStep(3); // Affiche enfin la page de succès
    } catch (err) {
      setApiError(err.message || "Erreur de connexion");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (step === 3) return (
    <section className="w-full h-screen relative flex items-center justify-center bg-[#262335] px-4">
      <img src={successBg} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Success" />
      <div className="relative z-10 bg-[#262335]/80 backdrop-blur-2xl p-8 md:p-20 rounded-[40px] text-center shadow-2xl max-w-2xl w-full">
        <h2 className="text-3xl md:text-6xl font-black text-white mb-8 uppercase italic leading-none">{t("movieForm.successTitle1")} <br /> {t("movieForm.successTitle2")}</h2>
        <div className="w-20 h-20 md:w-24 md:h-24 bg-[#FBD5BD] rounded-full flex items-center justify-center text-[#262335] text-4xl animate-bounce mx-auto">✓</div>
        <button onClick={() => window.location.reload()} className="mt-10 text-white/50 underline hover:text-white transition-all">{t("movieForm.sendAnother")}</button>
      </div>
    </section>
  );

  return (
    <form onSubmit={handleFinalSubmit} className="w-full min-h-screen">
      {apiError && <div className="max-w-4xl mx-auto mt-4 p-4 bg-red-50 text-red-600 rounded-xl font-bold">{apiError}</div>}
      {step === 1 ? (
        <section className="w-full min-h-screen px-4 py-10 bg-[#8A83DA]" style={{ backgroundImage: `radial-gradient(ellipse at center, #FBD5BD 0%, rgba(138, 131, 218, 0.8) 100%, #8A83DA 50%)` }}>
          <div className="max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-[56px] font-black text-[#262335] text-center mb-8 uppercase italic">{t("movieForm.generalInfo")}</h2>
            <Stepper currentStep={1} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
              <div className="space-y-6">
                <Input label={t("movieForm.title")} value={fields.title} onChange={setField("title")} error={errors.title} />
                <Input label="Titre (Anglais)" value={fields.titleEnglish} onChange={setField("titleEnglish")} error={errors.titleEnglish} />
                <CountrySelect label={t("movieForm.country")} value={fields.country} onChange={setField("country")} error={errors.country} />
                <Input label="Synopsis" type="textarea" value={fields.synopsis} onChange={setField("synopsis")} error={errors.synopsis} />
                <Input label="Synopsis (Anglais)" type="textarea" value={fields.synopsisEnglish} onChange={setField("synopsisEnglish")} error={errors.synopsisEnglish} />
                <FileUploadZone label={t("movieForm.film")} accept=".mp4,.mov,.webm" file={filmFile} setFile={setFilmFile} error={errors.film} ratioClass="aspect-video" type="video" />
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <FileUploadZone label={t("movieForm.poster")} accept="image/*" file={posterFile} setFile={setPosterFile} error={errors.poster} ratioClass="aspect-[2/3]" type="image" />
                  <FileUploadZone label={t("movieForm.thumbnail")} accept="image/*" file={thumbFile} setFile={setThumbFile} error={errors.thumb} ratioClass="aspect-video" type="image" />
                </div>
                <Input label={t("movieForm.aiTools")} type="textarea" value={fields.ai_tools} onChange={setField("ai_tools")} error={errors.ai_tools} />
                <label className="flex items-start gap-4 cursor-pointer">
                  <input type="checkbox" checked={fields.certify} onChange={setField("certify")} className="mt-1 w-6 h-6 accent-[#463699]" />
                  <span className="text-sm italic text-[#262335]">{t("movieForm.certification")}</span>
                </label>
                <button type="button" onClick={() => validate(1) && setStep(2)} className="w-full bg-[#FBF5F0] text-[#262335] px-12 py-4 rounded-full font-black uppercase shadow-xl hover:scale-105 transition-all">{t("movieForm.next")}</button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="w-full min-h-screen bg-[#FBF5F0] px-4 py-10">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-[56px] font-black text-[#262335] mb-8 uppercase italic">{t("movieForm.director")}</h2>
            <Stepper currentStep={2} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-12">
              <Input label={t("movieForm.firstName")} value={fields.fname} onChange={setField("fname")} error={errors.fname} />
              <Input label={t("movieForm.lastName")} value={fields.lname} onChange={setField("lname")} error={errors.lname} />
              <Input label={t("movieForm.email")} type="email" value={fields.email} onChange={setField("email")} error={errors.email} />
              <Input label={t("movieForm.bio")} type="textarea" value={fields.bio} onChange={setField("bio")} error={errors.bio} />
            </div>
            <div className="flex gap-6 justify-center">
              <button type="button" onClick={() => setStep(1)} className="text-[#262335] underline font-bold uppercase">{t("movieForm.back")}</button>
              <button type="submit" disabled={loading} className="bg-[#262335] text-[#FBF5F0] px-16 py-6 rounded-full font-black uppercase shadow-2xl flex items-center gap-4">
                {loading && <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />}
                {loading ? "Envoi en cours..." : t("movieForm.submit")}
              </button>
            </div>
          </div>
        </section>
      )}
    </form>
  );
}