import { useState, useRef, useEffect } from "react";
import Input from "./Input";
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
          <div
            className={`w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center font-bold transition-all border-2 text-base md:text-lg ${
              currentStep === step
                ? "bg-[#463699] border-[#463699] text-white shadow-lg scale-110"
                : currentStep > step
                ? "bg-[#463699] border-[#463699] text-white opacity-50"
                : "bg-[#FBD5BD] border-[#FBD5BD] text-[#262335]"
            }`}
          >
            {step}
          </div>
          {index < steps.length - 1 && (
            <div
              className={`w-12 md:w-24 h-[2px] mx-1 md:mx-2 ${
                currentStep > step ? "bg-[#463699]" : "bg-[#262335]/10"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
};

const FileUploadZone = ({
  label,
  accept,
  file,
  setFile,
  error,
  ratioClass,
  type,
}) => {
  const inputRef = useRef(null);
  const [preview, setPreview] = useState(null);
  const { t } = useLanguage();

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
      <label className="text-lg md:text-xl font-bold text-[#262335] mb-3 ml-1">
        {label}
      </label>
      <div
        onClick={() => inputRef.current.click()}
        className={`relative overflow-hidden w-full ${ratioClass} border-2 border-dashed rounded-3xl flex flex-col items-center justify-center transition-all cursor-pointer
        ${
          error
            ? "border-red-500 bg-red-50"
            : file
            ? "border-[#463699] bg-white"
            : "bg-white/40 border-[#262335]/20 hover:bg-white/60"
        }`}
      >
        <input
          type="file"
          ref={inputRef}
          className="hidden"
          accept={accept}
          onChange={(e) => {
            if (e.target.files?.[0]) setFile(e.target.files[0]);
          }}
        />
        {preview ? (
          <>
            {type === "video" ? (
              <video src={preview} className="w-full h-full object-cover" />
            ) : (
              <img
                src={preview}
                alt="Preview"
                className="w-full h-full object-cover"
              />
            )}
            <div className="absolute inset-0 bg-black/40 opacity-0 hover:opacity-100 transition-opacity flex items-center justify-center text-white font-bold uppercase text-xs tracking-widest">
              {t("movieForm.changeFile")}
            </div>
          </>
        ) : (
          <div className="p-4 text-center">
            <p className="font-black text-[#262335] uppercase text-sm md:text-base">
              {t("movieForm.addFile", { label: label.toLowerCase() })}
            </p>
            <span className="text-[10px] opacity-60 mt-2 font-bold tracking-widest text-[#262335]">
              {accept.replace(/\./g, "").toUpperCase()}
            </span>
          </div>
        )}
      </div>
      {error && (
        <span className="text-red-500 text-[10px] mt-1 ml-2 font-bold italic">
          {error}
        </span>
      )}
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
    country: "",
    description: "",
    ai_tools: "",
    certify: false,
    fname: "",
    lname: "",
    email: "",
    bio: "",
  });

  const [errors, setErrors] = useState({});
  const [apiError, setApiError] = useState("");
  const [apiHint, setApiHint] = useState("");

  const formRef = useRef(null);

  const setField = (name) => (valueOrEvent) => {
    const value =
      valueOrEvent && valueOrEvent.target
        ? valueOrEvent.target.type === "checkbox"
          ? valueOrEvent.target.checked
          : valueOrEvent.target.value
        : valueOrEvent;

    setFields((prev) => ({ ...prev, [name]: value }));
  };

  const getFieldValue = (name) => {
    const fromState = fields[name];
    if (typeof fromState === "string" && fromState.trim() !== "") return fromState;
    if (typeof fromState === "boolean") return fromState;

    const el =
      formRef.current?.querySelector(`[name="${name}"]`) ||
      formRef.current?.elements?.namedItem?.(name);

    return el?.value ?? "";
  };

  const validateSection = (sectionNumber) => {
    const newErrors = {};

    if (sectionNumber === 1) {
      const title = getFieldValue("title");
      const country = getFieldValue("country");
      const description = getFieldValue("description");
      const aiTools = getFieldValue("ai_tools");

      if (!title?.trim()) newErrors.title = t("movieForm.required");

      if (!country?.trim()) newErrors.country = t("movieForm.required");
      else if (!COUNTRIES.includes(country.trim()))
        newErrors.country = t("movieForm.invalidCountry");

      if (!description?.trim()) newErrors.description = t("movieForm.required");
      if (!aiTools?.trim()) newErrors.ai_tools = t("movieForm.required");

      if (!filmFile) newErrors.film = t("movieForm.videoMissing");
      if (!posterFile) newErrors.poster = t("movieForm.posterMissing");
      if (!thumbFile) newErrors.thumb = t("movieForm.thumbnailMissing");
      if (!fields.certify) newErrors.certify = t("movieForm.certRequired");
    } else {
      const fname = getFieldValue("fname");
      const lname = getFieldValue("lname");
      const email = getFieldValue("email");
      const bio = getFieldValue("bio");

      if (!fname?.trim()) newErrors.fname = t("movieForm.required");
      else if (!NAME_REGEX.test(fname.trim()))
        newErrors.fname = t("movieForm.invalidChars");

      if (!lname?.trim()) newErrors.lname = t("movieForm.required");
      else if (!NAME_REGEX.test(lname.trim()))
        newErrors.lname = t("movieForm.invalidChars");

      if (!email?.trim()) newErrors.email = t("movieForm.required");
      else if (!EMAIL_REGEX.test(email.trim()))
        newErrors.email = t("movieForm.invalidEmail");

      if (!bio?.trim()) newErrors.bio = t("movieForm.required");
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const mapApiError = (err) => {
    const status = err?.status;
    const raw = (err?.message || "").toLowerCase();

    const fieldErrors = {};
    if (raw.includes("poster too large")) fieldErrors.poster = t("movieForm.posterTooLarge");
    else if (raw.includes("thumbnail too large")) fieldErrors.thumb = t("movieForm.thumbnailTooLarge");
    else if (raw.includes("film too large") || raw.includes("file too large"))
      fieldErrors.film = t("movieForm.videoTooLarge");
    else if (raw.includes("invalid image type"))
      fieldErrors.poster = t("movieForm.invalidImageType");
    else if (raw.includes("invalid video type"))
      fieldErrors.film = t("movieForm.invalidVideoType");
    else if (raw.includes("poster and film files are required")) {
      fieldErrors.poster = t("movieForm.posterMissing");
      fieldErrors.film = t("movieForm.videoMissing");
    }
    if (status === 429 || raw.includes("too many")) {
      return {
        banner: t("movieForm.tooManySubmissions"),
        hint: t("movieForm.rateLimited"),
        fieldErrors,
      };
    }
    return {
      banner: err?.message || t("movieForm.submitError"),
      hint: "",
      fieldErrors,
    };
  };

  const handleSubmitToApi = async () => {
    const payload = {
      title: getFieldValue("title"),
      country: getFieldValue("country"),
      description: getFieldValue("description"),
      ai_tools_used: getFieldValue("ai_tools"),
      ai_certification: fields.certify === true ? 1 : 0,

      director_firstname: getFieldValue("fname"),
      director_lastname: getFieldValue("lname"),
      director_email: getFieldValue("email"),
      director_bio: getFieldValue("bio"),

      posterFile,
      filmFile,
      thumbnailFile: thumbFile,
    };

    const result = await submitFilm(payload);
    return { payload, result };
  };

  if (step === 3)
    return (
      <section className="w-full h-screen relative flex items-center justify-center bg-[#262335] px-4 overflow-hidden">
        <img
          src={successBg}
          className="absolute inset-0 w-full h-full object-cover opacity-30"
          alt="Success"
        />
        <div className="relative z-10 bg-[#262335]/80 backdrop-blur-2xl p-8 md:p-20 rounded-[40px] text-center shadow-2xl max-w-2xl w-full">
          <h2 className="text-3xl md:text-6xl font-black text-white mb-8 uppercase italic leading-none">
            {t("movieForm.successTitle1")} <br /> {t("movieForm.successTitle2")}
          </h2>
          <div className="w-20 h-20 md:w-24 md:h-24 bg-[#FBD5BD] rounded-full flex items-center justify-center text-[#262335] text-4xl animate-bounce mx-auto">
            ✓
          </div>
          <button
            onClick={() => window.location.reload()}
            className="mt-10 text-white/50 underline hover:text-white transition-all"
          >
            {t("movieForm.sendAnother")}
          </button>
        </div>
      </section>
    );

  return (
    <form
      ref={formRef}
      onSubmit={async (e) => {
        e.preventDefault();
        setApiError("");
        setApiHint("");

        if (!validateSection(2)) return;

        try {
          setLoading(true);

          const { payload, result } = await handleSubmitToApi();

          if (typeof onFinalSubmit === "function") {
            onFinalSubmit({ payloadSent: payload, apiResult: result });
          }

          setStep(3);
        } catch (err) {
          console.error("Erreur soumission film :", err);

          const { banner, hint, fieldErrors } = mapApiError(err);
          setApiError(banner);
          setApiHint(hint);
          setErrors((prev) => ({ ...prev, ...fieldErrors }));

          if (fieldErrors.film || fieldErrors.poster || fieldErrors.thumb) {
            setStep(1);
            window.scrollTo(0, 0);
          }
        } finally {
          setLoading(false);
        }
      }}
      className="w-full min-h-screen overflow-x-hidden"
    >
      {apiError && (
        <div className="mx-auto mt-6 max-w-6xl px-4">
          <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-[#262335]">
            <p className="font-black uppercase text-sm">{t("common.error")}</p>
            <p className="mt-1 font-bold">{apiError}</p>
            {apiHint && <p className="mt-2 text-sm opacity-80">{apiHint}</p>}
          </div>
        </div>
      )}

      {step === 1 ? (
        <section
          className="w-full min-h-screen flex items-center justify-center px-4 py-10 md:py-20 bg-[#8A83DA]"
          style={{
            backgroundImage: `radial-gradient(ellipse at center, #FBD5BD 0%, rgba(138, 131, 218, 0.8) 100%, #8A83DA 50%)`,
          }}
        >
          <div className="w-full max-w-6xl mx-auto">
            <h2 className="text-3xl md:text-[56px] font-black text-[#262335] text-center mb-8 uppercase italic">
              {t("movieForm.generalInfo")}
            </h2>
            <Stepper currentStep={1} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 md:gap-16">
              <div className="space-y-6">
                <Input
                  label={t("movieForm.title")}
                  name="title"
                  error={errors.title}
                  value={fields.title}
                  onChange={setField("title")}
                />
                <CountrySelect
                  label={t("movieForm.country")}
                  name="country"
                  error={errors.country}
                  value={fields.country}
                  onChange={setField("country")}
                />
                <Input
                  label={t("movieForm.description")}
                  name="description"
                  type="textarea"
                  error={errors.description}
                  value={fields.description}
                  onChange={setField("description")}
                />
                <FileUploadZone
                  label={t("movieForm.film")}
                  accept=".mp4,.mov,.webm"
                  file={filmFile}
                  setFile={setFilmFile}
                  error={errors.film}
                  ratioClass="aspect-video md:aspect-[2/1]"
                  type="video"
                />
              </div>
              <div className="space-y-6">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FileUploadZone
                    label={t("movieForm.poster")}
                    accept=".jpg,.png,.webp"
                    file={posterFile}
                    setFile={setPosterFile}
                    error={errors.poster}
                    ratioClass="aspect-[2/3]"
                    type="image"
                  />
                  <FileUploadZone
                    label={t("movieForm.thumbnail")}
                    accept=".jpg,.png,.webp"
                    file={thumbFile}
                    setFile={setThumbFile}
                    error={errors.thumb}
                    ratioClass="aspect-video"
                    type="image"
                  />
                </div>
                <Input
                  label={t("movieForm.aiTools")}
                  name="ai_tools"
                  type="textarea"
                  error={errors.ai_tools}
                  value={fields.ai_tools}
                  onChange={setField("ai_tools")}
                />
                <label
                  className={`flex items-start gap-4 cursor-pointer p-4 rounded-2xl transition-all ${
                    errors.certify ? "bg-red-50 border border-red-200" : ""
                  }`}
                >
                  <input
                    type="checkbox"
                    name="certify"
                    checked={fields.certify}
                    onChange={(e) =>
                      setFields((prev) => ({
                        ...prev,
                        certify: e.target.checked,
                      }))
                    }
                    className="mt-1 w-6 h-6 accent-[#463699]"
                  />

                  <span className="text-sm italic text-[#262335]">
                    {t("movieForm.certification")}
                  </span>
                </label>
                <button
                  type="button"
                  onClick={() => {
                    setApiError("");
                    setApiHint("");

                    if (validateSection(1)) {
                      setStep(2);
                      window.scrollTo(0, 0);
                    }
                  }}
                  className="w-full md:w-auto bg-[#FBF5F0] text-[#262335] px-12 py-4 rounded-full font-black uppercase shadow-xl hover:scale-105 transition-all self-end"
                >
                  {t("movieForm.next")}
                </button>
              </div>
            </div>
          </div>
        </section>
      ) : (
        <section className="w-full min-h-screen bg-[#FBF5F0] flex items-center justify-center px-4 py-10 md:py-20">
          <div className="w-full max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-[56px] font-black text-[#262335] mb-8 uppercase italic">
              {t("movieForm.director")}
            </h2>
            <Stepper currentStep={2} />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-left mb-12">
              <Input
                label={t("movieForm.firstName")}
                name="fname"
                error={errors.fname}
                value={fields.fname}
                onChange={setField("fname")}
              />
              <Input
                label={t("movieForm.lastName")}
                name="lname"
                error={errors.lname}
                value={fields.lname}
                onChange={setField("lname")}
              />
              <Input
                label={t("movieForm.email")}
                name="email"
                type="email"
                error={errors.email}
                value={fields.email}
                onChange={setField("email")}
              />
              <Input
                label={t("movieForm.bio")}
                name="bio"
                type="textarea"
                error={errors.bio}
                value={fields.bio}
                onChange={setField("bio")}
              />
            </div>
            <div className="flex flex-col-reverse md:flex-row gap-6 justify-center items-center">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-[#262335] underline font-bold uppercase"
              >
                {t("movieForm.back")}
              </button>
              <button
                type="submit"
                disabled={loading}
                className="w-full md:w-auto bg-[#262335] text-[#FBF5F0] px-16 py-6 rounded-full font-black uppercase shadow-2xl flex items-center justify-center gap-4"
              >
                {loading && (
                  <div className="animate-spin h-5 w-5 border-2 border-white border-t-transparent rounded-full" />
                )}
                {loading ? t("movieForm.submitting") : t("movieForm.submit")}
              </button>
            </div>
          </div>
        </section>
      )}
    </form>
  );
}
