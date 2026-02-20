import { useLanguage } from "../context/LanguageContext";

export default function NotFound() {
  const { t } = useLanguage();
  return (
    <div>
      <h1>{t("pages.notFound")}</h1>
    </div>
  );
}
