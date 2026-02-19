import { useLanguage } from "../context/LanguageContext";

export default function Regulations() {
  const { t } = useLanguage();
  return (
    <div>
      <h1>{t("pages.regulations")}</h1>
    </div>
  );
}
