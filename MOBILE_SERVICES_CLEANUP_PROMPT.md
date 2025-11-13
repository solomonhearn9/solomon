# Mobile Services Section Typography Cleanup

## Objective
Clean up the services card section typography and spacing for mobile devices (max-width: 768px) only. The current implementation feels too text-heavy due to lack of visual hierarchy and poor spacing choices. The goal is to create an incredibly clean, breathable mobile experience.

## Current Issues
- Text elements lack clear visual hierarchy
- Insufficient spacing between elements creates a cramped, text-heavy feel
- Typography sizes and weights don't create enough distinction between content levels
- The "Expert" label and services list need better separation and breathing room

## Requirements

### Typography Hierarchy (Mobile Only)
1. **Eyebrow ("Services")**
   - Reduce font size to create clear distinction as supporting text
   - Increase letter-spacing slightly for better readability
   - Reduce opacity/color contrast to make it feel secondary
   - Add more bottom margin to create separation from headline

2. **Main Headline ("Every Detail, Perfectly Designed to Last.")**
   - Increase font size significantly to establish dominance
   - Adjust line-height for better mobile readability (slightly tighter)
   - Add generous top margin to create clear separation from eyebrow
   - Ensure proper spacing below headline before tagline

3. **Tagline Paragraph**
   - Reduce font size relative to headline (clear secondary level)
   - Increase line-height for better readability on small screens
   - Add substantial top margin to create breathing room from headline
   - Consider slightly reducing opacity/color contrast to feel less prominent
   - Potentially reduce max-width to prevent overly long lines

4. **"Expert" Label**
   - Reduce font size to feel more subtle
   - Increase spacing between label and services list
   - Consider reducing opacity slightly

5. **Services List Items**
   - Increase spacing between list items (gap)
   - Adjust font sizes to create better hierarchy with active vs inactive states
   - Ensure active items have clear visual prominence
   - Add more padding/breathing room around each item

### Spacing Improvements (Mobile Only)
- Increase vertical spacing between all major sections (eyebrow → headline → tagline → expertise section)
- Add more padding inside the services card container
- Increase gap between "Expert" label and services list
- Add more spacing between individual service items
- Ensure consistent spacing rhythm throughout

### Visual Refinements (Mobile Only)
- Ensure text colors create clear hierarchy (headline brightest, supporting text progressively dimmer)
- Adjust opacity values to create depth without feeling heavy
- Consider subtle adjustments to letter-spacing for better mobile readability
- Ensure all text remains readable and accessible

## Implementation Notes
- All changes should be scoped to `@media (max-width: 768px)` only
- Maintain desktop styling unchanged
- Use clamp() functions for responsive sizing
- Test on actual mobile viewport sizes
- Ensure touch targets remain accessible
- Maintain existing animations and interactions

## Files to Modify
- `/app/globals.css` - Add mobile-specific typography and spacing rules
- `/components/ui/services-typing-content.tsx` - May need minor adjustments if conditional rendering is needed

## Success Criteria
- The section feels breathable and clean on mobile devices
- Clear visual hierarchy guides the eye naturally
- Text doesn't feel overwhelming or cramped
- Professional, polished appearance
- Maintains all existing functionality and animations

