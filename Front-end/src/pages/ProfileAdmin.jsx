import { useLanguage } from "../context/LanguageContext";

export default function ProfileAdmin() {
  const { t } = useLanguage();
  return (
    <div>
      <h1>{t("pages.profileAdmin")}</h1>
    </div>
  );
}
