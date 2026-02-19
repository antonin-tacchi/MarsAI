import { useLanguage } from "../context/LanguageContext";

export default function About() {
  const { t } = useLanguage();
  return (
    <div>
      <h1>{t("pages.about")}</h1>
    </div>
  );
}
