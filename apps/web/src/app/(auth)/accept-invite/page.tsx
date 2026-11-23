import { AcceptInviteForm } from "@/components/auth/AcceptInviteForm";

export const metadata = {
  title: "Accept invitation | ProjectFlow",
};

export default async function AcceptInvitePage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string | string[] }>;
}) {
  const { token } = await searchParams;
  return <AcceptInviteForm token={Array.isArray(token) ? token[0] : token} />;
}
