/// <reference types="google.maps" />
import { useEffect, useRef } from "react";

declare global {
  interface Window {
    google?: typeof google;
  }
}

const GOOGLE_MAPS_API_KEY = "AIzaSyCazL5Cqw90gNr2Kn28q3iXIfdwmI4Coss";

let scriptLoaded = false;
let scriptLoading = false;
const callbacks: (() => void)[] = [];

function loadGoogleMaps(): Promise<void> {
  if (scriptLoaded && window.google?.maps) return Promise.resolve();

  return new Promise((resolve) => {
    callbacks.push(resolve);
    if (scriptLoading) return;
    scriptLoading = true;

    const script = document.createElement("script");
    script.src = `https://maps.googleapis.com/maps/api/js?key=${GOOGLE_MAPS_API_KEY}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      scriptLoaded = true;
      callbacks.forEach((cb) => cb());
      callbacks.length = 0;
    };
    document.head.appendChild(script);
  });
}

interface GoogleMapProps {
  location: string;
  className?: string;
}

const GoogleMap = ({ location, className = "" }: GoogleMapProps) => {
  const mapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: google.maps.Map | null = null;

    loadGoogleMaps().then(() => {
      if (!mapRef.current || !window.google?.maps) return;

      const geocoder = new google.maps.Geocoder();
      geocoder.geocode({ address: location }, (results, status) => {
        if (status === "OK" && results?.[0] && mapRef.current) {
          const pos = results[0].geometry.location;
          map = new google.maps.Map(mapRef.current, {
            center: pos,
            zoom: 14,
            disableDefaultUI: true,
            zoomControl: true,
            styles: [
              { featureType: "poi", stylers: [{ visibility: "simplified" }] },
            ],
          });
          new google.maps.Marker({ position: pos, map });
        }
      });
    });

    return () => {
      map = null;
    };
  }, [location]);

  return <div ref={mapRef} className={`w-full h-full rounded-xl ${className}`} />;
};

export { loadGoogleMaps, GOOGLE_MAPS_API_KEY };
export default GoogleMap;
