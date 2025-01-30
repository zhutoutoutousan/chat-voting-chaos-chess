import { IconMessage, IconUsers, IconTrophy, IconCalendarEvent } from "@tabler/icons-react";
import { HoverEffect } from "@/components/ui/card-hover-effect";
import { Spotlight } from "@/components/ui/spotlight";
import { ConstructionNotice } from "@/components/ui/construction-notice"

const features = [
  {
    title: "Forums",
    description: "Join discussions about strategies, openings, and chess news",
    icon: <IconMessage className="w-6 h-6 text-amber-500" />,
    link: "#forums"
  },
  {
    title: "Study Groups",
    description: "Find or create study groups to improve together",
    icon: <IconUsers className="w-6 h-6 text-amber-500" />,
    link: "#groups"
  },
  {
    title: "Tournaments",
    description: "Participate in regular tournaments and climb the leaderboard",
    icon: <IconTrophy className="w-6 h-6 text-amber-500" />,
    link: "#tournaments"
  },
  {
    title: "Events",
    description: "Join online meetups, workshops, and chess events",
    icon: <IconCalendarEvent className="w-6 h-6 text-amber-500" />,
    link: "#events"
  }
];

export default function CommunityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold text-amber-700 dark:text-amber-300 mb-4">
          Chess Community
        </h1>
        <p className="text-white dark:text-neutral-200 text-lg">
          Connect, learn, and compete with chess players worldwide
        </p>
      </div>

      <HoverEffect items={features} />

      <Spotlight className="mt-12 p-6">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">Active Members</h2>
        <div className="flex flex-wrap gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700">
              <div className="w-10 h-10 rounded-full bg-amber-200 dark:bg-amber-700" />
              <div>
                <div className="font-medium text-neutral-800 dark:text-neutral-100">Player {i + 1}</div>
                <div className="text-sm text-neutral-600 dark:text-neutral-300">Rating: {1500 + i * 100}</div>
              </div>
            </div>
          ))}
        </div>
      </Spotlight>

      <Spotlight className="mt-12 p-6">
        <h2 className="text-2xl font-semibold text-neutral-800 dark:text-neutral-100 mb-6">Recent Activity</h2>
        <div className="space-y-4">
          {[
            "Player1 won a tournament!",
            "New study group: Advanced Endgames",
            "Upcoming Event: Weekend Rapid Tournament",
            "Forum: Discussion on Sicilian Defense",
          ].map((activity, i) => (
            <div key={i} className="flex items-center gap-4 p-3 rounded-lg bg-neutral-100 dark:bg-neutral-700">
              <div className="w-2 h-2 rounded-full bg-amber-500" />
              <div className="text-neutral-700 dark:text-neutral-200">{activity}</div>
            </div>
          ))}
        </div>
      </Spotlight>

      <ConstructionNotice />
    </div>
  );
} 