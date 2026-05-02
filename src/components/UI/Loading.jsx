import { DotsLoader } from "react-loadly";
import { useThemeLang } from "../../contexts/ThemeLangContext";
import { T } from "../../utils/translations";
import "react-loadly/styles.css";
export default function Loading({
  size = 45,
  color = "#2563eb",
  speed = 1,
  count = 3,
  borderWidth = 4,
}) {
  const { lang } = useThemeLang();
  const t = (key) => T[lang][key] || key;
  return (
    <DotsLoader
      size={size}
      color={color}
      speed={speed}
      aria-label="Loading"
      showText={true}
      loadingText={t("loading")}
      loaderCenter={true}
      count={count}
      borderWidth={borderWidth}
      secondaryColor="#e0e7ff"
    />
  );
}
