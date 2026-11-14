import { FooterTools } from "./FooterTools";
export interface FooterProps {
  id?: string;
}
export function Footer({ id }: FooterProps) {
  return (
    <footer id={id} className="a-page-footer">
      <p className="p-text p-small p-tone-muted">© 2026 ShopStream. A good place to begin.</p>
      <FooterTools />
    </footer>
  );
}
