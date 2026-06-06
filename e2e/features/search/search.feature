Feature: Search

  @smoke @search
  Scenario: Searching returns matching results
    When I open the search page
    And I search for "report"
    Then I should see "Reports" in the results

  @smoke @search
  Scenario: Searching for an unknown term shows a no-results message
    When I open the search page
    And I search for "no-such-thing"
    Then I should see a no-results message
