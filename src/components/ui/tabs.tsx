"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import {
  CloudIcon,
  EyeIcon,
  HomeIcon,
  SettingsIcon,
  SunIcon,
} from "@/components/icons"
import { useIsMobile } from "@/hooks/use-mobile";

import { cn } from "@/lib/utils"

const Tabs = TabsPrimitive.Root

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    className={cn(
      "flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground overflow-hidden w-full",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<"div">,
  React.ComponentPropsWithoutRef<"div">
>(({ className, ...props }, ref) => {
  const isMobile = useIsMobile();
  const iconsMap: Record<string, React.ReactNode> = {
    General: <HomeIcon className="h-5 w-5" aria-label="General" />,
    Preferencias: <SettingsIcon className="h-5 w-5" aria-label="Preferencias" />,
    Microscópico: <EyeIcon className="h-5 w-5" aria-label="Microscópico" />,
    Clima: <CloudIcon className="h-5 w-5" aria-label="Clima" />,
    "Clima Real": <SunIcon className="h-5 w-5" aria-label="Clima Real" />,
  };
  return (
    <div ref={ref} className={cn("flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex-1 min-h-[2.5rem] flex-shrink-0", isMobile ? "px-2" : "", className)} {...props}>
      {isMobile ? <div className="h-5 w-5">{iconsMap[props.value as string]}</div> : <div>{props.children}</div>}
    </div>
  );
});
TabsTrigger.displayName = "TabsTrigger";

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    className={cn(
      "mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
      className
    )}
    {...props}
  />
))
TabsContent.displayName = TabsPrimitive.Content.displayName

export { Tabs, TabsList, TabsTrigger, TabsContent }

