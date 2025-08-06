import { ChevronLeft, ChevronRight } from "lucide-react"

export function Pagination() {
  return (
    <div className="mt-10 flex items-center justify-center gap-2">
      <button className="rounded-md p-2 text-[#8C7B00] transition-colors hover:bg-[#FFFBEB] hover:text-[#FFDE59]">
        <ChevronLeft className="h-5 w-5" />
      </button>

      <button className="min-w-10 rounded-md bg-[#FFDE59] p-2 text-center text-sm font-semibold text-[#4A3F00]">
        1
      </button>
      <button className="min-w-10 rounded-md p-2 text-center text-sm font-medium text-[#8C7B00] transition-colors hover:bg-[#FFFBEB] hover:text-[#FFDE59]">
        2
      </button>
      <button className="min-w-10 rounded-md p-2 text-center text-sm font-medium text-[#8C7B00] transition-colors hover:bg-[#FFFBEB] hover:text-[#FFDE59]">
        3
      </button>

      <span className="text-[#8C7B00]">...</span>

      <button className="min-w-10 rounded-md p-2 text-center text-sm font-medium text-[#8C7B00] transition-colors hover:bg-[#FFFBEB] hover:text-[#FFDE59]">
        8
      </button>

      <button className="rounded-md p-2 text-[#8C7B00] transition-colors hover:bg-[#FFFBEB] hover:text-[#FFDE59]">
        <ChevronRight className="h-5 w-5" />
      </button>
    </div>
  )
}
