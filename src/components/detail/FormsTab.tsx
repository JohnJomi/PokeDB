import { LcdScreen } from "@/components/device/LcdScreen";
import { TitleBar } from "@/components/device/TitleBar";
import { Sprite } from "@/components/ui/Sprite";
import { TypeBadge } from "@/components/ui/TypeBadge";
import type { Form } from "@/lib/types";
import styles from "./Forms.module.css";

export function FormsTab({ forms }: { forms: Form[] }) {
  return (
    <LcdScreen aria-label="Forms">
      <TitleBar title="FORMS" value={forms.length} />
      <ul className={styles.grid}>
        {forms.map((form) => (
          <li key={form.slug} className={styles.card}>
            <Sprite src={form.sprite} alt="" size={96} lazy />
            <h3>{form.name}</h3>
            <div className={styles.badges}>
              {form.types.map((t) => <TypeBadge key={t} type={t} />)}
            </div>
          </li>
        ))}
      </ul>
    </LcdScreen>
  );
}
