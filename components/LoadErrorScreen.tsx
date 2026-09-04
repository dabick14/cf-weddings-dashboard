import { BrandScreen } from "./BrandScreen";

/** Shown on network/5xx failures from the backend — never a stack trace. */
export function LoadErrorScreen() {
  return (
    <BrandScreen heading="We're having trouble loading your guests">
      <p>
        This is usually just a moment&rsquo;s hiccup.{" "}
        <a href="." className="underline decoration-rosewood/40 underline-offset-2 hover:text-ink">
          Try again
        </a>
        .
      </p>
    </BrandScreen>
  );
}
