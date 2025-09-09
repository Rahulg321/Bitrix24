import { auth } from "@/auth";
import { Button } from "@/components/ui/button";
import { ArrowRight, Search } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

const Home = async () => {
  const userSession = await auth();

  if (!userSession) redirect("/auth/login");

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container relative z-10 mx-auto px-4 py-24 sm:py-32">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="mb-6 text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white sm:text-5xl md:text-6xl">
              Dark Alpha Capital
              <span className="mt-2 block text-gray-600 dark:text-gray-300">
                Deal Origination
              </span>
            </h1>
            <p className="mb-10 text-xl text-gray-600 dark:text-gray-400">
              Streamline your deal flow management with AI-powered insights and
              efficient processes.
            </p>
            <div className="flex flex-col justify-center gap-4 sm:flex-row">
              <Button
                className="transform rounded-full px-8 py-6 font-semibold shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
                asChild
              >
                <Link href="/raw-deals">
                  Explore Raw Deals
                  <Search className="ml-2 inline-block h-5 w-5" />
                </Link>
              </Button>
              <Button
                className="transform rounded-full px-8 py-6 font-semibold shadow-lg transition-all duration-300 hover:-translate-y-1 hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-opacity-75"
                variant="secondary"
                asChild
              >
                <Link href="/import">
                  Add New Deal
                  <ArrowRight className="ml-2 inline-block h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
