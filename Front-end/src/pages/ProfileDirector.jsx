import { useLanguage } from "../context/LanguageContext";

export default function ProfileDirector() {
  const { t } = useLanguage();
  return (
    <div>
      <h1>{t("pages.profileDirector")}</h1>
    </div>
  );
}
