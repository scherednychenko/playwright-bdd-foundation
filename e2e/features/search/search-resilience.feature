Feature: Search resilience

  # Uses network interception (page.route) to simulate a failing backend, so the
  # UI's error handling is verified deterministically and in isolation.
  @smoke @search @network
  Scenario: Shows an error message when the search API is unavailable
    Given the search API is unavailable
    When I open the search page
    And I search for "report"
    Then I should see an error message
