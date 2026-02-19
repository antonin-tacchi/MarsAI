import { useLanguage } from "../context/LanguageContext";

export default function Contact() {
  const { t } = useLanguage();
  return (
    <div>
      <h1>{t("pages.contact")}</h1>
    </div>
  );
}
