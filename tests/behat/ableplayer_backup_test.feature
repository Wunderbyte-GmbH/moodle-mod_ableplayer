@core @core_backup
Feature: Duplicate ableplayer activity
  In order to set up my course contents quickly
  As a teacher with editing permissions
  I need to duplicate activities inside the same course

  Scenario: Duplicate an ableplayer
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
    And the following config values are set as admin:
      | backup_import_activities | 0 | backup |
    And I log in as "teacher1"
    And I am on "Course 1" course homepage with editing mode on
    And I duplicate "my first ableplayer" activity
    And I should see "my first ableplayer (copy)"
    #And I wait until section "1" is available
    #And I click on "Edit settings" "link" in the "Test database name" activity
    #And I set the following fields to these values:
      #| Name | Original database name |
    #And I press "Save and return to course"
    #And I click on "Edit settings" "link" in the "Test database name (copy)" activity
    #And I set the following fields to these values:
      #| Name | Duplicated database name |
      #| Description | Duplicated database description |
    #And I press "Save and return to course"
    #Then I should see "Original database name" in the "Topic 1" "section"
    #And I should see "Duplicated database name" in the "Topic 1" "section"
    #And "Original database name" "link" should appear before "Duplicated database name" "link"

