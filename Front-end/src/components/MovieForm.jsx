import { useState, useRef, useEffect } from "react";
import Input from "./Input";
import successBg from "../images/fondsoumissionfilm.jpg";

const Stepper = ({ currentStep }) => {
  const steps = [1, 2, 3];
  return (
    <div className="flex items-center justify-center mb-8 md:mb-16 px-2">
      {steps.map((step, index) => (
        <div key={step} className="flex items-center">
          <div className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all border-2 text-base md:text-lg ${
            currentStep === step 
            ? "bg-[#463699] border-[#463699] text-white shadow-lg scale-110" 
            : currentStep > step ? "bg-[#463699] border-[#463699] text-white opacity-50" : "bg-[#FBD5BD] border-[#FBD5BD] text-[#262335]"
          }`}>
            {step}
          </div>
          {index < steps.length - 1 && (
            <div className={`w-12 md:w-24 h-[2px] mx-1 md:mx-2 ${currentStep > step ? "bg-[#463699]" : "bg-[#262335]/10"}`} />
          )}
        </div>
      ))}
    </div>
  );
};

const FileUploadZone = ({ label, accept, file, setFile, error, ratioClass, type }) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);

  useEffect(() => {
    if (!file) {
      setPreview(null);
      return;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file]);

  return (
    <div className="flex flex-col w-full">
      <label className="text-lg md:text-xl font-bold text-[#262335] mb-3 ml-1">{label}</label>
      <div 
        onClick={() => inputRef.current.click()} 
        className={`relative overflow-hidden w-full ${ratioClass} border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer
        ${error ? 'border-red-500 bg-red-50' : file ? 'border-[#463699] bg-white' : 'bg-white/40 border-[#262335]/20 hover:bg-white/60'}`}
      >
        <input type="file" ref={inputRef} className="hidden" accept={accept} onChange={(e) => { if(e.target.files[0]) setFile(e.target.files[0]); }} />
        {preview ? (
          <>
            {type === 'video' ? <video src={preview} className="w-full h-full object-cover" /> : <img src={preview} alt="Preview" className="w-full h-full object-cover" />}
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold uppercase text-xs tracking-widest">Modifier le fichier</div>
          </>
        ) : (
          <div className="p-4 text-center">
            <p className="font-black text-[#262335] uppercase text-sm md:text-base">Ajouter {label.toLowerCase()}</p>
            <span className="text-[10px] opacity-60 mt-2 font-bold tracking-widest text-[#262335]">{accept.replace(/\./g, '').toUpperCase()}</span>
          </div>
        )}
      </div>
      {error && <span className="text-red-500 text-[10px] mt-1 ml-2 font-bold italic">{error}</span>}
    </div>
  );
};

export default function MovieForm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [filmFile, setFilmFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [thumbFile, setThumbFile] = useState(null);
  const [errors, setErrors] = useState({});
  const formRef = useRef(null);

  const validateSection = (sectionNumber) => {
    const newErrors = {};
    const formData = new FormData(formRef.current);
    if (sectionNumber === 1) {
      ["title", "country", "description", "ai_tools"].forEach(f => { if (!formData.get(f)?.trim()) newErrors[f] = "Champ obligatoire"; });
      if (!filmFile) newErrors.film = "Vidéo manquante";
      if (!posterFile) newErrors.poster = "Poster manquant";
      if (!thumbFile) newErrors.thumb = "Miniature manquante";
      if (!formData.get("certify")) newErrors.certify = "Obligatoire";
    } else {
      ["fname", "lname", "email", "bio"].forEach(f => { if (!formData.get(f)?.trim()) newErrors[f] = "Champ obligatoire"; });
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  if (step === 3) return (
    <section className="w-full h-screen relative flex items-center justify-center bg-[#262335] px-4 overflow-hidden">
      <img src={successBg} className="absolute inset-0 w-full h-full object-cover opacity-30" alt="Success" />
      <div className="relative z-10 bg-[#262335]/80 backdrop-blur-2xl p-8 md:p-20 rounded-[40px] text-center shadow-2xl max-w-2xl w-full">
        <h2 className="text-3xl md:text-6xl font-black text-white mb-8 uppercase italic leading-none">Film soumis <br/> avec succès !</h2>
        <div className="w-20 h-20 md:w-24 md:h-24 bg-[#FBD5BD] rounded-full flex items-center justify-center text-[#262335] text-4xl animate-bounce mx-auto">✓</div>
        <button onClick={() => window.location.reload()} className="mt-10 text-white/50 underline hover:text-white transition-all">Envoyer un autre film</button>
      </div>
    </section>
  );

  return (
    <form ref={formRef} onSubmit={(e) => { e.preventDefault(); if(validateSection(2)) { setLoading(true); setTimeout(() => setStep(3), 2000); } }} className="w-full min-h-screen overflow-x-hidden">
      {step === 1 ? (
        <section className="w-full min-h-screen flex items-center justify-center px-4 py-10 md:py-20 bg-[#8A83DA]" style={{ backgroundImage: `radial-gradient(ellipse at center, #FBD5BD 0%, rgba(138, 131, 218, 0.8) 100%, #8A83DA 50%)` }}>
          <div className="w-full max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-[56px] font-black text-[#262335] text-center mb-8 uppercase italic">Informations Générales</h2>
            <Stepper currentStep={1} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
              <div className="space-y-6">
                <Input label="Titre" name="title" error={errors.title} />
                <Input label="Pays" name="country" error={errors.country} />
                <Input label="Description" name="description" type="textarea" error={errors.description} />
                <FileUploadZone label="Film" accept=".mp4,.mov,.webm" file={filmFile} setFile={setFilmFile} error={errors.film} ratioClass="aspect-video md:aspect-[2/1]" type="video" />
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FileUploadZone label="Poster" accept=".jpg,.png,.webp" file={posterFile} setFile={setPosterFile} error={errors.poster} ratioClass="aspect-[2/3]" type="image" />
                  <FileUploadZone label="Miniature" accept=".jpg,.png,.webp" file={thumbFile} setFile={setThumbFile} error={errors.thumb} ratioClass="aspect-video" type="image" />
                </div>
                <Input label="Outils IA utilisés :" name="ai_tools" type="textarea" error={errors.ai_tools} />
                <label className={`flex items-start gap-4 cursor-pointer p-4 rounded-2xl transition-all ${errors.certify ? "bg-red-50 border border-red-200" : ""}`}>
                  <input type="checkbox" name="certify" className="mt-1 w-6 h-6 accent-[#463699]" />
                  <span className="text-sm italic text-[#262335]">Je certifie que ce film respecte les règles du festival.</span>
                </label>
                <button type="button" onClick={() => { if(validateSection(1)) { setStep(2); window.scrollTo(0,0); } }} className="w-full md:w-auto bg-[#FBF5F0] text-[#262335] px-12 py-4 rounded-full font-black uppercase shadow-xl hover:scale-105 transition-all self-end">Suivant →</button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="w-full min-h-screen bg-[#FBF5F0] flex items-center justify-center px-4 py-10 md:py-20">
          <div className="w-full max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-[56px] font-black text-[#262335] mb-8 uppercase italic">Réalisateur</h2>
            <Stepper currentStep={2} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-12">
              <Input label="Prénom" name="fname" error={errors.fname} />
              <Input label="Nom" name="lname" error={errors.lname} />
              <Input label="Email" name="email" type="email" error={errors.email} />
              <Input label="Bio" name="bio" type="textarea" error={errors.bio} />
            </div>
            <div className="flex flex-col-reverse md:flex-row gap-6 justify-center items-center">
              <button type="button" onClick={() => setStep(1)} className="text-[#262335] underline font-bold uppercase">Retour</button>
              <button type="submit" disabled={loading} className="w-full md:w-auto bg-[#262335] text-[#FBF5F0] px-16 py-6 rounded-full font-black uppercase shadow-2xl flex items-center justify-center gap-4">
                {loading && <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />}
                {loading ? "Chargement..." : "Soumettre le film"}
              </button>
            </div>
          </div>
        </section>
      )}
    </form>
  );
}