import { useLanguage } from "../context/LanguageContext";

export default function PrizeList() {
  const { t } = useLanguage();
  return (
    <div>
      <h1>{t("pages.prizeList")}</h1>
    </div>
  );
}
