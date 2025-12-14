"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface FadeImageProps extends Omit<ImageProps, 'onLoad'> {
  fallback?: string;
}

export default function FadeImage({ fallback = "/music.gif", ...props }: FadeImageProps) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [hasError, setHasError] = useState(false);

  return (
    <div className="relative w-full h-full">
      {!isLoaded && (
        <div className="absolute inset-0 skeleton rounded-lg"></div>
      )}
      <Image
        {...props}
        alt={props.alt || ""}
        src={hasError ? fallback : props.src}
        className={`${props.className} image-fade ${isLoaded ? "loaded" : ""}`}
        onLoad={() => setIsLoaded(true)}
        onError={() => {
          setHasError(true);
          setIsLoaded(true);
        }}
      />
    </div>
  );
}