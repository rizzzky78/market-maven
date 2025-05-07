import {
  AlertCircle,
  CircleCheckBig,
  Clock,
  MessageSquare,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Link from "next/link";
import { ReactNode } from "react";

export function ContentRegister() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl font-[family-name:var(--font-khand)]">
      <div className="text-center mb-8 py-32">
        <h1 className="text-3xl font-bold tracking-tight mb-2">
          Register to <span className="text-purple-500">Maven</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          A demonstration AI assistant showcasing product research with ease
        </p>
      </div>

      <Card className="bg-background mb-8 rounded-3xl">
        <CardHeader className="">
          <CardTitle className="flex items-center gap-2">
            <AlertCircle className="h-5 w-5 text-purple-500" />
            <span className="text-lg text-black/90 dark:text-white/90">
              Demo Application
            </span>
          </CardTitle>
          <CardDescription>
            Important information about Maven AI
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <p className="mb-4 text-sm text-black/90 dark:text-white/90">
            Maven AI is a demonstration application built for a developer
            portfolio. It&apos;s designed to showcase AI capabilities but is not
            intended for production use yet.
          </p>
          <div className="grid gap-6 md:grid-cols-2 mt-6">
            <FeatureCard
              icon={<MessageSquare className="h-5 w-5 text-purple-500" />}
              title="Limited Conversations"
              description="Conversations are limited in length to provide a preview experience."
            />
            <FeatureCard
              icon={<Clock className="h-5 w-5 text-purple-500" />}
              title="Daily Request Limit"
              description="A daily cap on requests helps maintain service availability for all users."
            />
            <FeatureCard
              icon={<Zap className="h-5 w-5 text-purple-500" />}
              title="Preview Experience"
              description="Experience core AI features in a controlled environment."
            />
            <FeatureCard
              icon={<AlertCircle className="h-5 w-5 text-purple-500" />}
              title="Developer Showcase"
              description="This application demonstrates technical capabilities rather than offering a full service."
            />
          </div>
        </CardContent>
      </Card>

      <div className="bg-purple-500/5 rounded-3xl p-6 border border-purple-500/20">
        <h2 className="text-lg font-semibold mb-4">What to Expect</h2>
        <ul className="space-y-2 mb-6 *:text-sm">
          <li className="flex items-start gap-2">
            <div className="h-5 w-5 mt-0.5 rounded-full flex items-center justify-center text-white text-xs">
              <CircleCheckBig className="size-5 text-purple-500" />
            </div>
            <span>Access to all available Agentic tools</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="h-5 w-5 mt-0.5 rounded-full flex items-center justify-center text-white text-xs">
              <CircleCheckBig className="size-5 text-purple-500" />
            </div>
            <span>
              Ability to test and explore the system&apos;s capabilities
            </span>
          </li>
          <li className="flex items-start gap-2">
            <div className="h-5 w-5 mt-0.5 rounded-full flex items-center justify-center text-white text-xs">
              <CircleCheckBig className="size-5 text-purple-500" />
            </div>
            <span>A glimpse into modern AI assistant technology</span>
          </li>
          <li className="flex items-start gap-2">
            <div className="h-5 w-5 mt-0.5 rounded-full flex items-center justify-center text-white text-xs">
              <CircleCheckBig className="size-5 text-purple-500" />
            </div>
            <span>Reasonable usage limits to ensure fair access for all</span>
          </li>
        </ul>
      </div>
      <div className="mb-[30vh] flex flex-col sm:flex-row gap-4 justify-center mt-8">
        <Button className="rounded-3xl text-white bg-purple-500 hover:bg-purple-600">
          <Link href={"/login"}>Continue to Registration</Link>
        </Button>
        <Button
          variant="outline"
          className="rounded-3xl border-purple-500 text-purple-500 hover:bg-purple-500/10"
        >
          <Link href="/cookbook">Learn More</Link>
        </Button>
      </div>
    </div>
  );
}

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="border rounded-2xl p-4 border-purple-500/20">
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <h3 className="font-medium text-black/90 dark:text-white/90">
          {title}
        </h3>
      </div>
      <p className="text-sm text-muted-foreground">{description}</p>
    </div>
  );
}
