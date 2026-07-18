import { VerificationDetails } from "@/components/verification-details";

export const metadata = { title: "Verify Work Record | Kai" };

export default async function VerificationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <VerificationDetails recordId={id} />;
}
