import { AuthIcon } from "@/components/auth/AuthIcon";
export interface BrandDecorationProps {
  id?: string;
}
export function BrandDecoration({ id }: BrandDecorationProps) {
  return (
    <div id={id} className="a-brand-decoration" aria-hidden="true">
      <div className="a-decoration-card a-decoration-card-back">
        <AuthIcon name="store" className="a-icon-xl" />
        <div>
          <span />
          <span />
        </div>
      </div>
      <div className="a-decoration-card a-decoration-card-front">
        <span className="a-decoration-check">
          <AuthIcon name="check" className="a-icon-xs" />
        </span>
        <div>
          <p className="p-text p-small">A good place to start.</p>
          <p className="p-text p-small">Built for what comes next.</p>
        </div>
        <AuthIcon name="trendUp" />
      </div>
    </div>
  );
}
