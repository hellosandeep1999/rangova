---
name: Heritage Editorial Modern
colors:
  surface: '#fcf9f8'
  surface-dim: '#dcd9d9'
  surface-bright: '#fcf9f8'
  surface-container-lowest: '#ffffff'
  surface-container-low: '#f6f3f2'
  surface-container: '#f0eded'
  surface-container-high: '#eae7e7'
  surface-container-highest: '#e4e2e1'
  on-surface: '#1b1c1c'
  on-surface-variant: '#444748'
  inverse-surface: '#303030'
  inverse-on-surface: '#f3f0ef'
  outline: '#747878'
  outline-variant: '#c4c7c7'
  surface-tint: '#5f5e5e'
  primary: '#000000'
  on-primary: '#ffffff'
  primary-container: '#1c1b1b'
  on-primary-container: '#858383'
  inverse-primary: '#c8c6c5'
  secondary: '#5e5e5b'
  on-secondary: '#ffffff'
  secondary-container: '#e1dfdb'
  on-secondary-container: '#63635f'
  tertiary: '#000000'
  on-tertiary: '#ffffff'
  tertiary-container: '#3d0600'
  on-tertiary-container: '#d95d41'
  error: '#ba1a1a'
  on-error: '#ffffff'
  error-container: '#ffdad6'
  on-error-container: '#93000a'
  primary-fixed: '#e5e2e1'
  primary-fixed-dim: '#c8c6c5'
  on-primary-fixed: '#1c1b1b'
  on-primary-fixed-variant: '#474646'
  secondary-fixed: '#e4e2dd'
  secondary-fixed-dim: '#c8c6c2'
  on-secondary-fixed: '#1b1c19'
  on-secondary-fixed-variant: '#474744'
  tertiary-fixed: '#ffdad2'
  tertiary-fixed-dim: '#ffb4a3'
  on-tertiary-fixed: '#3d0600'
  on-tertiary-fixed-variant: '#86210a'
  background: '#fcf9f8'
  on-background: '#1b1c1c'
  surface-variant: '#e4e2e1'
  warm-ivory: '#F9F7F2'
  royal-maroon: '#5C1212'
  dusty-gold: '#C4A46D'
  soft-beige: '#E8E2D6'
  muted-terracotta: '#9B3018'
  surface-alt: '#F4F7F4'
typography:
  display-lg:
    fontFamily: Playfair Display
    fontSize: 72px
    fontWeight: '700'
    lineHeight: 84px
    letterSpacing: -0.02em
  display-lg-mobile:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '700'
    lineHeight: 56px
    letterSpacing: -0.01em
  headline-xl:
    fontFamily: Playfair Display
    fontSize: 48px
    fontWeight: '500'
    lineHeight: 56px
  headline-lg:
    fontFamily: Playfair Display
    fontSize: 32px
    fontWeight: '500'
    lineHeight: 40px
  headline-sm:
    fontFamily: Playfair Display
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
  body-lg:
    fontFamily: Manrope
    fontSize: 18px
    fontWeight: '400'
    lineHeight: 28px
  body-md:
    fontFamily: Manrope
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
  label-caps:
    fontFamily: Manrope
    fontSize: 12px
    fontWeight: '700'
    lineHeight: 16px
    letterSpacing: 0.1em
  price-lg:
    fontFamily: Manrope
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 24px
spacing:
  unit: 8px
  container-max: 1440px
  gutter: 24px
  margin-desktop: 64px
  margin-mobile: 20px
  section-gap: 120px
---

## Brand & Style

This design system embodies the intersection of ancestral Indian craftsmanship and contemporary minimalism. The aesthetic is categorized as **Editorial Luxury**, drawing heavy inspiration from high-fashion print magazines. It prioritizes vast negative space, intentional asymmetry, and a sophisticated "less is more" approach to D2C commerce.

The target audience is the discerning modern woman who appreciates the tactile nature of Jaipur-inspired textiles but lives a global, digitally-connected lifestyle. The UI should feel like a curated gallery experience—quiet, confident, and premium—allowing the photography of the garments to serve as the primary visual driver.

## Colors

The palette is anchored by **Warm Ivory (#F9F7F2)**, which provides a softer, more organic feel than pure white, mimicking high-quality cardstock or linen. **Deep Black (#111111)** provides the architectural skeleton of the site through typography and borders.

Accents are used with extreme restraint. **Muted Terracotta** and **Royal Maroon** serve as functional highlights for sale indicators or primary calls to action, while **Dusty Gold** is reserved for subtle decorative elements or premium loyalty indicators. The color strategy focuses on high contrast between text and background to maintain an expensive, legible feel.

## Typography

The typographic hierarchy utilizes **Playfair Display** for headlines to evoke a sense of heritage and luxury. Large display sizes should use tighter letter spacing to create a high-fashion "lockup" feel. 

**Manrope** serves as the functional workhorse for body text and navigation. Its modern, geometric construction balances the romanticism of the serif. For a premium touch, use the `label-caps` style for category headers, navigation items, and micro-copy, ensuring generous letter spacing to enhance readability and "airiness."

## Layout & Spacing

This design system uses a **12-column fixed grid** on desktop, centered within the viewport. The philosophy is "excessive padding"—allowing elements to breathe significantly more than standard e-commerce layouts. 

Sections should be separated by a `section-gap` of 120px to create distinct mental chapters for the user. On mobile, the grid shifts to 2 columns with reduced margins, but maintains the generous vertical rhythm. Images should often break the grid or use offset positioning to mimic a magazine spread.

## Elevation & Depth

Depth is achieved through **Tonal Layering** and **Soft Ambient Shadows** rather than traditional elevation levels. 

- **Surfaces:** Most containers are flat against the Warm Ivory background. Depth is created by placing white (#FFFFFF) cards slightly above the ivory base.
- **Shadows:** Use extremely diffused shadows (Blur: 40px, Opacity: 4%, Color: #111111) to give the impression of paper resting on a table.
- **Overlays:** When using modals or quick-buy drawers, use a semi-transparent blur (Backdrop-filter: blur(8px)) to maintain the ethereal, light-filled atmosphere of the brand.

## Shapes

The design system employs **Sharp (0px)** roundedness across all primary elements. Rectangular buttons, hard-edged images, and square input fields reinforce the architectural and high-fashion "editorial" look. 

The only exception is for functional iconography or specialized "Curated Collection" badges which may use a circular (pill) form to provide a focal point against the rigid grid.

## Components

- **Buttons:** Primary buttons are solid Deep Black with white text, no border-radius, and a subtle "grow" effect on hover. Secondary buttons use a 1px Deep Black border with a transparent background.
- **Product Cards:** No borders or shadows by default. The focus is on a large, high-aspect-ratio image (3:4). Typography (Title and Price) should be left-aligned and minimal.
- **Input Fields:** Bottom-border only (underline style) for a cleaner, more minimalist appearance in forms and newsletters.
- **Chips/Badges:** Small, uppercase text without containers, or using a very light Soft Beige background.
- **Navigation:** Top-tier navigation uses `label-caps` typography. The hover state is a simple opacity change or a 1px underline that slides in from the left.
- **Lookbook Slider:** A custom component featuring full-width imagery with overlapping Playfair Display typography to showcase seasonal collections.