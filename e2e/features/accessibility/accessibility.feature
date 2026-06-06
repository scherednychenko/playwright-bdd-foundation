Feature: Accessibility

  # Automated WCAG 2.1 A/AA checks via axe-core. Catches a meaningful class of
  # regressions early; it complements, but does not replace, manual a11y review.
  @smoke @a11y
  Scenario Outline: Public pages have no critical accessibility violations
    When I open the "<page>" page
    Then the "<page>" page has no critical accessibility violations

    Examples:
      | page   |
      | home   |
      | about  |
      | search |
