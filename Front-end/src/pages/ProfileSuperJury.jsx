import { useCallback, useEffect, useState } from "react";
import Button from "../components/Button";
import { useLanguage } from "../context/LanguageContext";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:5001";

export default function ProfileSuperJury() {
  const { t } = useLanguage();
  const [user, setUser] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [statsError, setStatsError] = useState("");

  const [R, setR] = useState(3);
  const [Lmax, setLmax] = useState(10);

  const [preview, setPreview] = useState(null);
  const [previewLoading, setPreviewLoading] = useState(false);

  const [generating, setGenerating] = useState(false);
  const [result, setResult] = useState(null);

  const token = localStorage.getItem("token");

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch(`${API_URL}/api/auth/profile`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (res.ok) setUser(json?.data || null);
    } catch (err) {
      console.error("Profile error:", err);
    } finally {
      setProfileLoading(false);
    }
  }, [token]);

  const fetchStats = useCallback(async () => {
    setStatsLoading(true);
    setStatsError("");
    try {
      const res = await fetch(`${API_URL}/api/admin/distribution/stats`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Error");
      setStats(json.data);
    } catch (err) {
      console.error("Stats error:", err);
      setStatsError(err.message);
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  useEffect(() => {
    fetchProfile();
    fetchStats();
  }, [fetchProfile, fetchStats]);

  const handlePreview = async () => {
    setPreviewLoading(true);
    setPreview(null);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/distribution/preview`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ R, Lmax }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Error");
      setPreview(json.data);
    } catch (err) {
      console.error("Preview error:", err);
      setPreview(null);
      setStatsError(err.message);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleGenerate = async () => {
    setGenerating(true);
    setResult(null);
    try {
      const res = await fetch(`${API_URL}/api/admin/distribution/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ R, Lmax }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json?.message || "Error");
      setResult(json.data);
      setPreview(null);
      fetchStats();
    } catch (err) {
      console.error("Generate error:", err);
      setStatsError(err.message);
    } finally {
      setGenerating(false);
    }
  };

  if (profileLoading) {
    return (
      <div className="bg-[#FBF5F0] min-h-screen flex items-center justify-center">
        <p className="text-xl text-[#262335]">{t("profileSuperJury.loading")}</p>
      </div>
    );
  }

  return (
    <div className="bg-[#FBF5F0] min-h-screen">
      <div className="flex flex-col gap-6 p-6 md:p-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl md:text-3xl font-semibold text-[#262335]">
            {t("profileSuperJury.title", {
              name: user?.name || t("profileSuperJury.defaultName"),
            })}
          </h1>
          <Button
            onClick={() => {
              localStorage.removeItem("token");
              localStorage.removeItem("user");
              window.location.href = "/login";
            }}
          >
            {t("profileSuperJury.logout")}
          </Button>
        </div>

        {/* Current state */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#262335] mb-4">
            {t("profileSuperJury.currentState")}
          </h2>

          {statsLoading ? (
            <p className="text-[#262335]/60">{t("profileSuperJury.loading")}</p>
          ) : statsError ? (
            <p className="text-red-500">{statsError}</p>
          ) : stats ? (
            <>
              {/* Summary badges */}
              <div className="flex flex-wrap gap-3 mb-6">
                <span className="bg-[#262335] text-white px-4 py-2 rounded-lg font-bold">
                  {t("profileSuperJury.films")}: {stats.filmCount}
                </span>
                <span className="bg-[#463699] text-white px-4 py-2 rounded-lg font-bold">
                  {t("profileSuperJury.assignments")}: {stats.assignmentCount}
                </span>
                <span className="bg-[#463699]/70 text-white px-4 py-2 rounded-lg font-bold">
                  {t("profileSuperJury.juries")}: {stats.juryCount}
                </span>
              </div>

              {/* Jury table */}
              {stats.juries.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b-2 border-[#262335]/10">
                        <th className="py-3 px-4 font-bold text-[#262335]">
                          {t("profileSuperJury.juryHeader")}
                        </th>
                        <th className="py-3 px-4 font-bold text-[#262335] text-center">
                          {t("profileSuperJury.assignedFilms")}
                        </th>
                        <th className="py-3 px-4 font-bold text-[#262335] text-center">
                          {t("profileSuperJury.ratings")}
                        </th>
                        <th className="py-3 px-4 font-bold text-[#262335] text-center">
                          {t("profileSuperJury.remaining")}
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.juries.map((jury) => (
                        <tr
                          key={jury.id}
                          className="border-b border-[#262335]/5 hover:bg-[#463699]/5 transition-colors"
                        >
                          <td className="py-3 px-4 text-[#262335]">{jury.name}</td>
                          <td className="py-3 px-4 text-center font-mono">
                            {jury.assigned_films}
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            {jury.rated}
                          </td>
                          <td className="py-3 px-4 text-center font-mono">
                            {jury.remaining}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-[#262335]/50 italic">{t("profileSuperJury.noData")}</p>
              )}
            </>
          ) : null}
        </section>

        {/* Generate distribution */}
        <section className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#262335] mb-4">
            {t("profileSuperJury.generateTitle")}
          </h2>

          <div className="flex flex-wrap gap-4 items-end mb-6">
            <div>
              <label className="block text-sm font-bold text-[#262335] mb-1">
                {t("profileSuperJury.rLabel")}
              </label>
              <input
                type="number"
                min={1}
                max={20}
                value={R}
                onChange={(e) => setR(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-24 px-3 py-2 border-2 border-[#262335]/10 rounded-lg text-center font-mono focus:outline-none focus:border-[#463699]"
              />
            </div>
            <div>
              <label className="block text-sm font-bold text-[#262335] mb-1">
                {t("profileSuperJury.lmaxLabel")}
              </label>
              <input
                type="number"
                min={1}
                max={100}
                value={Lmax}
                onChange={(e) => setLmax(Math.max(1, parseInt(e.target.value, 10) || 1))}
                className="w-24 px-3 py-2 border-2 border-[#262335]/10 rounded-lg text-center font-mono focus:outline-none focus:border-[#463699]"
              />
            </div>
            <Button onClick={handlePreview} disabled={previewLoading}>
              {previewLoading
                ? t("profileSuperJury.calculating")
                : t("profileSuperJury.preview")}
            </Button>
          </div>

          {/* Preview result */}
          {preview && (
            <div className="bg-[#FBF5F0] rounded-xl p-5 mb-4">
              <h3 className="font-bold text-[#262335] mb-3">
                {t("profileSuperJury.previewTitle", { R, Lmax })}
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm mb-4">
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-[#262335]/60">{t("profileSuperJury.films")}</p>
                  <p className="font-black text-lg">{preview.filmCount}</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-[#262335]/60">{t("profileSuperJury.assignments")}</p>
                  <p className="font-black text-lg">{preview.total}</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-[#262335]/60">{t("profileSuperJury.minPerJury")}</p>
                  <p className="font-black text-lg">{preview.min}</p>
                </div>
                <div className="bg-white rounded-lg p-3 text-center">
                  <p className="text-[#262335]/60">{t("profileSuperJury.maxPerJury")}</p>
                  <p className="font-black text-lg">{preview.max}</p>
                </div>
              </div>
              <div className="flex gap-3">
                <Button onClick={handleGenerate} disabled={generating}>
                  {generating
                    ? t("profileSuperJury.generating")
                    : t("profileSuperJury.confirmGenerate")}
                </Button>
                <button
                  type="button"
                  onClick={() => setPreview(null)}
                  className="text-[#262335] underline font-bold text-sm"
                >
                  {t("profileSuperJury.cancel")}
                </button>
              </div>
            </div>
          )}

          {/* Generation result */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-xl p-5">
              <p className="font-bold text-green-800 mb-1">
                {t("profileSuperJury.success")}
              </p>
              <p className="text-green-700 text-sm">
                {t("profileSuperJury.resultMessage", {
                  total: result.total,
                  juryCount: result.juryCount,
                  R: result.R,
                  Lmax: result.Lmax,
                })}
              </p>
              <p className="text-green-700 text-sm">
                {t("profileSuperJury.resultStats", {
                  min: result.min,
                  max: result.max,
                  avg: result.avg,
                })}
              </p>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
