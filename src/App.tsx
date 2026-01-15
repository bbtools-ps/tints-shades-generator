import {
  ActionButton,
  Button,
  CloseButton,
  CustomDialog,
  DialogTrigger,
  Form,
  Heading,
  Link,
  Picker,
  PickerItem,
  TextField,
} from '@react-spectrum/s2';
import ExportTo from '@react-spectrum/s2/icons/ExportTo';
import { style } from '@react-spectrum/s2/style' with { type: 'macro' };
import { converter, formatHex, parse, type Oklch } from 'culori';
import { useState } from 'react';
import ColorSwatch from './components/ColorSwatch';

const STEPS = [
  { id: 1, name: '1' },
  { id: 2, name: '2' },
  { id: 3, name: '3' },
  { id: 4, name: '4' },
  { id: 5, name: '5' },
];
const DEFAULT_STEPS = 5;
const DEFAULT_BASE_COLOR = '#ad0770';

function generateTintsAndShades(baseColor: string, steps: number) {
  const parsedColor = parse(baseColor);
  const oklchColor = converter('oklch')(parsedColor);

  if (!oklchColor) {
    throw new Error('Invalid color');
  }

  const { l, c, h } = oklchColor;

  function generateScale(count: number, isTint: boolean) {
    return Array.from({ length: count }).map((_, i) => {
      const factor = (i + 1) / (count + 1);
      const newL = isTint ? l + (1 - l) * factor : l * (1 - factor);

      const colorObj = {
        mode: 'oklch' as const,
        l: newL,
        c: c * (1 - factor),
        h,
      };

      return {
        oklch: colorObj,
        lightness: Math.round(newL * 100),
      };
    });
  }

  return {
    base: {
      oklch: converter('oklch')(baseColor),
      hex: formatHex(converter('rgb')(baseColor)),
      hsl: converter('hsl')(baseColor),
    },
    tints: generateScale(steps, true),
    shades: generateScale(steps, false).reverse(),
  };
}

type Result = ReturnType<typeof generateTintsAndShades>;

export default function App() {
  const [result, setResult] = useState<Result>(() =>
    generateTintsAndShades(DEFAULT_BASE_COLOR, DEFAULT_STEPS)
  );

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const color = formData.get('baseColor') as string;
    const steps = formData.get('steps') as string;

    setResult(generateTintsAndShades(color, parseInt(steps)));
  };

  return (
    <>
      <main
        className={style({
          flexGrow: 1,
          width: 'full',
          display: 'flex',
          alignItems: 'center',
          flexDirection: 'column',
          gap: 'text-to-control',
        })}
      >
        <h1 className={style({ font: 'heading-2xl' })}>
          Tints & Shades Generator
        </h1>
        <p className={style({ font: 'body' })}>
          Create tints and shades from a base color using OKLCH color space.
        </p>
        <Form onSubmit={handleSubmit}>
          <TextField
            name="baseColor"
            label="Base Color"
            errorMessage="Please enter a valid base color"
            placeholder="Enter hex, rgb, hsl, oklch..."
            validate={(value) => (parse(value) ? null : 'Invalid color')}
            defaultValue={DEFAULT_BASE_COLOR}
          />
          <Picker
            name="steps"
            label="Steps"
            items={STEPS}
            defaultValue={DEFAULT_STEPS}
          >
            {(item) => <PickerItem>{item.name}</PickerItem>}
          </Picker>
          <div className={style({ margin: 'auto' })}>
            <Button type="submit" size="L">
              Generate
            </Button>
          </div>
        </Form>
        {result && <Results key={JSON.stringify(result)} result={result} />}
      </main>
      <footer className={style({ margin: 'text-to-control', font: 'body' })}>
        <p>
          <span
            className={style({ marginEnd: 'text-to-visual' })}
          >{`© ${new Date().getFullYear()}.`}</span>
          <Link href="https://bogdan-bogdanovic.com/" rel="noopener noreferrer">
            Bogdan Bogdanovic
          </Link>
        </p>
      </footer>
    </>
  );
}

interface ResultsProps {
  result: Result;
}

function formatAsCSS(result: Result): string {
  let css = ':root {\n';

  // Shades
  css += '  /* Shades */\n';
  result.shades.forEach((shade, i) => {
    const { l, c, h } = shade.oklch;
    css += `  --shade-${result.shades.length - i}: oklch(${l.toFixed(6)} ${c.toFixed(6)} ${h?.toFixed(4) ?? h});\n`;
  });

  // Base Color
  css += '\n  /* Base Color */\n';
  const { l, c, h } = result.base.oklch!;
  css += `  --base-color: oklch(${l.toFixed(6)} ${c.toFixed(6)} ${h?.toFixed(4) ?? h});\n`;

  // Tints
  css += '\n  /* Tints */\n';
  result.tints.forEach((tint, i) => {
    const { l: tl, c: tc, h: th } = tint.oklch;
    css += `  --tint-${i + 1}: oklch(${tl.toFixed(6)} ${tc.toFixed(6)} ${th?.toFixed(4) ?? th});\n`;
  });

  css += '}\n';
  return css;
}

