import PublicLayout from "../public-layout";

export default function ProductsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <PublicLayout>{children}</PublicLayout>;
}
