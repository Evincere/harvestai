"use client"

import * as React from "react"
import * as TabsPrimitive from "@radix-ui/react-tabs"

import {
  Cloud,
  Home,
  Search,
  Settings,
  MapPin
} from "lucide-react"
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
      "relative flex h-10 items-center justify-center rounded-md bg-muted p-1 text-muted-foreground overflow-hidden w-full",
      className
    )}
    {...props}
  />
))
TabsList.displayName = TabsPrimitive.List.displayName

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, value, children, ...props }, ref) => {
  const isMobile = useIsMobile();
  const iconsMap: Record<string, React.ReactNode> = {
    general: <Home className="h-5 w-5" aria-label="General" />,
    preferences: <Settings className="h-5 w-5" aria-label="Preferencias" />,
    microscopic: <Search className="h-5 w-5" aria-label="Microscópico" />,
    climate: <Cloud className="h-5 w-5" aria-label="Clima" />,
    weather: <MapPin className="h-5 w-5" aria-label="Clima Real" />,
  };

  return (
    <TabsPrimitive.Trigger
      ref={ref}
      className={cn("flex items-center justify-center whitespace-nowrap rounded-sm px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-sm flex-1 min-h-[2.5rem] flex-shrink-0", isMobile ? "px-2" : "", className)}
      value={value}
      {...props}
    >
      {isMobile ? <>{iconsMap[value]}</> : <>{children}</>}
    </TabsPrimitive.Trigger>
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
