/**
 * RavenIcon — hand-crafted SVG raven in profile (24 × 24 viewBox).
 * Facing right, perched. Eye is punched out via evenodd fill rule.
 * Designed to match the Nord maritime RavenLedger brand.
 */
export default function RavenIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d={[
          // Outer silhouette (clockwise)
          "M14 4",
          "C17 2.5 21 4 22 6.5",
          "L23.5 7.5",
          "L22 9.5",
          "C20.5 10 19.5 10.5 20 12",
          "C21 14.5 21 18 19 21",
          "C17.5 23 13.5 24.5 10.5 23",
          "C8.5 22 8.5 20.5 10 20",
          "C11.5 19.5 13.5 19 14 18",
          "C13.5 16.5 13 14 12 13",
          "C9.5 11.5 7 12.5 7 14.5",
          "C6.5 12 7.5 9 10 7.5",
          "C12 6 13.5 4.5 14 4",
          "Z",
          // Eye hole (counter-clockwise so evenodd punches it out)
          "M20.4 7",
          "a0.9 0.9 0 1 1 -1.8 0",
          "a0.9 0.9 0 0 1 1.8 0",
          "Z",
        ].join(" ")}
      />
    </svg>
  );
}
