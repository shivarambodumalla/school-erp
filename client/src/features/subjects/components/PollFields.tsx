'use client'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  question: string
  setQuestion: (v: string) => void
  options: string[]
  addOption: () => void
  updateOption: (i: number, v: string) => void
}

export function PollFields({
  question,
  setQuestion,
  options,
  addOption,
  updateOption,
}: Props) {
  return (
    <div className="space-y-3">
      <div className="space-y-2">
        <Label>Poll Question</Label>
        <Input
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Question"
          className="min-h-[44px]"
        />
      </div>
      <div className="space-y-2">
        <Label>Options</Label>
        {options.map((opt, i) => (
          <Input
            key={i}
            value={opt}
            onChange={(e) =>
              updateOption(i, e.target.value)
            }
            placeholder={`Option ${i + 1}`}
            className="min-h-[44px]"
          />
        ))}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addOption}
          className="min-h-[44px]"
        >
          Add Option
        </Button>
      </div>
    </div>
  )
}
