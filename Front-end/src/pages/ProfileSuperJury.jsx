import { useCallback, useEffect, useState } from "react";
import Button from "../components/Button";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function ProfileSuperJury() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Params
  const [R, setR] = useState(3);
  const [Lmax, setLmax] = useState(70);

  // Overview data
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(false);

  // Preview / Generate
  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");
  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };

  // Load profile
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await fetch(`${API_URL}/api/auth/profile`, { headers });
        const json = await res.json();
        if (!res.ok) throw new Error(json?.message || "Erreur profil");
        setUser(json?.data || null);
      } catch (err) {
        console.error(err);
        setUser(null);
      } finally {
        setProfileLoading(false);
      }
    };
    loadProfile();
  }, []);

  // Load overview
  const fetchOverview = useCallback(async () => {
    setOverviewLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/superjury/overview`, { headers });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Erreur");
      setOverview(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setOverviewLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchOverview();
  }, [fetchOverview]);

  // Preview
  const handlePreview = async () => {
    setError("");
    setPreview(null);
    setPreviewLoading(true);
    try {
      const res = await fetch(
        `${API_URL}/api/superjury/preview?R=${R}&Lmax=${Lmax}`,
        { headers }
      );
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Erreur");
      setPreview(json.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  // Generate
  const handleGenerate = async () => {
    setError("");
    setResult(null);
    setGenerating(true);
    try {
      const res = await fetch(`${API_URL}/api/superjury/generate`, {
        method: "POST",
        headers,
        body: JSON.stringify({ R, Lmax }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Erreur");
      setResult(json.data);
      setPreview(null);
      fetchOverview();
    } catch (err) {
      setError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="bg-[#FBF5F0] min-h-screen flex items-center justify-center">
        <h1>{t("profileSuperJury.loading")}</h1>
      </div>
    );
  }

  return (
    <div className="bg-[#FBF5F0] min-h-screen">
      <div className="flex flex-col gap-6 p-6 md:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#262335]">
            {t("profileSuperJury.title", { name: user?.name || t("profileSuperJury.defaultName") })}
          </h1>
          <Button
            onClick={() => {
              localStorage.removeItem("token");
              window.location.reload();
            }}
          >
            {t("profileSuperJury.logout")}
          </Button>
        </div>

        {/* Current state */}
        <section className="bg-white rounded-2xl p-6 border border-black/5">
          <h2 className="text-xl font-bold text-[#262335] mb-4">
            {t("profileSuperJury.currentState")}
          </h2>

          {overviewLoading ? (
            <p className="text-[#262335]/50">{t("profileSuperJury.loading")}</p>
          ) : overview ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-4">
                <Stat label={t("profileSuperJury.films")} value={overview.totalFilms} />
                <Stat label={t("profileSuperJury.assignments")} value={overview.totalAssignments} />
                <Stat label={t("profileSuperJury.juries")} value={overview.juries?.length || 0} />
              </div>

              {overview.juries?.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#262335]/10">
                        <th className="text-left py-2 px-3 font-bold text-[#262335]">{t("profileSuperJury.juryHeader")}</th>
                        <th className="text-center py-2 px-3 font-bold text-[#262335]">{t("profileSuperJury.assignedFilms")}</th>
                        <th className="text-center py-2 px-3 font-bold text-[#262335]">{t("profileSuperJury.ratings")}</th>
                        <th className="text-center py-2 px-3 font-bold text-[#262335]">{t("profileSuperJury.remaining")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {overview.juries.map((j) => (
                        <tr key={j.jury_id} className="border-b border-[#262335]/5">
                          <td className="py-2 px-3 text-[#262335]">
                            {j.jury_name || j.jury_email}
                          </td>
                          <td className="py-2 px-3 text-center font-mono">
                            {j.film_count}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-green-600">
                            {j.rated_count}
                          </td>
                          <td className="py-2 px-3 text-center font-mono text-orange-500">
                            {j.film_count - j.rated_count}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            <p className="text-[#262335]/50">{t("profileSuperJury.noData")}</p>
          )}
        </section>

        {/* Generator */}
        <section className="bg-white rounded-2xl p-6 border border-black/5">
          <h2 className="text-xl font-bold text-[#262335] mb-4">
            {t("profileSuperJury.generateTitle")}
          </h2>

          <div className="flex flex-wrap gap-6 items-end mb-6">
            <div>
              <label className="block text-sm font-bold text-[#262335] mb-1">
                {t("profileSuperJury.rLabel")}
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={R}
                onChange={(e) => setR(Math.max(1, Math.min(20, Number(e.target.value) || 1)))}
                className="w-24 p-3 rounded-xl border-2 border-[#262335]/10 bg-[#FBF5F0] text-[#262335] font-mono text-center focus:border-[#463699] focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-[#262335] mb-1">
                {t("profileSuperJury.lmaxLabel")}
              </label>
              <input
                type="number"
                min={1}
                max={500}
                value={Lmax}
                onChange={(e) => setLmax(Math.max(1, Math.min(500, Number(e.target.value) || 1)))}
                className="w-24 p-3 rounded-xl border-2 border-[#262335]/10 bg-[#FBF5F0] text-[#262335] font-mono text-center focus:border-[#463699] focus:outline-none"
              />
            </div>

            <Button onClick={handlePreview} disabled={previewLoading}>
              {previewLoading ? t("profileSuperJury.calculating") : t("profileSuperJury.preview")}
            </Button>
          </div>

          {/* Preview result */}
          {preview && (
            <div className="bg-[#FBF5F0] rounded-xl p-4 mb-6 space-y-3">
              <h3 className="font-bold text-[#262335]">
                {t("profileSuperJury.previewTitle", { R: preview.R, Lmax: preview.Lmax })}
              </h3>

              <div className="flex flex-wrap gap-4">
                <Stat label={t("profileSuperJury.assignments")} value={preview.stats.totalAssignments} />
                <Stat label={t("profileSuperJury.minPerJury")} value={preview.stats.minPerJury} />
                <Stat label={t("profileSuperJury.maxPerJury")} value={preview.stats.maxPerJury} />
                <Stat label={t("profileSuperJury.avgPerJury")} value={preview.stats.avgPerJury} />
              </div>

              {preview.stats.perJury?.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-[#262335]/10">
                        <th className="text-left py-2 px-3 font-bold text-[#262335]">{t("profileSuperJury.juryHeader")}</th>
                        <th className="text-center py-2 px-3 font-bold text-[#262335]">{t("profileSuperJury.films")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {preview.stats.perJury.map((j) => (
                        <tr key={j.juryId} className="border-b border-[#262335]/5">
                          <td className="py-2 px-3 text-[#262335]">{j.juryName}</td>
                          <td className="py-2 px-3 text-center font-mono">{j.filmCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="flex gap-4 pt-2">
                <button
                  onClick={handleGenerate}
                  disabled={generating}
                  className="bg-[#463699] text-white px-8 py-3 rounded-full font-bold uppercase hover:bg-[#362a7a] transition-colors disabled:opacity-50"
                >
                  {generating ? t("profileSuperJury.generating") : t("profileSuperJury.confirmGenerate")}
                </button>
                <button
                  onClick={() => setPreview(null)}
                  className="text-[#262335]/60 underline font-bold"
                >
                  {t("profileSuperJury.cancel")}
                </button>
              </div>
            </div>
          )}

          {/* Generation result */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-4 space-y-2">
              <h3 className="font-bold text-green-800">
                {t("profileSuperJury.success")}
              </h3>
              <p className="text-green-700">
                {t("profileSuperJury.resultMessage", { total: result.stats.totalAssignments, juryCount: result.stats.juryCount, R: result.R, Lmax: result.Lmax })}
              </p>
              <p className="text-green-600 text-sm">
                {t("profileSuperJury.resultStats", { min: result.stats.minPerJury, max: result.stats.maxPerJury, avg: result.stats.avgPerJury })}
              </p>
            </div>
          )}

          {/* Error */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 mt-4">
              <p className="text-red-700 font-bold">{error}</p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="bg-[#262335] text-white px-4 py-2 rounded-lg text-sm">
      <span className="opacity-70">{label} : </span>
      <span className="font-bold font-mono">{value}</span>
    </div>
  );
}