function Results({ result }: ResultsProps) {
  const [selectedColor, setSelectedColor] = useState<Oklch | undefined>(
    result.base.oklch!
  );

  return (
    <div
      className={style({
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        margin: 'text-to-control',
      })}
    >
      <div className={style({ alignSelf: 'end' })}>
        <DialogTrigger>
          <ActionButton aria-label="Export palette">
            <ExportTo />
          </ActionButton>
          <ExportDialog result={result} />
        </DialogTrigger>
      </div>
      <div
        className={style({
          display: 'flex',
          marginBottom: 'text-to-control',
          alignItems: 'center',
          justifyContent: 'center',
          flexWrap: 'wrap',
        })}
      >
        {/* Shades Section */}
        <div
          className={style({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: 'text-to-control',
          })}
        >
          <h2
            className={style({
              font: 'body-sm',
              margin: 'unset',
              fontWeight: 'bold',
              color: 'gray-700',
            })}
          >
            Shades
          </h2>
          <div
            className={style({
              display: 'flex',
              gap: 'text-to-control',
            })}
          >
            {result.shades.map((shade, i) => (
              <ColorSwatch
                key={`shade-${i}`}
                oklch={shade.oklch}
                setSelectedColor={setSelectedColor}
              />
            ))}
          </div>
        </div>

        {/* Base Color Section */}
        <div
          className={style({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: 'text-to-control',
          })}
        >
          <h2
            className={style({
              font: 'body-sm',
              margin: 'unset',
              fontWeight: 'bold',
              color: 'gray-700',
            })}
          >
            Base Color
          </h2>
          <ColorSwatch
            oklch={result.base.oklch!}
            setSelectedColor={setSelectedColor}
            autoFocus
          />
        </div>

        {/* Tints Section */}
        <div
          className={style({
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            margin: 'text-to-control',
          })}
        >
          <h2
            className={style({
              font: 'body-sm',
              margin: 'unset',
              fontWeight: 'bold',
              color: 'gray-700',
            })}
          >
            Tints
          </h2>
          <div
            className={style({
              display: 'flex',
              gap: 'text-to-control',
            })}
          >
            {result.tints.map((tint, i) => (
              <ColorSwatch
                key={`tint-${i}`}
                oklch={tint.oklch}
                setSelectedColor={setSelectedColor}
              />
            ))}
          </div>
        </div>
      </div>

      {selectedColor && (
        <div
          className={style({
            font: 'body',
            display: 'flex',
            flexDirection: 'column',
            gap: 'text-to-visual',
            textAlign: 'start',
          })}
        >
          <div
            className={style({
              display: 'flex',
              alignItems: 'center',
              gap: 'text-to-visual',
            })}
          >
            <p
              className={style({
                margin: 'unset',
                fontWeight: 'bold',
                textTransform: 'capitalize',
              })}
            >
              Selected Color:
            </p>
            <div>{`oklch(${selectedColor.l.toFixed(6)} ${selectedColor.c.toFixed(6)} ${selectedColor.h?.toFixed(4) ?? selectedColor.h})`}</div>
          </div>
        </div>
      )}
    </div>
  );
}

function ExportDialog({ result }: ResultsProps) {
  const [isCopied, setIsCopied] = useState(false);
  const css = formatAsCSS(result);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(css);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2000);
  };

  return (
    <CustomDialog>
      <div
        className={style({
          display: 'flex',
          flexDirection: 'column',
          rowGap: 8,
          alignItems: 'center',
        })}
      >
        <Heading
          slot="title"
          styles={style({
            font: 'heading-lg',
            textAlign: 'center',
            marginY: 0,
          })}
        >
          Export CSS Variables
        </Heading>
        <pre
          className={style({
            font: 'code',
            backgroundColor: 'ButtonFace',
            padding: 'text-to-visual',
            borderRadius: 'default',
            overflow: 'auto',
            width: 'full',
            margin: 0,
            textAlign: 'start',
          })}
        >
          {css}
        </pre>
        <CloseButton
          styles={style({
            position: 'absolute',
            top: 12,
            insetEnd: 12,
          })}
        />
        <ActionButton onPress={handleCopy}>
          {isCopied ? 'Copied!' : 'Copy to Clipboard'}
        </ActionButton>
      </div>
    </CustomDialog>
  );
}
