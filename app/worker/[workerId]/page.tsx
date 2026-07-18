import { WorkerProfile } from "@/components/worker-profile";

export default async function WorkerProfilePage({ params }: { params: Promise<{ workerId: string }> }) { const { workerId } = await params; return <WorkerProfile workerId={workerId} />; }
