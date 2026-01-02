import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function QuantityBox({ value, onChange, min = 0, max = 999 }) {
  const handleDecrease = () => {
    onChange(Math.max((parseInt(value) || 0) - 1, min))
  }

  const handleIncrease = () => {
    onChange(Math.min((parseInt(value) || 0) + 1, max))
  }

  const handleInputChange = (e) => {
    const val = e.target.value
    if (/^\d{0,3}$/.test(val)) {
      onChange(val === "" ? "" : parseInt(val))
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        type="button"
        variant="outline"
        size="icon"
        className="bg-transparent w-8 h-7 p-[16px]"
        onClick={handleDecrease}
      >
        −
      </Button>

      <Input
        type="number"
        value={value}
        onChange={handleInputChange}
        className="w-12 h-7 text-center no-spinner p-[16px]"
      />

      <Button
        type="button"
        variant="outline"
        size="icon"
        className="bg-transparent w-8 h-7 p-[16px]"
        onClick={handleIncrease}
      >
        +
      </Button>
    </div>
  )
}
