@mod @mod_ableplayer
Feature: In a ableplayer instance
  As a student
  I need to check an ableplayer instance

  Background:
    Given the following "users" exist:
      | username | firstname | lastname | email                | idnumber |
      | teacher1 | Teacher   | 1        | teacher1@example.com | T1       |
      | student1 | Student   | 1        | student1@example.com | S1       |

    And the following "courses" exist:
      | fullname | shortname | category | enablecompletion |
      | Course 1 | C1        | 0        | 1                |
    And the following "course enrolments" exist:
      | user     | course | role           |
      | teacher1 | C1     | editingteacher |
      | student1 | C1     | student        |
    And the following "activity" exists:
      | activity                            | ableplayer                |
      | course                              | C1                        |
      | name                                | my first player           |
      | playlist                            | 0                         |
      | mode                                |                           |
      | lang                                |                           |
      | poster                              |                           |

  @javascript
  Scenario: Student view
    Given I am on the "Course 1" "course" page logged in as "student1"
    And I am on "Course 1" course homepage
    And I wait "10" seconds
    And I follow "my first player"
    Then I should see "my first player"
