import { BrandScreen } from "@/components/BrandScreen";

export default function NotFound() {
  return (
    <BrandScreen heading="We couldn't find this page">
      <p>
        The link you followed doesn&rsquo;t match a page we have. Double-check the address, or reach out to CF
        Weddings and we&rsquo;ll help you find it.
      </p>
    </BrandScreen>
  );
}
