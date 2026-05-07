import SrtRunner from "@/features/assessment/components/SrtRunner";
import { getSrtMissionById } from "@/features/assessment/data/assessment-content";
import { redirect } from "next/navigation";

export default async function SrtMissionRoute({ params }) {
  const resolvedParams = await params;
  const mission = getSrtMissionById(resolvedParams.mission);

  if (!mission) {
    redirect("/dashboard/srt");
  }

  return <SrtRunner mission={mission} />;
}
