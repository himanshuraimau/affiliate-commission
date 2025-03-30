import Link from "next/link";
import Image from "next/image";

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col w-full">
      {/* Navigation */}
      <header className="border-b border-border w-full">
        <div className="w-full px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold text-primary">
              <a href="/">Affiliate Pro</a>
              </h1>
          </div>
          <div className="flex items-center gap-4">
            <Link 
              href="/login" 
              className="text-sm font-medium text-primary hover:text-primary/80"
            >
              Log in
            </Link>
            <Link 
              href="/signup" 
              className="px-4 py-2 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90"
            >
              Sign up
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 text-center w-full">
        <div className="w-full max-w-[80%] space-y-6">
          <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight">
            Your Complete <span className="text-blue-600">Affiliate Commission</span> Solution
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground mx-auto">
            A comprehensive platform for managing affiliate partnerships, tracking conversions, 
            processing payments, and analyzing performance.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
            <Link 
              href="/signup" 
              className="w-full sm:w-auto px-8 py-3 text-black bg-primary rounded-md font-medium hover:bg-primary/90"
            >
              Get Started
            </Link>
            <Link 
              href="/login" 
              className="w-full sm:w-auto px-8 py-3 border border-border rounded-md font-medium hover:bg-secondary"
            >
              Log in
            </Link>
          </div>
        </div>
        <div className="mt-16 relative w-full max-w-[80%]">
          <Image 
            src="/image.png" 
            alt="Affiliate Pro Dashboard" 
            width={1920} 
            height={1080}
            className="rounded-lg shadow-xl w-full h-auto"
            priority
          />
        </div>
      </section>
    </div>
  );
}

