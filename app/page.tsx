import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Topbar } from "@/components/layout/topbar";
import Link from "next/link";

export default function HomePage() {
  return (
    <>
      <Topbar authenticated={false} />
      <main className="min-h-screen flex flex-col items-center px-4 py-16">
        <section className="mb-20 max-w-3xl text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">tsdevstack</h1>
          <p className="text-2xl sm:text-3xl font-bold mb-2">
            Infrastructure as Framework
          </p>
          <p className="text-lg sm:text-xl text-muted-foreground mb-2">
            Full-stack, cloud-native, AI-native TypeScript microservices.
          </p>
          <p className="text-muted-foreground mb-8">
            From zero to production in an hour, not months.
          </p>
          <div className="flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="/login">Get Started</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a
                href="https://github.com/tsdevstack"
                target="_blank"
                rel="noopener noreferrer"
              >
                GitHub
              </a>
            </Button>
          </div>
        </section>

        <section className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl w-full mb-20">
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">Type-Safe APIs</h3>
              <p className="text-sm text-muted-foreground">
                OpenAPI specs auto-generate TypeScript clients. End-to-end type
                safety from database to frontend.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">
                Auth Out of the Box
              </h3>
              <p className="text-sm text-muted-foreground">
                JWT authentication, email confirmation, password reset, bot
                detection, and HttpOnly cookie tokens — ready to go.
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold mb-2">One-Command Deploy</h3>
              <p className="text-sm text-muted-foreground">
                Deploy to GCP, AWS, or Azure with Kong gateway, load balancing,
                SSL certificates, and secrets management.
              </p>
            </CardContent>
          </Card>
        </section>

        <section className="max-w-2xl w-full text-center mb-16">
          <h2 className="text-2xl font-bold mb-6">Links</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <a
              href="https://tsdevstack.dev"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <span className="font-medium block mb-1">Documentation</span>
              <span className="text-muted-foreground">
                Guides, API reference, and tutorials
              </span>
            </a>
            <a
              href="https://github.com/tsdevstack"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <span className="font-medium block mb-1">GitHub</span>
              <span className="text-muted-foreground">
                Source code, issues, and contributions
              </span>
            </a>
            <a
              href="https://www.npmjs.com/org/tsdevstack"
              target="_blank"
              rel="noopener noreferrer"
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <span className="font-medium block mb-1">npm</span>
              <span className="text-muted-foreground">
                Published packages and installation
              </span>
            </a>
            <Link
              href="/login"
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <span className="font-medium block mb-1">Login</span>
              <span className="text-muted-foreground">
                Sign in to your account
              </span>
            </Link>
            <Link
              href="/signup"
              className="p-4 border rounded-lg hover:bg-muted/50 transition-colors text-left"
            >
              <span className="font-medium block mb-1">Sign Up</span>
              <span className="text-muted-foreground">
                Create a new account
              </span>
            </Link>
          </div>
        </section>

        <footer className="text-sm text-muted-foreground">
          Convention over configuration — strict patterns for type safety and
          developer productivity.
        </footer>
      </main>
    </>
  );
}
