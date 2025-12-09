
export default function FinishLoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // This layout doesn't need the standard admin sidebar,
  // so we just render the children directly.
  return <>{children}</>;
}

    