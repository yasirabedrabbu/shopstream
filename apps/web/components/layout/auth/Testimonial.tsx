import Image from "next/image";
import { AuthIcon } from "@/components/auth/AuthIcon";
import { authDimensions } from "@/lib/auth-pages/dimensions";
export interface TestimonialProps {
  id?: string;
}
export function Testimonial({ id }: TestimonialProps) {
  return (
    <div id={id} className="a-testimonial">
      <p className="p-text p-eyebrow a-quote-label">An illustrative seller story</p>
      <p className="p-text p-body a-quote">
        “My little shop finally has room to grow. Everything I need, in one place.”
      </p>
      <div className="a-quote-author">
        <Image
          src="/images/auth-seller-avatar.webp"
          alt="Illustrative ShopStream seller"
          width={authDimensions.avatar}
          height={authDimensions.avatar}
        />
        <div>
          <p className="p-text p-body">Farhan Ahmed</p>
          <p className="p-text p-small">Store owner · Dhaka, Bangladesh</p>
        </div>
        <span className="a-quote-check">
          <AuthIcon name="checkCircle" className="a-icon-sm" />
        </span>
      </div>
    </div>
  );
}
