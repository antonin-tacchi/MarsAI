import { useState, useRef } from "react";
import { Link } from "react-router-dom";
import { submitFilm } from "../services/filmService";

export default function SubmitFilm() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [uploadProgress, setUploadProgress] = useState(0);

  const filmInputRef = useRef(null);
  const posterInputRef = useRef(null);
  const thumbnailInputRef = useRef(null);

  const [formData, setFormData] = useState({
    // Film Info
    title: "",
    country: "",
    description: "",
    ai_tools_used: "",
    ai_certification: false,

    // Director Info
    director_firstname: "",
    director_lastname: "",
    director_email: "",
    director_bio: "",
    director_school: "",
    director_website: "",
    social_instagram: "",
    social_youtube: "",
    social_vimeo: "",
  });

  const [filmFile, setFilmFile] = useState(null);
  const [posterFile, setPosterFile] = useState(null);
  const [thumbnailFile, setThumbnailFile] = useState(null);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleFilmFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (2GB max)
      if (file.size > 2 * 1024 * 1024 * 1024) {
        setError("Le fichier video ne doit pas depasser 2GB");
        return;
      }
      setFilmFile(file);
      setError("");
    }
  };

  const handlePosterFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (10MB max)
      if (file.size > 10 * 1024 * 1024) {
        setError("Le poster ne doit pas depasser 10MB");
        return;
      }
      setPosterFile(file);
      setError("");
    }
  };

  const handleThumbnailFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (5MB max for thumbnail)
      if (file.size > 5 * 1024 * 1024) {
        setError("La miniature ne doit pas depasser 5MB");
        return;
      }
      setThumbnailFile(file);
      setError("");
    }
  };

  const formatFileSize = (bytes) => {
    if (bytes === 0) return "0 B";
    const k = 1024;
    const sizes = ["B", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const nextStep = () => {
    if (step === 1) {
      // Validate step 1
      if (!formData.title.trim()) {
        setError("Le titre est requis");
        return;
      }
      if (!filmFile) {
        setError("Le fichier du film est requis");
        return;
      }
      if (!thumbnailFile) {
        setError("La miniature est requise");
        return;
      }
    }
    setError("");
    setStep(step + 1);
  };

  const prevStep = () => {
    setError("");
    setStep(step - 1);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Validate step 2
    if (!formData.director_firstname.trim() || !formData.director_lastname.trim()) {
      setError("Le prenom et le nom sont requis");
      return;
    }
    if (!formData.director_email.trim()) {
      setError("L'email est requis");
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      // Create FormData for file upload
      const submitData = new FormData();

      // Add text fields
      Object.keys(formData).forEach((key) => {
        if (formData[key] !== "" && formData[key] !== null && formData[key] !== undefined) {
          submitData.append(key, formData[key]);
        }
      });

      // Add files
      if (filmFile) {
        submitData.append("film", filmFile);
      }
      if (posterFile) {
        submitData.append("poster", posterFile);
      }
      if (thumbnailFile) {
        submitData.append("thumbnail", thumbnailFile);
      }

      await submitFilm(submitData, (progress) => {
        setUploadProgress(progress);
      });
      setSuccess(true);
    } catch (err) {
      setError(err.message || "Erreur lors de la soumission");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-[#E8DFF5] to-white flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-[#262335] mb-2">Film soumis avec succes !</h2>
          <p className="text-gray-600 mb-6">
            Vous recevrez un email de confirmation a l'adresse {formData.director_email}.
            Notre equipe examinera votre film et vous informera du resultat.
          </p>
          <Link
            to="/"
            className="inline-block bg-[#463699] text-white px-6 py-3 rounded-lg hover:bg-[#362a7a] transition-colors"
          >
            Retour a l'accueil
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-[#E8DFF5] to-white">
      {/* Header */}
      <div className="bg-[#262335] text-white py-4">
        <div className="container mx-auto px-4">
          <Link to="/" className="text-2xl font-bold">MarsAI Festival</Link>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8 max-w-3xl">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-8">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${step >= 1 ? "bg-[#463699]" : "bg-gray-300"}`}>
              1
            </div>
            <div className={`w-24 h-1 ${step >= 2 ? "bg-[#463699]" : "bg-gray-300"}`}></div>
            <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${step >= 2 ? "bg-[#463699]" : "bg-gray-300"}`}>
              2
            </div>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-white rounded-2xl shadow-lg p-6 md:p-8">
          <h1 className="text-2xl md:text-3xl font-bold text-[#262335] text-center mb-8">
            {step === 1 ? "Informations generales du film" : "Informations sur le realisateur"}
          </h1>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {/* Step 1: Film Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#262335] mb-2">
                      Titre *
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699]"
                      placeholder="Titre du film"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#262335] mb-2">
                      Pays de production
                    </label>
                    <input
                      type="text"
                      name="country"
                      value={formData.country}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699]"
                      placeholder="France"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#262335] mb-2">
                    Description
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699] resize-none"
                    placeholder="Decrivez votre film..."
                  />
                </div>

                {/* Film File Upload */}
                <div>
                  <label className="block text-sm font-medium text-[#262335] mb-2">
                    Fichier du film *
                  </label>
                  <input
                    type="file"
                    ref={filmInputRef}
                    onChange={handleFilmFileChange}
                    accept="video/mp4,video/quicktime,video/x-msvideo,video/x-ms-wmv,video/webm,video/mpeg,.mkv"
                    className="hidden"
                  />
                  <div
                    onClick={() => filmInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                      ${filmFile ? "border-green-400 bg-green-50" : "border-[#C7C2CE] hover:border-[#463699]"}`}
                  >
                    {filmFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <div className="text-left">
                          <p className="font-medium text-[#262335]">{filmFile.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(filmFile.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setFilmFile(null);
                            if (filmInputRef.current) filmInputRef.current.value = "";
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                        </svg>
                        <p className="text-[#262335] font-medium">Cliquez pour telecharger votre film</p>
                        <p className="text-sm text-gray-500 mt-1">MP4, MOV, AVI, WMV, WebM, MKV (max 2GB)</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Poster File Upload */}
                <div>
                  <label className="block text-sm font-medium text-[#262335] mb-2">
                    Poster / Affiche
                  </label>
                  <input
                    type="file"
                    ref={posterInputRef}
                    onChange={handlePosterFileChange}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                  />
                  <div
                    onClick={() => posterInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                      ${posterFile ? "border-green-400 bg-green-50" : "border-[#C7C2CE] hover:border-[#463699]"}`}
                  >
                    {posterFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <img
                          src={URL.createObjectURL(posterFile)}
                          alt="Poster preview"
                          className="w-16 h-16 object-cover rounded"
                        />
                        <div className="text-left">
                          <p className="font-medium text-[#262335]">{posterFile.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(posterFile.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPosterFile(null);
                            if (posterInputRef.current) posterInputRef.current.value = "";
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-[#262335] font-medium">Cliquez pour telecharger l'affiche</p>
                        <p className="text-sm text-gray-500 mt-1">JPG, PNG, WebP, GIF (max 10MB)</p>
                      </>
                    )}
                  </div>
                </div>

                {/* Thumbnail File Upload */}
                <div>
                  <label className="block text-sm font-medium text-[#262335] mb-2">
                    Miniature / Thumbnail *
                  </label>
                  <input
                    type="file"
                    ref={thumbnailInputRef}
                    onChange={handleThumbnailFileChange}
                    accept="image/jpeg,image/png,image/webp,image/gif"
                    className="hidden"
                  />
                  <div
                    onClick={() => thumbnailInputRef.current?.click()}
                    className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors
                      ${thumbnailFile ? "border-green-400 bg-green-50" : "border-[#C7C2CE] hover:border-[#463699]"}`}
                  >
                    {thumbnailFile ? (
                      <div className="flex items-center justify-center gap-3">
                        <img
                          src={URL.createObjectURL(thumbnailFile)}
                          alt="Thumbnail preview"
                          className="w-20 h-12 object-cover rounded"
                        />
                        <div className="text-left">
                          <p className="font-medium text-[#262335]">{thumbnailFile.name}</p>
                          <p className="text-sm text-gray-500">{formatFileSize(thumbnailFile.size)}</p>
                        </div>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setThumbnailFile(null);
                            if (thumbnailInputRef.current) thumbnailInputRef.current.value = "";
                          }}
                          className="ml-2 text-red-500 hover:text-red-700"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg className="w-12 h-12 mx-auto text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <p className="text-[#262335] font-medium">Cliquez pour telecharger la miniature</p>
                        <p className="text-sm text-gray-500 mt-1">Format paysage 16:9 recommande - JPG, PNG, WebP, GIF (max 5MB)</p>
                      </>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#262335] mb-2">
                    Outils IA utilises <span className="text-gray-500">(precisez)</span>
                  </label>
                  <textarea
                    name="ai_tools_used"
                    value={formData.ai_tools_used}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-3 border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699] resize-none"
                    placeholder="Ex: Midjourney, RunwayML, ChatGPT..."
                  />
                </div>

                <div className="flex items-start gap-3">
                  <input
                    type="checkbox"
                    name="ai_certification"
                    id="ai_certification"
                    checked={formData.ai_certification}
                    onChange={handleChange}
                    className="mt-1 w-5 h-5 text-[#463699] border-[#C7C2CE] rounded focus:ring-[#463699]"
                  />
                  <label htmlFor="ai_certification" className="text-sm text-[#262335]">
                    Je certifie que ce film a ete genere a l'aide d'outils d'intelligence artificielle
                    et respecte les regles du festival
                  </label>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={nextStep}
                    className="bg-[#463699] text-white px-8 py-3 rounded-lg hover:bg-[#362a7a] transition-colors flex items-center gap-2"
                  >
                    Suivant
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            {/* Step 2: Director Info */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#262335] mb-2">
                      Prenom *
                    </label>
                    <input
                      type="text"
                      name="director_firstname"
                      value={formData.director_firstname}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699]"
                      placeholder="Prenom"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#262335] mb-2">
                      Nom *
                    </label>
                    <input
                      type="text"
                      name="director_lastname"
                      value={formData.director_lastname}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699]"
                      placeholder="Nom"
                    />
                  </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-[#262335] mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      name="director_email"
                      value={formData.director_email}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699]"
                      placeholder="email@exemple.com"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-[#262335] mb-2">
                      Ecole / Collectif
                    </label>
                    <input
                      type="text"
                      name="director_school"
                      value={formData.director_school}
                      onChange={handleChange}
                      className="w-full px-4 py-3 border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699]"
                      placeholder="Nom de l'ecole ou collectif"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#262335] mb-2">
                    Bio
                  </label>
                  <textarea
                    name="director_bio"
                    value={formData.director_bio}
                    onChange={handleChange}
                    rows={4}
                    className="w-full px-4 py-3 border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699] resize-none"
                    placeholder="Parlez-nous de vous..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#262335] mb-2">
                    Site web / Portfolio
                  </label>
                  <input
                    type="url"
                    name="director_website"
                    value={formData.director_website}
                    onChange={handleChange}
                    className="w-full px-4 py-3 border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699]"
                    placeholder="https://..."
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#262335] mb-3">
                    Reseaux sociaux
                  </label>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-center text-xl">@</span>
                      <input
                        type="text"
                        name="social_instagram"
                        value={formData.social_instagram}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699]"
                        placeholder="Instagram"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-center">
                        <svg className="w-6 h-6 mx-auto text-red-600" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                        </svg>
                      </span>
                      <input
                        type="text"
                        name="social_youtube"
                        value={formData.social_youtube}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699]"
                        placeholder="YouTube"
                      />
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="w-8 text-center">
                        <svg className="w-6 h-6 mx-auto text-blue-400" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.14.18-.357.223-.548.223l.188-2.85 5.18-4.68c.223-.198-.054-.308-.346-.11l-6.4 4.02-2.76-.918c-.6-.187-.612-.6.126-.89l10.782-4.156c.5-.18.94.126.778.89z"/>
                        </svg>
                      </span>
                      <input
                        type="text"
                        name="social_vimeo"
                        value={formData.social_vimeo}
                        onChange={handleChange}
                        className="flex-1 px-4 py-3 border border-[#C7C2CE] rounded-lg focus:outline-none focus:border-[#463699]"
                        placeholder="Vimeo"
                      />
                    </div>
                  </div>
                </div>

                {/* Upload Progress Bar */}
                {loading && uploadProgress > 0 && (
                  <div className="mt-4">
                    <div className="flex justify-between text-sm text-gray-600 mb-1">
                      <span>Envoi en cours...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2.5">
                      <div
                        className="bg-[#463699] h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={loading}
                    className="text-[#463699] px-6 py-3 rounded-lg hover:bg-gray-100 transition-colors flex items-center gap-2 disabled:opacity-50"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                    </svg>
                    Retour
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="bg-[#463699] text-white px-8 py-3 rounded-lg hover:bg-[#362a7a] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {loading ? "Envoi en cours..." : "Soumettre le film"}
                  </button>
                </div>
              </div>
            )}
          </form>
        </div>
      </div>
    </div>
  );
}
