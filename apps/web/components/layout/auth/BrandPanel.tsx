import { Logo } from "./Logo";
import { BrandStory } from "./BrandStory";
import { Testimonial } from "./Testimonial";
import { TrustBadges } from "./TrustBadges";
export interface BrandPanelProps {
  id?: string;
}
export function BrandPanel({ id }: BrandPanelProps) {
  return (
    <aside id={id} className="a-brand-panel" aria-label="About ShopStream">
      <Logo dark />
      <BrandStory />
      <div className="a-brand-bottom">
        <Testimonial />
        <TrustBadges />
      </div>
    </aside>
  );
}
