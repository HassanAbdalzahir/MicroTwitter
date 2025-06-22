"use client";

import { useState } from "react";
import CreatePost from "../components/CreatePost";
import Feed from "../components/Feed";

export default function Home() {
  const [refresh, setRefresh] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="space-y-8">
          <CreatePost onPost={() => setRefresh((r) => r + 1)} />
          <Feed refresh={refresh} />
        </div>
      </div>
    </div>
  );
}
