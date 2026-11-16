/**
 * typecn — typography that moves.
 * Every effect is an independent module; import only what you use.
 */
export {
  easings,
  springEasing,
  resolveEasing,
  splitText,
  Split,
  Root,
  useReducedMotion,
  useInView,
  useTrigger,
  useFrame,
  usePointer,
  useScrollProgress,
} from "./core";
export type { Trigger, TextEffectProps, TimedEffectProps, ContinuousEffectProps, EasingName, CharInfo } from "./core";

export { AsciiTransform } from "./effects/ascii-transform";
export type { AsciiTransformProps } from "./effects/ascii-transform";
export { BlurResolve } from "./effects/blur-resolve";
export type { BlurResolveProps } from "./effects/blur-resolve";
export { BreathingType } from "./effects/breathing-type";
export type { BreathingTypeProps } from "./effects/breathing-type";
export { CharacterCascade } from "./effects/character-cascade";
export type { CharacterCascadeProps } from "./effects/character-cascade";
export { CharacterExplosion } from "./effects/character-explosion";
export type { CharacterExplosionProps } from "./effects/character-explosion";
export { CharacterTracking } from "./effects/character-tracking";
export type { CharacterTrackingProps } from "./effects/character-tracking";
export { ChromaticSplit } from "./effects/chromatic-split";
export type { ChromaticSplitProps } from "./effects/chromatic-split";
export { CursorRepel } from "./effects/cursor-repel";
export type { CursorRepelProps } from "./effects/cursor-repel";
export { DepthType } from "./effects/depth-type";
export type { DepthTypeProps } from "./effects/depth-type";
export { DirectionalReveal } from "./effects/directional-reveal";
export type { DirectionalRevealProps } from "./effects/directional-reveal";
export { EditorialSplit } from "./effects/editorial-split";
export type { EditorialSplitProps } from "./effects/editorial-split";
export { ElasticDistortion } from "./effects/elastic-distortion";
export type { ElasticDistortionProps } from "./effects/elastic-distortion";
export { ElasticEntrance } from "./effects/elastic-entrance";
export type { ElasticEntranceProps } from "./effects/elastic-entrance";
export { FlipReveal } from "./effects/flip-reveal";
export type { FlipRevealProps } from "./effects/flip-reveal";
export { FloatingLines } from "./effects/floating-lines";
export type { FloatingLinesProps } from "./effects/floating-lines";
export { GlitchShift } from "./effects/glitch-shift";
export type { GlitchShiftProps } from "./effects/glitch-shift";
export { GrandFinale } from "./effects/grand-finale";
export type { GrandFinaleProps } from "./effects/grand-finale";
export { HoverShuffle } from "./effects/hover-shuffle";
export type { HoverShuffleProps } from "./effects/hover-shuffle";
export { InkSpread } from "./effects/ink-spread";
export type { InkSpreadProps } from "./effects/ink-spread";
export { Jitter } from "./effects/jitter";
export type { JitterProps } from "./effects/jitter";
export { KineticUnderline } from "./effects/kinetic-underline";
export type { KineticUnderlineProps } from "./effects/kinetic-underline";
export { LineLift } from "./effects/line-lift";
export type { LineLiftProps } from "./effects/line-lift";
export { LiquidType } from "./effects/liquid-type";
export type { LiquidTypeProps } from "./effects/liquid-type";
export { MagneticLetters } from "./effects/magnetic-letters";
export type { MagneticLettersProps } from "./effects/magnetic-letters";
export { MaskWipe } from "./effects/mask-wipe";
export type { MaskWipeProps } from "./effects/mask-wipe";
export { MorphingHeadline } from "./effects/morphing-headline";
export type { MorphingHeadlineProps } from "./effects/morphing-headline";
export { NoiseReveal } from "./effects/noise-reveal";
export type { NoiseRevealProps } from "./effects/noise-reveal";
export { OrbitingWords } from "./effects/orbiting-words";
export type { OrbitingWordsProps } from "./effects/orbiting-words";
export { PendulumType } from "./effects/pendulum-type";
export type { PendulumTypeProps } from "./effects/pendulum-type";
export { PerspectiveBend } from "./effects/perspective-bend";
export type { PerspectiveBendProps } from "./effects/perspective-bend";
export { PixelDissolve } from "./effects/pixel-dissolve";
export type { PixelDissolveProps } from "./effects/pixel-dissolve";
export { ProximityWeight } from "./effects/proximity-weight";
export type { ProximityWeightProps } from "./effects/proximity-weight";
export { RippleType } from "./effects/ripple-type";
export type { RippleTypeProps } from "./effects/ripple-type";
export { RollingCharacters } from "./effects/rolling-characters";
export type { RollingCharactersProps } from "./effects/rolling-characters";
export { ScrambleText } from "./effects/scramble-text";
export type { ScrambleTextProps } from "./effects/scramble-text";
export { ScrollHighlight } from "./effects/scroll-highlight";
export type { ScrollHighlightProps } from "./effects/scroll-highlight";
export { ScrollScrub } from "./effects/scroll-scrub";
export type { ScrollScrubProps } from "./effects/scroll-scrub";
export { SliceShift } from "./effects/slice-shift";
export type { SliceShiftProps } from "./effects/slice-shift";
export { StackedEcho } from "./effects/stacked-echo";
export type { StackedEchoProps } from "./effects/stacked-echo";
export { StickyTypography } from "./effects/sticky-typography";
export type { StickyTypographyProps } from "./effects/sticky-typography";
export { StretchType } from "./effects/stretch-type";
export type { StretchTypeProps } from "./effects/stretch-type";
export { SvgPathText } from "./effects/svg-path-text";
export type { SvgPathTextProps } from "./effects/svg-path-text";
export { TextMarquee } from "./effects/text-marquee";
export type { TextMarqueeProps } from "./effects/text-marquee";
export { TextMaskVideo } from "./effects/text-mask-video";
export type { TextMaskVideoProps } from "./effects/text-mask-video";
export { TextTrail } from "./effects/text-trail";
export type { TextTrailProps } from "./effects/text-trail";
export { Typewriter } from "./effects/typewriter";
export type { TypewriterProps } from "./effects/typewriter";
export { VariableMorph } from "./effects/variable-morph";
export type { AxisPose, VariableMorphProps } from "./effects/variable-morph";
export { VerticalRollingHeadline } from "./effects/vertical-rolling-headline";
export type { VerticalRollingHeadlineProps } from "./effects/vertical-rolling-headline";
export { WaveText } from "./effects/wave-text";
export type { WaveTextProps } from "./effects/wave-text";
export { WordStagger } from "./effects/word-stagger";
export type { WordStaggerProps } from "./effects/word-stagger";
