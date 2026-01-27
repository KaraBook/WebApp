import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function QuantityBox({ value = 0, onChange, min = 0, max = 999 }) {
  const num = Number(value) || 0

  const handleDecrease = () => {
    onChange(Math.max(num - 1, min))
  }

  const handleIncrease = () => {
    onChange(Math.min(num + 1, max))
  }

  const handleInputChange = (e) => {
    const val = e.target.value

    if (val === "") {
      onChange("")
      return
    }

    const n = Number(val)
    if (!isNaN(n)) {
      onChange(Math.min(Math.max(n, min), max))
    }
  }

  return (
    <div className="flex items-center gap-2">
      <Button type="button" size="icon" onClick={handleDecrease}>
        −
      </Button>

      <Input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={handleInputChange}
        className="w-14 h-9 text-center no-spinner"
      />

      <Button type="button" size="icon" onClick={handleIncrease}>
        +
      </Button>
    </div>
  )
}