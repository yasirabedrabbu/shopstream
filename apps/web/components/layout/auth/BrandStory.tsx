import { BrandDecoration } from "./BrandDecoration";
export interface BrandStoryProps {
  id?: string;
}
export function BrandStory({ id }: BrandStoryProps) {
  return (
    <div id={id} className="a-brand-story">
      <div className="a-brand-eyebrow">
        <span />
        Made for your next chapter
      </div>
      <h2 className="p-text a-brand-headline">
        Big dreams.
        <br />
        Small beginnings.
        <br />
        <span className="p-text">Your ShopStream.</span>
      </h2>
      <p className="p-text p-body a-brand-description">
        A place to discover what you love.
        <br />
        And grow what you’re building.
      </p>
      <BrandDecoration />
    </div>
  );
}
