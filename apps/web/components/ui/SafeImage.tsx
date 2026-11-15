"use client";

// Drop-in replacement for next/image: `import Image from "@/components/ui/SafeImage"`.
//
// Why this exists: images worked on localhost but not on the Vercel domain. Causes it fixes:
//  1. http:// image URLs are blocked as mixed content on an https site -> upgraded to https.
//  2. Some CDNs reject hot-linking when a Referer header is sent -> referrerPolicy="no-referrer".
//  3. A broken/missing URL left an empty box -> branded placeholder instead.
// Vendors can paste any image URL, so remote images stay unoptimized (no remotePatterns allow-list).
import { useState } from "react";
import Image, { type ImageProps } from "next/image";
import { Icon } from "./Icon";

function normalise(src: ImageProps["src"]): ImageProps["src"] {
  if (typeof src !== "string") return src;
  if (src.startsWith("http://")) {
    const host = src.slice(7).split("/")[0].split(":")[0];
    const isLocal = host === "localhost" || host === "127.0.0.1";
    if (!isLocal) return `https://${src.slice(7)}`;
  }
  return src;
}

export default function SafeImage({ src, alt, className, unoptimized, ...rest }: ImageProps) {
  const [failed, setFailed] = useState(false);
  const url = normalise(src);
  const remote = typeof url === "string" && /^https?:\/\//.test(url);

  if (failed || !url || url === "") {
    const fill = "fill" in rest && rest.fill;
    return (
      <span
        role={alt ? "img" : undefined}
        aria-label={alt || undefined}
        className={`grid place-items-center bg-surface text-text-muted ${fill ? "absolute inset-0" : ""} ${className ?? ""}`}
        style={fill ? undefined : { width: rest.width as number, height: rest.height as number }}
      >
        <Icon name="image" size={24} />
      </span>
    );
  }

  return (
    <Image
      {...rest}
      src={url}
      alt={alt}
      className={className}
      unoptimized={unoptimized ?? remote}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
    />
  );
}
