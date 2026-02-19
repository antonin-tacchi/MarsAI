import { useLanguage } from "../context/LanguageContext";

export default function Home() {
  const { t } = useLanguage();
  return (
    <div>
      <h1>{t("pages.home")}</h1>
    </div>
  );
}
