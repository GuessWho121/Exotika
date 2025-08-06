interface CategoryHeaderProps {
  title: string
  description: string
}

export function CategoryHeader({ title, description }: CategoryHeaderProps) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-6 p-4 md:flex-row">
      <div className="min-w-0 flex-1">
        <h2 className="mb-3 text-3xl font-bold leading-tight tracking-tight text-[#4A3F00] sm:text-4xl">{title}</h2>
        <p className="text-sm font-normal leading-relaxed text-[#8C7B00] sm:text-base">{description}</p>
      </div>
    </div>
  )
}
