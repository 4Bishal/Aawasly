"use client";
import { useEffect, useRef, useState } from "react";
import { MapPin } from "lucide-react";
import { useTheme } from "next-themes";
import type { Map as MapTilerMap } from "@maptiler/sdk";
import type { Geometry } from "@/types";
import { publicEnv } from "@/lib/env.client";
export function PropertyMap({
  geometry,
  location,
  country,
}: {
  geometry: Geometry;
  location: string;
  country: string;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<MapTilerMap | null>(null);
  const { resolvedTheme } = useTheme();
  const darkRef = useRef(false);
  darkRef.current = resolvedTheme === "dark";
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const key = publicEnv.NEXT_PUBLIC_MAPTILER_KEY;
  const longitude = geometry?.coordinates?.[0];
  const latitude = geometry?.coordinates?.[1];
  useEffect(() => {
    if (!key || longitude === undefined || latitude === undefined) return;
    let cancelled = false;
    let map: MapTilerMap | undefined;
    void import("@maptiler/sdk")
      .then((sdk) => {
        if (cancelled || !container.current) return;
        sdk.config.apiKey = key;
        map = new sdk.Map({
          container: container.current,
          style: darkRef.current
            ? sdk.MapStyle.STREETS.DARK
            : sdk.MapStyle.STREETS,
          center: [longitude, latitude],
          zoom: 12,
        });
        mapRef.current = map;
        new sdk.Marker({ color: "#e9674e" })
          .setLngLat([longitude, latitude])
          .addTo(map);
        map.on("load", () => {
          if (!cancelled) setReady(true);
        });
        map.on("error", () => {
          if (!cancelled) setFailed(true);
        });
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
      mapRef.current = null;
      map?.remove();
    };
  }, [key, longitude, latitude]);
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    let cancelled = false;
    void import("@maptiler/sdk")
      .then((sdk) => {
        if (!cancelled && mapRef.current === map)
          map.setStyle(
            resolvedTheme === "dark"
              ? sdk.MapStyle.STREETS.DARK
              : sdk.MapStyle.STREETS,
          );
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, [resolvedTheme]);
  const unavailable =
    !key || longitude === undefined || latitude === undefined || failed;
  return (
    <section className="border-t border-border pt-8">
      <h2 className="text-2xl font-semibold tracking-tight">
        A little look around
      </h2>
      <p className="mb-5 mt-2 text-sm text-muted-foreground">
        {location}, {country}
      </p>
      <div className="relative h-80 overflow-hidden rounded-3xl border border-border bg-muted">
        <div
          ref={container}
          className="h-full w-full"
          aria-label={`Map of ${location}, ${country}`}
        />
        {(unavailable || !ready) && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-muted text-sm text-muted-foreground">
            <MapPin className="size-7 text-primary" />
            <p>
              {unavailable
                ? "Interactive map is currently unavailable"
                : "Finding your place…"}
            </p>
            <span>
              {location}, {country}
            </span>
          </div>
        )}
      </div>
    </section>
  );
}
