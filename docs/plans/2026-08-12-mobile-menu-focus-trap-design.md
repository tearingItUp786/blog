# Mobile Menu Focus Trap Design

## Goal

Keep keyboard focus within the open mobile navigation so users cannot tab into
the search control, home link, or page content behind the full-screen menu.

## Design

Use `focus-trap-react` rather than maintaining custom tabbable-element logic.
The trap will cover the mobile menu panel and its close button, activate only
while the menu is open, and move initial focus to the first navigation link.

Pressing Escape will close the menu. Closing by Escape, the close button, or
another non-navigation path will restore focus to the hamburger trigger. Route
navigation will retain the existing location-driven close behavior without
forcing focus back to a control on the previous page.

The hamburger will expose `aria-controls` for the menu panel, and the panel will
be a labeled navigation landmark. Desktop navigation will remain outside the
focus trap and preserve its existing behavior.

## Testing

Add component-level DOM tests that verify initial focus, forward and backward
focus wrapping, Escape behavior, focus restoration, and the trigger/panel ARIA
relationship. Retain the existing stacking regression test. Run the targeted
test, lint, typecheck, and the full test suite after implementation.
