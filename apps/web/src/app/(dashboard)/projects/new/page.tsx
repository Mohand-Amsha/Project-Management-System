import { redirect } from "next/navigation";

// Projects are created from the "New Project" dialog on the projects list.
export default function NewProjectPage() {
  redirect("/projects");
}
