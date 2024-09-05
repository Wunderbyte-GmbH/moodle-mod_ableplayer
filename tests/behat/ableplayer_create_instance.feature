@mod @mod_ableplayer
Feature: In a ableplayer instance
  As a teacher with editing permissions
  I need to set up an ableplayer instance
  I should be able to add an activity anywhere in a section

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

  @javascript
  Scenario: Add an AblePlayer activity to a course
    Given I log in as "teacher1"
    And I am on "Course 1" course homepage with editing mode on
    And I wait until the page is ready
    And I click on "Add an activity or resource" "button" in the "General" "section"
    And I follow "AblePlayer"
    And I set the field "AblePlayer name" to "My AblePlayer Activity"
    And I press "Save and return to course"
    Then I should see "My AblePlayer Activity" in the "General" "section"
