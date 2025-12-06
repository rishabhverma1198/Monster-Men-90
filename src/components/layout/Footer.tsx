export default function Footer() {
  return (
    <footer className="border-t">
      <div className="container mx-auto py-6 px-4 md:px-6">
        <p className="text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} MonserMens90. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
