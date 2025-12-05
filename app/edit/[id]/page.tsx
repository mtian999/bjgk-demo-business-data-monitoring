import AlertForm from "@/components/alert-form"

interface EditPageProps {
  params: Promise<{ id: string }>
}

export default async function EditPage({ params }: EditPageProps) {
  const { id } = await params
  return <AlertForm id={id} />
}
