Feature: Public navigation

  @smoke @navigation @public
  Scenario Outline: Public page opens successfully
    When I open the "<page>" page
    Then the "<page>" page should be ready

    Examples:
      | page  |
      | home  |
      | about |
