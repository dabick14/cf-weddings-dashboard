import { BrandScreen } from "./BrandScreen";

/** Shown when `k` is missing or the backend rejects it (401/403). Never renders the guest list. */
export function InvalidKeyScreen() {
  return (
    <BrandScreen heading="This link isn't quite right">
      <p>
        This link isn&rsquo;t valid or may have expired &mdash; check with CF Weddings for a fresh one.
      </p>
    </BrandScreen>
  );
}
