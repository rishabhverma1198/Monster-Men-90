import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto py-6 px-4 md:px-6 flex justify-between items-center">
        <p className="text-sm text-muted-foreground">
          © {new Date().getFullYear()} MonserMens90. All rights reserved.
        </p>
        <Link href="/admin" className="text-sm text-muted-foreground hover:text-foreground">
          Admin
        </Link>
      </div>
    </footer>
  );
}
