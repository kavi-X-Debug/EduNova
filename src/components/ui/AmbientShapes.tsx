/**
 * Very subtle decorative blobs behind page content. aria-hidden, pointer-events none, never carries information.
 * The parent must create a stacking context (`relative isolate`); shapes sit at z -10 and drift only when motion is allowed.
 */
export function AmbientShapes() {
  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
      <span className="fx-shape -right-16 top-24 h-72 w-72 bg-brand-500/[0.06]" />
      <span className="fx-shape -left-20 top-[55%] h-64 w-64 bg-accent-500/[0.07] [animation-delay:-4s]" />
      <span className="fx-shape bottom-10 right-[18%] h-48 w-48 bg-success-500/[0.06] [animation-delay:-8s]" />
    </div>
  );
}
