const API_BASE_URL = (import.meta.env.VITE_API_URL || "http://localhost:5001").replace(/\/+$/, "");

export async function submitFilm(payload) {
  const formData = new FormData();

  formData.append("title", payload.title || "");
  formData.append("country", payload.country || "");
  formData.append("description", payload.description || "");

  if (payload.ai_tools_used) formData.append("ai_tools_used", payload.ai_tools_used);
  if (typeof payload.ai_certification !== "undefined") {
    formData.append("ai_certification", String(payload.ai_certification));
  }

  formData.append("director_firstname", payload.director_firstname || "");
  formData.append("director_lastname", payload.director_lastname || "");
  formData.append("director_email", payload.director_email || "");

  if (payload.director_bio) formData.append("director_bio", payload.director_bio);
  if (payload.director_school) formData.append("director_school", payload.director_school);
  if (payload.director_website) formData.append("director_website", payload.director_website);

  if (payload.social_instagram) formData.append("social_instagram", payload.social_instagram);
  if (payload.social_youtube) formData.append("social_youtube", payload.social_youtube);
  if (payload.social_vimeo) formData.append("social_vimeo", payload.social_vimeo);

  if (payload.filmFile) formData.append("film", payload.filmFile);
  if (payload.posterFile) formData.append("poster", payload.posterFile);
  if (payload.thumbnailFile) formData.append("thumbnail", payload.thumbnailFile);

  const url = `${API_BASE_URL}/api/films`;

  let res;
  try {
    res = await fetch(url, {
      method: "POST",
      body: formData,
    });
  } catch (e) {
    // ✅ Ici c’est: serveur off / mauvaise URL / CORS / HTTPS mix / réseau
    const isMixedContent =
      typeof window !== "undefined" &&
      window.location?.protocol === "https:" &&
      url.startsWith("http://");

    const messageParts = [
      `Failed to fetch: ${url}`,
      isMixedContent ? "Likely mixed content (HTTPS page calling HTTP API)." : null,
      "Check: backend running, URL, CORS, proxy, firewall, docker port mapping.",
    ].filter(Boolean);

    const err = new Error(messageParts.join(" "));
    err.status = 0;
    err.original = e;
    throw err;
  }

  const contentType = res.headers.get("content-type") || "";
  let data = null;

  if (contentType.includes("application/json")) {
    data = await res.json().catch(() => null);
  } else {
    const text = await res.text().catch(() => "");
    data = { success: false, message: text || "Non-JSON server response" };
  }

  if (!res.ok) {
    const err = new Error(data?.message || `Film submission failed (${res.status})`);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}
