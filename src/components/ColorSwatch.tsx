import Checkmark from '@react-spectrum/s2/icons/Checkmark'
import Copy from '@react-spectrum/s2/icons/Copy'
import { style } from '@react-spectrum/s2/style' with { type: 'macro' }
import type { Oklch } from 'culori'
import { useState } from 'react'
import classes from './ColorSwatch.module.css'

interface ColorSwatchProps {
  oklch: Oklch
  setSelectedColor: (color: Oklch | undefined) => void
  autoFocus?: boolean
}

export default function ColorSwatch({
  oklch,
  setSelectedColor,
  autoFocus,
}: ColorSwatchProps) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const value = `oklch(${oklch.l.toFixed(6)} ${oklch.c.toFixed(6)} ${oklch.h?.toFixed(4) ?? oklch.h})`
    await navigator.clipboard.writeText(value)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <button
      className={classes.container}
      style={{
        backgroundColor: `oklch(${oklch.l} ${oklch.c} ${oklch.h})`,
        borderColor: 'ButtonHighlight',
        borderWidth: '3px',
        borderStyle: 'solid',
      }}
      autoFocus={autoFocus}
      onFocus={() => setSelectedColor(oklch)}
      onBlur={() => setSelectedColor(undefined)}
      onClick={handleCopy}
      aria-label="Copy color swatch"
    >
      <div className={classes.copy}>
        <div
          className={style({
            backgroundColor: 'Background',
            width: 'full',
            height: 'full',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
          })}
        >
          {copied ? <Checkmark /> : <Copy />}
        </div>
      </div>
    </button>
  )
}
